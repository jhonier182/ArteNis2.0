const { User, Follow } = require('../models');
const { sequelize } = require('../config/db');
const NodeCache = require('node-cache');

// Cache específico para follows
const followCache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 120,
  useClones: false
});

class FollowService {
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

      // OPTIMIZACIÓN: Invalidar cache de follows
      this.invalidateFollowCache(followerId);

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

      // OPTIMIZACIÓN: Invalidar cache de follows
      this.invalidateFollowCache(followerId);

      return { message: 'Has dejado de seguir al usuario' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuarios que sigues (ULTRA OPTIMIZADO CON CACHE)
  static async getFollowingUsers(userId) {
    try {
      // OPTIMIZACIÓN 1: Verificar cache primero
      const cacheKey = `following:${userId}`;
      const cachedData = followCache.get(cacheKey);
      
      if (cachedData) {
        console.log(`📦 Cache hit para following de usuario ${userId}`);
        return cachedData;
      }

      // OPTIMIZACIÓN 2: Eliminar consulta innecesaria de verificación de usuario
      // OPTIMIZACIÓN 3: Consulta optimizada con JOIN manual
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
      followCache.set(cacheKey, followingUsers, 300); // 5 minutos
      console.log(`💾 Guardando following en cache: ${cacheKey}`);

      return followingUsers;
    } catch (error) {
      console.error('Error obteniendo usuarios seguidos:', error);
      throw error;
    }
  }

  // Invalidar cache de follows cuando se sigue/deja de seguir
  static invalidateFollowCache(userId) {
    const keys = followCache.keys();
    const userKeys = keys.filter(key => key.includes(`following:${userId}`));
    followCache.del(userKeys);
    console.log(`🗑️ Cache de follows invalidado para usuario ${userId}`);
  }
}

module.exports = FollowService;
