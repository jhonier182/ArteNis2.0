const FollowService = require('../services/followService');

class FollowController {
  // Seguir usuario
  static async followUser(req, res, next) {
    try {
      const { userId } = req.body;
      const followerId = req.user.id;
      
      console.log(`🔄 FollowController: Intentando seguir usuario ${userId} por ${followerId}`);
      
      const result = await FollowService.followUser(followerId, userId);
      
      console.log(`📊 FollowController: Resultado:`, result);
      
      // Verificar si hay error en el resultado
      if (result.error) {
        console.log(`❌ FollowController: Error en resultado:`, result.error);
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }
      
      console.log(`✅ FollowController: Usuario seguido exitosamente`);
      res.status(200).json({
        success: true,
        message: 'Usuario seguido exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ FollowController: Error:', error);
      next(error);
    }
  }

  // Dejar de seguir usuario
  static async unfollowUser(req, res, next) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;
      
      console.log(`🔄 FollowController: Intentando dejar de seguir usuario ${userId} por ${followerId}`);
      
      const result = await FollowService.unfollowUser(followerId, userId);
      
      console.log(`📊 FollowController: Resultado del unfollow:`, result);
      
      res.status(200).json({
        success: true,
        message: 'Has dejado de seguir al usuario',
        data: result
      });
    } catch (error) {
      console.error('❌ FollowController: Error en unfollowUser:', error);
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
