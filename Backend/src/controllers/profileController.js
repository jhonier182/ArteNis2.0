const ProfileService = require('../services/profileService');
const taskQueue = require('../utils/taskQueue');

class ProfileController {
  // Obtener perfil del usuario autenticado (NO BLOQUEANTE)
  static async getProfile(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        // Usar task queue para operaciones de base de datos
        const user = await taskQueue.add(async () => {
          return await ProfileService.getProfile(req.user.id);
        }, 'normal');
        
        res.status(200).json({
          success: true,
          message: 'Perfil obtenido exitosamente',
          data: { user }
        });
      } catch (error) {
        next(error);
      }
    });
  }

  // Obtener usuario por ID (NO BLOQUEANTE)
  static async getUserById(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        const { id } = req.params;
        const requesterId = req.user?.id || null;
        
        // Usar task queue para operaciones de base de datos
        const user = await taskQueue.add(async () => {
          return await ProfileService.getUserById(id, requesterId);
        }, 'normal');
        
        res.status(200).json({
          success: true,
          message: 'Usuario obtenido exitosamente',
          data: { user }
        });
      } catch (error) {
        next(error);
      }
    });
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
