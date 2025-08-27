const { User, Follow } = require('../models');
const { sequelize } = require('../config/db');

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

  // Obtener usuarios que sigues
  static async getFollowingUsers(userId) {
    try {
      // Verificar que el usuario existe
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        throw new Error('Usuario no encontrado');
      }
      
      // Obtener los follows
      const follows = await Follow.findAll({
        where: { followerId: userId },
        include: [{
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
        }]
      });
      
      // Extraer los usuarios seguidos
      const followingUsers = follows.map(follow => follow.following).filter(user => user !== null);
      
      return followingUsers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FollowService;
