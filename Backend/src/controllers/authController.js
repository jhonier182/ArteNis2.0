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
      
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
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

  // Cambiar contraseña
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Solicitar reset de contraseña
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      await AuthService.requestPasswordReset(email);
      
      // Siempre retornar éxito por seguridad (evitar enumeración de emails)
      res.status(200).json({
        success: true,
        message: 'Si el email existe, se enviará un enlace para restablecer la contraseña'
      });
    } catch (error) {
      next(error);
    }
  }

  // Resetear contraseña
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const result = await AuthService.resetPassword(token, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar email
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      await AuthService.verifyEmail(token);
      
      res.status(200).json({
        success: true,
        message: 'Email verificado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reenviar verificación de email
  static async resendVerification(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userId = req.user.id;
      const result = await AuthService.resendVerificationEmail(userId);
      
      res.status(200).json({
        success: true,
        message: result.message || 'Email de verificación enviado',
        ...(result.verificationToken && { verificationToken: result.verificationToken }) // Solo en desarrollo
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener sesiones activas
  static async getActiveSessions(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userId = req.user.id;
      const sessions = await AuthService.getActiveSessions(userId);
      
      res.status(200).json({
        success: true,
        message: 'Sesiones obtenidas exitosamente',
        data: { sessions }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cerrar otras sesiones
  static async logoutOtherSessions(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userId = req.user.id;
      const { refreshToken } = req.body; // Token actual para no cerrarlo

      const result = await AuthService.logoutOtherSessions(userId, refreshToken);
      
      res.status(200).json({
        success: true,
        message: result.message || 'Sesiones cerradas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar cuenta
  static async deleteAccount(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userId = req.user.id;
      const { password } = req.body;

      const result = await AuthService.deleteAccount(userId, password);
      
      res.status(200).json({
        success: true,
        message: result.message || 'Cuenta eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
