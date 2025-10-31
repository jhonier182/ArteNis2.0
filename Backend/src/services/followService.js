const { User, Follow } = require('../models');
const { sequelize } = require('../config/db');
const cache = require('memory-cache');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

class FollowService {
  // Seguir usuario
  static async followUser(followerId, followingId) {
    try {
      logger.info('Verificando seguimiento', { followerId, followingId });
      
      if (followerId === followingId) {
        throw new BadRequestError('No puedes seguirte a ti mismo');
      }

      // Verificar que el usuario a seguir existe
      const userToFollow = await User.findByPk(followingId, {
        attributes: ['id']
      });
      
      if (!userToFollow) {
        throw new NotFoundError('Usuario no encontrado');
      }

      // Verificar si ya lo sigue
      const existingFollow = await Follow.findOne({
        where: { followerId, followingId },
        attributes: ['id']
      });

      if (existingFollow) {
        throw new ConflictError('Ya sigues a este usuario');
      }

      // Crear la relación de seguimiento usando transacción
      await sequelize.transaction(async (t) => {
        await Follow.create({ followerId, followingId }, { transaction: t });

        // Incrementar contadores de forma eficiente
        await Promise.all([
          User.increment('followersCount', {
            where: { id: followingId },
            transaction: t
          }),
          User.increment('followingCount', {
            where: { id: followerId },
            transaction: t
          })
        ]);
      });

      // OPTIMIZACIÓN: Invalidar cache de follows
      this.invalidateFollowCache(followerId);

      logger.info('Usuario seguido exitosamente', { followerId, followingId });
      
      return { message: 'Usuario seguido exitosamente' };
    } catch (error) {
      logger.error('Error al seguir usuario', {
        followerId,
        followingId,
        error: error.message
      });
      throw error;
    }
  }

  // Dejar de seguir usuario
  static async unfollowUser(followerId, followingId) {
    try {
      logger.info('Intentando dejar de seguir', { followerId, followingId });
      
      const follow = await Follow.findOne({
        where: { followerId, followingId }
      });

      if (!follow) {
        throw new NotFoundError('No sigues a este usuario');
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

      // OPTIMIZACIÓN: Invalidar cache de follows
      this.invalidateFollowCache(followerId);

      logger.info('Usuario dejado de seguir exitosamente', { followerId, followingId });
      
      return { message: 'Has dejado de seguir al usuario' };
    } catch (error) {
      logger.error('Error al dejar de seguir usuario', {
        followerId,
        followingId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Verificar si sigues a un usuario específico
  static async checkFollowingStatus(followerId, followingId) {
    try {
      const follow = await Follow.findOne({
        where: { followerId, followingId },
        attributes: ['id']
      });
      
      return !!follow;
    } catch (error) {
      logger.error('Error verificando estado de seguimiento', {
        followerId,
        followingId,
        error: error.message
      });
      throw error;
    }
  }

  // Obtener usuarios que sigues (ULTRA OPTIMIZADO CON CACHE)
  static async getFollowingUsers(userId) {
    try {
      // OPTIMIZACIÓN 1: Verificar cache primero
      const cacheKey = `following:${userId}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        logger.debug('Datos encontrados en caché', { userId, count: cachedData.length });
        return cachedData;
      }

      // Consulta optimizada
      const follows = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
      });

      if (follows.length === 0) {
        return [];
      }

      const followingIds = follows.map(follow => follow.followingId);
      
      // Obtener usuarios seguidos en una sola consulta
      const followingUsers = await User.findAll({
        where: { id: { [require('sequelize').Op.in]: followingIds } },
        attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified'],
        order: [['username', 'ASC']]
      });

      // OPTIMIZACIÓN 4: Guardar en cache
      cache.put(cacheKey, followingUsers, 300000); // 5 minutos en ms

      logger.info('Usuarios seguidos obtenidos', { userId, count: followingUsers.length });

      return followingUsers;
    } catch (error) {
      logger.error('Error obteniendo usuarios seguidos', {
        userId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Invalidar cache de follows cuando se sigue/deja de seguir
  static invalidateFollowCache(userId) {
    const keys = cache.keys();
    const targetKey = `following:${userId}`;
    
    const userKeys = [];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].includes(targetKey)) {
        userKeys.push(keys[i]);
      }
    }
    
    if (userKeys.length > 0) {
      cache.del(userKeys);
      logger.debug('Cache de follows invalidado', { userId, keysCount: userKeys.length });
    }
  }
}

module.exports = FollowService;
