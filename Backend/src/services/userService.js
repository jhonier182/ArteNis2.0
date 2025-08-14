const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Follow, Post, RefreshToken } = require('../models');
const { sequelize } = require('../config/db');
const { uploadAvatar: cloudinaryUploadAvatar, deleteAvatar } = require('../config/cloudinary');

class UserService {
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
      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmailOrUsername(userData.email);
      if (existingUser) {
        throw new Error('El email o nombre de usuario ya está en uso');
      }

      // Crear nuevo usuario
      const user = await User.create({
        username: userData.username,
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

  // Obtener usuario por ID
  static async getUserById(userId, requesterId = null) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Post,
            as: 'posts',
            where: { isPublic: true },
            required: false,
            limit: 6,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si hay un solicitante, verificar si lo sigue
      let isFollowing = false;
      if (requesterId && requesterId !== userId) {
        isFollowing = await Follow.isFollowing(requesterId, userId);
      }

      return {
        ...user.toJSON(),
        isFollowing,
        postsPreview: user.posts || []
      };
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuarios
  static async searchUsers(searchParams) {
    try {
      const {
        q = '',
        type = 'all',
        location,
        verified,
        premium,
        sortBy = 'followers',
        order = 'desc',
        page = 1,
        limit = 20
      } = searchParams;

      const offset = (page - 1) * limit;
      const where = {};

      // Filtro por texto de búsqueda
      if (q) {
        where[Op.or] = [
          { username: { [Op.like]: `%${q}%` } },
          { fullName: { [Op.like]: `%${q}%` } },
          { bio: { [Op.like]: `%${q}%` } }
        ];
      }

      // Filtro por tipo de usuario
      if (type !== 'all') {
        where.userType = type;
      }

      // Filtro por ubicación
      if (location) {
        where.location = { [Op.like]: `%${location}%` };
      }

      // Filtro por verificación
      if (verified !== undefined) {
        where.isVerified = verified;
      }

      // Filtro por premium
      if (premium !== undefined) {
        where.isPremium = premium;
      }

      // Solo usuarios activos
      where.isActive = true;

      // Ordenamiento
      const orderBy = [];
      switch (sortBy) {
        case 'followers':
          orderBy.push(['followersCount', order.toUpperCase()]);
          break;
        case 'posts':
          orderBy.push(['postsCount', order.toUpperCase()]);
          break;
        case 'created':
          orderBy.push(['createdAt', order.toUpperCase()]);
          break;
        case 'username':
          orderBy.push(['username', order.toUpperCase()]);
          break;
        default:
          orderBy.push(['followersCount', 'DESC']);
      }

      const users = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: orderBy,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        users: users.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Seguir usuario
  static async followUser(followerId, followingId) {
    try {
      if (followerId === followingId) {
        throw new Error('No puedes seguirte a ti mismo');
      }

      // Verificar que el usuario a seguir existe
      const userToFollow = await User.findByPk(followingId);
      if (!userToFollow) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si ya lo sigue
      const existingFollow = await Follow.findOne({
        where: { followerId, followingId }
      });

      if (existingFollow) {
        throw new Error('Ya sigues a este usuario');
      }

      // Crear la relación de seguimiento
      await sequelize.transaction(async (t) => {
        await Follow.create({ followerId, followingId }, { transaction: t });

        // Incrementar contadores
        await User.increment('followersCount', {
          where: { id: followingId },
          transaction: t
        });

        await User.increment('followingCount', {
          where: { id: followerId },
          transaction: t
        });
      });

      return { message: 'Usuario seguido exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  // Dejar de seguir usuario
  static async unfollowUser(followerId, followingId) {
    try {
      const follow = await Follow.findOne({
        where: { followerId, followingId }
      });

      if (!follow) {
        throw new Error('No sigues a este usuario');
      }

      // Eliminar la relación de seguimiento
      await sequelize.transaction(async (t) => {
        await follow.destroy({ transaction: t });

        // Decrementar contadores
        await User.decrement('followersCount', {
          where: { id: followingId },
          transaction: t
        });

        await User.decrement('followingCount', {
          where: { id: followerId },
          transaction: t
        });
      });

      return { message: 'Has dejado de seguir al usuario' };
    } catch (error) {
      throw error;
    }
  }

  // Subir avatar del usuario
  static async uploadAvatar(userId, imageBuffer) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si el usuario ya tiene avatar, eliminar el anterior
      if (user.avatar && user.cloudinaryPublicId) {
        await deleteAvatar(user.cloudinaryPublicId);
      }

      // Subir nueva imagen a Cloudinary
      const { url, publicId } = await cloudinaryUploadAvatar(imageBuffer, userId);

      // Actualizar usuario con nueva URL de avatar
      await user.update({
        avatar: url,
        cloudinaryPublicId: publicId
      });

      return {
        user: user.toJSON(),
        avatarUrl: url,
        message: 'Avatar actualizado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar perfil de usuario
  static async updateProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Campos permitidos para actualización
      const allowedFields = [
        'fullName', 'bio', 'phone', 'city', 'state', 'country',
        'studioName', 'studioAddress', 'pricePerHour', 'experience', 'specialties'
      ];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      });

      // Actualizar usuario
      await user.update(updateData);

      return {
        user: user.toJSON(),
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
