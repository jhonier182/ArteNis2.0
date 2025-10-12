const { User, Follow } = require('../models');
const { sequelize } = require('../config/db');
const cache = require('memory-cache');

class FollowService {
  // Seguir usuario (COMPLETAMENTE NO BLOQUEANTE)
  static async followUser(followerId, followingId) {
    return new Promise((resolve) => {
      // Usar setImmediate para evitar bloquear el event loop
      setImmediate(async () => {
        try {
          console.log(`🔍 FollowService: Verificando seguimiento ${followerId} -> ${followingId}`);
          
          if (followerId === followingId) {
            console.log(`❌ FollowService: Usuario intentando seguirse a sí mismo`);
            setImmediate(() => {
              resolve({ error: 'No puedes seguirte a ti mismo' });
            });
            return;
          }

          // Verificar que el usuario a seguir existe
          const userToFollow = await User.findByPk(followingId, {
            attributes: ['id'],
            limit: 1 // Optimización: solo necesitamos saber si existe
          });
          
          if (!userToFollow) {
            console.log(`❌ FollowService: Usuario a seguir no encontrado: ${followingId}`);
            setImmediate(() => {
              resolve({ error: 'Usuario no encontrado' });
            });
            return;
          }

          // Verificar si ya lo sigue
          const existingFollow = await Follow.findOne({
            where: { followerId, followingId },
            attributes: ['id'],
            limit: 1 // Optimización: solo necesitamos saber si existe
          });

          if (existingFollow) {
            console.log(`❌ FollowService: Usuario ya está siendo seguido`);
            setImmediate(() => {
              resolve({ error: 'Ya sigues a este usuario' });
            });
            return;
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

          const result = { message: 'Usuario seguido exitosamente' };

          // Usar setImmediate para la respuesta final
          setImmediate(() => {
            resolve(result);
          });
        } catch (error) {
          // Error silencioso - devolver error
          setImmediate(() => {
            resolve({ error: error.message || 'Error al seguir usuario' });
          });
        }
      });
    });
  }

  // Dejar de seguir usuario
  static async unfollowUser(followerId, followingId) {
    try {
      console.log(`🔍 FollowService: Intentando dejar de seguir ${followerId} -> ${followingId}`);
      
      const follow = await Follow.findOne({
        where: { followerId, followingId }
      });

      console.log(`📊 FollowService: Relación encontrada:`, follow ? 'Sí' : 'No');

      if (!follow) {
        console.log(`❌ FollowService: No se encontró relación de seguimiento`);
        throw new Error('No sigues a este usuario');
      }

      console.log(`✅ FollowService: Relación encontrada, eliminando...`);

      // Eliminar la relación de seguimiento
      await sequelize.transaction(async (t) => {
        await follow.destroy({ transaction: t });
        console.log(`🗑️ FollowService: Relación eliminada de la base de datos`);

        // Decrementar contadores
        await User.decrement('followersCount', {
          where: { id: followingId },
          transaction: t
        });

        await User.decrement('followingCount', {
          where: { id: followerId },
          transaction: t
        });
        
        console.log(`📉 FollowService: Contadores decrementados`);
      });

      // OPTIMIZACIÓN: Invalidar cache de follows
      this.invalidateFollowCache(followerId);
      console.log(`🧹 FollowService: Cache invalidado`);

      console.log(`✅ FollowService: Usuario dejado de seguir exitosamente`);
      return { message: 'Has dejado de seguir al usuario' };
    } catch (error) {
      console.error(`❌ FollowService: Error en unfollowUser:`, error);
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
      cache.put(cacheKey, followingUsers, 300000); // 5 minutos en ms


      return followingUsers;
    } catch (error) {
      console.error('Error obteniendo usuarios seguidos:', error);
      throw error;
    }
  }

  // Invalidar cache de follows cuando se sigue/deja de seguir (OPTIMIZADO)
  static invalidateFollowCache(userId) {
    const keys = cache.keys();
    const targetKey = `following:${userId}`;
    
    // OPTIMIZACIÓN: Usar for loop en lugar de filter para mejor rendimiento
    const userKeys = [];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].includes(targetKey)) {
        userKeys.push(keys[i]);
      }
    }
    
    cache.del(userKeys);

  }
}

module.exports = FollowService;
