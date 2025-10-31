const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, RefreshToken, Token } = require('../models');

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

  // Cambiar contraseña
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Validar nueva contraseña
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Actualizar contraseña (el hook de User model la hashea automáticamente)
    user.password = newPassword;
    await user.save();

    return { message: 'Contraseña actualizada exitosamente' };
  }

  // Generar token para verificación/reset
  static generateTokenValue() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Crear token de verificación/reset
  static async createToken(userId, type, expiresInHours = 24) {
    const { Op } = require('sequelize');
    
    // Invalidar tokens anteriores del mismo tipo
    await Token.update(
      { usedAt: new Date() },
      { where: { userId, type, usedAt: null } }
    );

    const tokenValue = this.generateTokenValue();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await Token.create({
      userId,
      token: tokenValue,
      type,
      expiresAt
    });

    return tokenValue;
  }

  // Solicitar restablecimiento de contraseña
  // NOTA: Requiere configuración de servicio de email (Nodemailer, SendGrid, etc.)
  static async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    
    // Por seguridad, siempre retornar éxito aunque el email no exista
    if (!user) {
      return { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña' };
    }

    // Generar token de reset usando el modelo Token
    const token = await this.createToken(user.id, 'password_reset', 1); // 1 hora de validez

    // TODO: Enviar email con el token
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    // Por ahora, retornar mensaje (en producción, nunca exponer el token)
    if (process.env.NODE_ENV === 'development') {
      return { 
        message: 'Token de reset generado (solo en desarrollo)',
        token: token // Solo en desarrollo
      };
    }

    return { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña' };
  }

  // Restablecer contraseña con token
  static async resetPassword(tokenValue, newPassword) {
    if (!tokenValue) {
      throw new Error('Token de restablecimiento requerido');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const tokenRecord = await Token.findValidToken(tokenValue, 'password_reset');
    
    if (!tokenRecord) {
      throw new Error('Token inválido o expirado');
    }

    if (tokenRecord.isExpired()) {
      await tokenRecord.destroy();
      throw new Error('Token expirado');
    }

    if (tokenRecord.isUsed()) {
      throw new Error('Token ya utilizado');
    }

    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Marcar token como usado
    await tokenRecord.markAsUsed();

    // Revocar todos los refresh tokens
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } });

    return { message: 'Contraseña restablecida exitosamente' };
  }

  // Generar token de verificación de email
  static async generateEmailVerificationToken(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.isVerified) {
      throw new Error('El email ya está verificado');
    }

    const token = await this.createToken(user.id, 'email_verification', 48); // 48 horas de validez

    // TODO: Enviar email con el token
    // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    // await sendVerificationEmail(user.email, verificationUrl);

    if (process.env.NODE_ENV === 'development') {
      return { 
        message: 'Token de verificación generado (solo en desarrollo)',
        token: token // Solo en desarrollo
      };
    }

    return { message: 'Email de verificación enviado' };
  }

  // Verificar email con token
  static async verifyEmail(tokenValue) {
    const { Op } = require('sequelize');
    
    if (!tokenValue) {
      throw new Error('Token de verificación requerido');
    }

    const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
    const tokenRecord = await Token.findOne({
      where: {
        tokenHash,
        type: 'email_verification',
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() }
      }
    });
    
    if (!tokenRecord) {
      throw new Error('Token inválido o expirado');
    }

    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Marcar email como verificado
    user.isVerified = true;
    await user.save();

    // Marcar token como usado
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    return { message: 'Email verificado exitosamente' };
  }

  // Reenviar verificación de email
  static async resendVerificationEmail(userId) {
    return await this.generateEmailVerificationToken(userId);
  }

  // Obtener sesiones activas (refresh tokens activos)
  static async getActiveSessions(userId) {
    const { Sequelize } = require('sequelize');
    const sessions = await RefreshToken.findAll({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { [Sequelize.Op.gt]: new Date() }
      },
      attributes: ['id', 'userAgent', 'ip', 'createdAt', 'expiresAt'],
      order: [['createdAt', 'DESC']]
    });

    return sessions.map(session => ({
      id: session.id,
      userAgent: session.userAgent || 'Unknown',
      ip: session.ip || 'Unknown',
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: false // Se puede determinar comparando con el refresh token actual
    }));
  }

  // Cerrar todas las sesiones excepto la actual
  static async logoutOtherSessions(userId, currentRefreshTokenRaw = null) {
    const { Sequelize } = require('sequelize');
    const whereClause = {
      userId,
      revokedAt: null
    };

    // Si hay un token actual, excluirlo de la revocación
    if (currentRefreshTokenRaw) {
      const currentHash = crypto.createHash('sha256').update(currentRefreshTokenRaw).digest('hex');
      whereClause.tokenHash = { [Sequelize.Op.ne]: currentHash };
    }

    await RefreshToken.update({ revokedAt: new Date() }, { where: whereClause });

    return { message: 'Sesiones cerradas exitosamente' };
  }

  // Eliminar cuenta de usuario
  static async deleteAccount(userId, password) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta');
    }

    // Revocar todos los tokens
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
    
    // Marcar cuenta como inactiva en lugar de eliminar (soft delete)
    user.isActive = false;
    await user.save();

    return { message: 'Cuenta eliminada exitosamente' };
  }
}

module.exports = AuthService;
