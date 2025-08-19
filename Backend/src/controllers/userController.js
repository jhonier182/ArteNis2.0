const UserService = require('../services/userService');

class UserController {
  // Registrar nuevo usuario
  static async register(req, res, next) {
    try {
      const payload = { ...req.body, userAgent: req.headers['user-agent'], ip: req.ip };
      const result = await UserService.register(payload);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Iniciar sesión
  static async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const result = await UserService.login(identifier, password);
      
      res.status(200).json({
        success: true,
        message: 'Sesión iniciada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.id);
      
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
      
      const user = await UserService.getUserById(id, requesterId);
      
      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar usuarios
  static async searchUsers(req, res, next) {
    try {
      const result = await UserService.searchUsers(req.query);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda realizada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Seguir usuario
  static async followUser(req, res, next) {
    try {
      const { userId } = req.body;
      const followerId = req.user.id;
      
      const result = await UserService.followUser(followerId, userId);
      
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
      
      const result = await UserService.unfollowUser(followerId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Has dejado de seguir al usuario',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuarios que sigues
  static async getFollowingUsers(req, res, next) {
    try {
      console.log('🔍 === getFollowingUsers controller iniciado ===');
      console.log('🔍 req.user:', req.user);
      console.log('🔍 req.user.id:', req.user?.id);
      console.log('🔍 req.url:', req.url);
      console.log('🔍 req.path:', req.path);
      console.log('🔍 req.route.path:', req.route?.path);
      
      const userId = req.user.id;
      if (!userId) {
        console.log('❌ No hay userId en req.user');
        return res.status(400).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      console.log('✅ userId obtenido:', userId);
      console.log('🚀 Llamando a UserService.getFollowingUsers...');
      const result = await UserService.getFollowingUsers(userId);
      
      console.log('✅ Resultado obtenido:', result.length, 'usuarios');
      console.log('✅ IDs de usuarios seguidos:', result.map(u => u.id));
      
      res.status(200).json({
        success: true,
        message: 'Usuarios seguidos obtenidos exitosamente',
        data: { users: result }
      });
    } catch (error) {
      console.log('❌ Error en controller getFollowingUsers:', error.message);
      console.log('❌ Stack trace:', error.stack);
      next(error);
    }
  }

  // Actualizar perfil
  static async updateProfile(req, res, next) {
    try {
      const result = await UserService.updateProfile(req.user.id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Subir avatar del usuario
  static async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo de imagen'
        });
      }

      const result = await UserService.uploadAvatar(req.user.id, req.file.buffer);
      
      res.status(200).json({
        success: true,
        message: 'Avatar actualizado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Cerrar sesión
  static async logout(req, res, next) {
    try {
      // Opcional: revocar refresh actual si viene en el body
      if (req.body?.refreshToken) {
        try { await UserService.revokeRefreshTokens(req.user.id, req.body.refreshToken); } catch (e) {}
      }
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'refreshToken requerido' });
      }
      const result = await UserService.refresh(refreshToken, req.headers['user-agent'], req.ip);
      res.status(200).json({ success: true, message: 'Token refrescado', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
