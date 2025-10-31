const ProfileService = require('../services/profileService');

class ProfileController {
  // Obtener perfil del usuario autenticado
  static async getProfile(req, res, next) {
    try {
      const user = await ProfileService.getProfile(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuario por ID
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id || null;
      
      const user = await ProfileService.getUserById(id, requesterId);
      
      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Subir avatar del usuario
  static async uploadAvatar(req, res, next) {
    try {
      const result = await ProfileService.uploadAvatar(req.user.id, req.file.buffer);
      
      res.status(200).json({
        success: true,
        message: 'Avatar actualizado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar perfil de usuario
  static async updateProfile(req, res, next) {
    try {
      const result = await ProfileService.updateProfile(req.user.id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
