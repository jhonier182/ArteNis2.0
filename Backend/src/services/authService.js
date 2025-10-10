const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, RefreshToken } = require('../models');

class AuthService {
  // Generar nombre de usuario automáticamente
  static generateUsername(fullName) {
    // Convertir a minúsculas, eliminar acentos y caracteres especiales
    const cleanName = fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .trim();
    
    // OPTIMIZACIÓN: Dividir en palabras y filtrar de forma más eficiente
    const words = [];
    const parts = cleanName.split(/\s+/);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length > 0) {
        words.push(parts[i]);
      }
    }
    let baseUsername = '';
    
    if (words.length >= 2) {
      // Tomar primera letra del primer nombre y apellido completo
      baseUsername = words[0].charAt(0) + words[words.length - 1];
    } else if (words.length === 1) {
      // Si solo hay una palabra, usar las primeras 6 letras
      baseUsername = words[0].substring(0, 6);
    } else {
      // Fallback si no hay palabras válidas
      baseUsername = 'user';
    }
    
    // Asegurar que tenga al menos 3 caracteres
    if (baseUsername.length < 3) {
      baseUsername = baseUsername + '123';
    }
    
    return baseUsername;
  }

  // Verificar si un username existe y generar uno único
  static async generateUniqueUsername(fullName) {
    let baseUsername = this.generateUsername(fullName);
    let username = baseUsername;
    let counter = 1;
    
    // Verificar si el username ya existe
    while (await User.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
      
      // Prevenir bucles infinitos
      if (counter > 999) {
        username = `${baseUsername}${Date.now()}`;
        break;
      }
    }
    
    return username;
  }

  // Generar JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.userType,
        isPremium: user.isPremiumActive()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static generateRefreshTokenValue() {
    return crypto.randomBytes(48).toString('hex');
  }

  static async createRefreshToken(user, userAgent, ip) {
    const raw = this.generateRefreshTokenValue();
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const ttlDays = parseInt(process.env.REFRESH_TOKEN_DAYS || '30');
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: user.id,
      tokenHash: hash,
      userAgent: userAgent?.slice(0, 255),
      ip: ip?.slice(0, 64),
      expiresAt
    });

    return { raw, expiresAt };
  }

  static async rotateRefreshToken(oldRawToken, userAgent, ip) {
    const oldHash = crypto.createHash('sha256').update(oldRawToken).digest('hex');
    const existing = await RefreshToken.findOne({ where: { tokenHash: oldHash, revokedAt: null } });
    if (!existing) throw new Error('Refresh token inválido');
    if (existing.expiresAt < new Date()) throw new Error('Refresh token expirado');

    // Revocar anterior
    existing.revokedAt = new Date();
    await existing.save();

    // Emitir nuevo
    const user = await User.findByPk(existing.userId);
    if (!user) throw new Error('Usuario no encontrado');
    return this.createRefreshToken(user, userAgent, ip);
  }

  // Registrar nuevo usuario
  static async register(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('El email ya está en uso');
      }

      // Generar nombre de usuario automáticamente
      const username = await this.generateUniqueUsername(userData.fullName);

      // Crear nuevo usuario
      const user = await User.create({
        username: username,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        userType: userData.userType || 'user',
        phone: userData.phone,
        location: userData.location,
        bio: userData.bio
      });

      // Generar tokens
      const accessToken = this.generateToken(user);
      const { raw: refreshToken, expiresAt: refreshExpiresAt } = await this.createRefreshToken(
        user,
        userData.userAgent,
        userData.ip
      );

      return {
        user: user.toJSON(),
        token: accessToken,
        refreshToken,
        refreshExpiresAt,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      throw error;
    }
  }

  // Iniciar sesión
  static async login(identifier, password) {
    try {
      // Buscar usuario por email o username
      const user = await User.findByEmailOrUsername(identifier);
      
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      if (!user.isActive) {
        throw new Error('Cuenta desactivada');
      }

      // Verificar contraseña
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Actualizar último login
      await user.updateLastLogin();

      // Generar tokens
      const accessToken = this.generateToken(user);
      const { raw: refreshToken, expiresAt: refreshExpiresAt } = await this.createRefreshToken(
        user,
        null,
        null
      );

      return {
        user: user.toJSON(),
        token: accessToken,
        refreshToken,
        refreshExpiresAt,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      throw error;
    }
  }

  static async refresh(refreshTokenRaw, userAgent, ip) {
    const { raw, expiresAt } = await this.rotateRefreshToken(refreshTokenRaw, userAgent, ip);
    const tokenRow = await RefreshToken.findOne({ where: { tokenHash: crypto.createHash('sha256').update(raw).digest('hex') } });
    const user = await User.findByPk(tokenRow.userId);
    const accessToken = this.generateToken(user);
    return {
      user: user.toJSON(),
      token: accessToken,
      refreshToken: raw,
      refreshExpiresAt: expiresAt,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
  }

  static async revokeRefreshTokens(userId, refreshTokenRaw = null) {
    if (refreshTokenRaw) {
      const hash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
      const token = await RefreshToken.findOne({ where: { tokenHash: hash, revokedAt: null } });
      if (token && token.userId === userId) {
        token.revokedAt = new Date();
        await token.save();
      }
      return { message: 'Refresh token revocado' };
    }
    // Revocar todos los tokens del usuario
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
    return { message: 'Todos los refresh tokens del usuario han sido revocados' };
  }
}

module.exports = AuthService;
