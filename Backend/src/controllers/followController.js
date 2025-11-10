const FollowService = require('../services/followService');

class FollowController {
  // Seguir usuario
  static async followUser(req, res, next) {
    try {
      const { userId } = req.body;
      const followerId = req.user.id;
      
      const result = await FollowService.followUser(followerId, userId);
      
      // Emitir evento Socket.io para sincronización en tiempo real
      // Solo emitir si la operación fue exitosa (no se lanzó error)
      if (global.io) {
        global.io.to(followerId).emit('FOLLOW_UPDATED', {
          targetUserId: userId,
          isFollowing: true,
          action: 'follow',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Usuario seguido exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Dejar de seguir usuario
  static async unfollowUser(req, res, next) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;
      
      const result = await FollowService.unfollowUser(followerId, userId);
      
      // Emitir evento Socket.io para sincronización en tiempo real
      // Solo emitir si la operación fue exitosa (no se lanzó error)
      if (global.io) {
        global.io.to(followerId).emit('FOLLOW_UPDATED', {
          targetUserId: userId,
          isFollowing: false,
          action: 'unfollow',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Has dejado de seguir al usuario',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar si sigues a un usuario específico
  static async checkFollowingStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;
      
      const result = await FollowService.checkFollowingStatus(followerId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Estado de seguimiento obtenido exitosamente',
        data: { isFollowing: result }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuarios que sigues
  static async getFollowingUsers(req, res, next) {
    try {
      const result = await FollowService.getFollowingUsers(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Usuarios seguidos obtenidos exitosamente',
        data: { followingUsers: result }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FollowController;
