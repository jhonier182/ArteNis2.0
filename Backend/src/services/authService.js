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

  // Verificar si un username existe y generar uno único (NO BLOQUEANTE)
  static async generateUniqueUsername(fullName) {
    return new Promise((resolve) => {
      // Usar setImmediate para evitar bloquear el event loop
      setImmediate(async () => {
        try {
          let baseUsername = this.generateUsername(fullName);
          let username = baseUsername;
          let counter = 1;
          
          // OPTIMIZACIÓN: Limitar intentos para evitar bucles infinitos
          const maxAttempts = 10;
          let attempts = 0;
          
          while (attempts < maxAttempts) {
            try {
              const existingUser = await User.findOne({
                where: { username },
                attributes: ['id'],
                limit: 1 // Optimización: solo necesitamos saber si existe
              });
              
              if (!existingUser) {
                // Username disponible
                setImmediate(() => {
                  resolve(username);
                });
                return;
              }
              
              // Username ocupado, generar siguiente
              username = `${baseUsername}${counter}`;
              counter++;
              attempts++;
              
              // Pequeña pausa para no sobrecargar la DB
              if (attempts % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
              }
            } catch (error) {
              // Error silencioso - usar fallback
              setImmediate(() => {
                resolve(`${baseUsername}${Date.now()}`);
              });
              return;
            }
          }
          
          // Si llegamos aquí, usar timestamp como fallback
          setImmediate(() => {
            resolve(`${baseUsername}${Date.now()}`);
          });
        } catch (error) {
          // Error silencioso - usar fallback
          setImmediate(() => {
            resolve(`user${Date.now()}`);
          });
        }
      });
    });
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
  // Registrar nuevo usuario (COMPLETAMENTE NO BLOQUEANTE)
  static async register(userData) {
    return new Promise((resolve) => {
      // Usar setImmediate para evitar bloquear el event loop
      setImmediate(async () => {
        try {
          // Verificar si el email ya existe
          const existingUser = await User.findOne({ 
            where: { email: userData.email },
            attributes: ['id'],
            limit: 1 // Optimización: solo necesitamos saber si existe
          });
          
          if (existingUser) {
            setImmediate(() => {
              resolve({ error: 'El email ya está en uso' });
            });
            return;
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

          // Generar tokens de forma no bloqueante
          const accessToken = this.generateToken(user);
          const { raw: refreshToken, expiresAt: refreshExpiresAt } = await this.createRefreshToken(
            user,
            userData.userAgent,
            userData.ip
          );

          const result = {
            user: user.toJSON(),
            token: accessToken,
            refreshToken,
            refreshExpiresAt,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          };

          // Usar setImmediate para la respuesta final
          setImmediate(() => {
            resolve(result);
          });
        } catch (error) {
          // Error silencioso - devolver error
          setImmediate(() => {
            resolve({ error: error.message || 'Error en el registro' });
          });
        }
      });
    });
  }

  // Iniciar sesión (COMPLETAMENTE NO BLOQUEANTE)
  static async login(identifier, password) {
    return new Promise((resolve) => {
      // Usar setImmediate para evitar bloquear el event loop
      setImmediate(async () => {
        try {
          // Buscar usuario por email o username
          const user = await User.findByEmailOrUsername(identifier);
          
          if (!user) {
            setImmediate(() => {
              resolve({ error: 'Credenciales inválidas' });
            });
            return;
          }

          if (!user.isActive) {
            setImmediate(() => {
              resolve({ error: 'Cuenta desactivada' });
            });
            return;
          }

          // Verificar contraseña
          const isValidPassword = await user.validatePassword(password);
          if (!isValidPassword) {
            setImmediate(() => {
              resolve({ error: 'Credenciales inválidas' });
            });
            return;
          }

          // Actualizar último login de forma no bloqueante
          await user.updateLastLogin();

          // Generar tokens de forma no bloqueante
          const accessToken = this.generateToken(user);
          const { raw: refreshToken, expiresAt: refreshExpiresAt } = await this.createRefreshToken(
            user,
            null,
            null
          );

          const result = {
            user: user.toJSON(),
            token: accessToken,
            refreshToken,
            refreshExpiresAt,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          };

          // Usar setImmediate para la respuesta final
          setImmediate(() => {
            resolve(result);
          });
        } catch (error) {
          // Error silencioso - devolver error
          setImmediate(() => {
            resolve({ error: error.message || 'Error en el login' });
          });
        }
      });
    });
  }

  // Refrescar token
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
