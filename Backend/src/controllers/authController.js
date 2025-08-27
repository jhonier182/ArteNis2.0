const AuthService = require('../services/authService');

class AuthController {
  // Registrar nuevo usuario
  static async register(req, res, next) {
    try {
      const payload = { ...req.body, userAgent: req.headers['user-agent'], ip: req.ip };
      const result = await AuthService.register(payload);
      
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
      const result = await AuthService.login(identifier, password);
      
      res.status(200).json({
        success: true,
        message: 'Sesión iniciada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Refrescar token
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken, req.headers['user-agent'], req.ip);
      
      res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Cerrar sesión
  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.revokeRefreshTokens(req.user.id, refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
