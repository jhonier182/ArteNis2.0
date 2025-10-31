const express = require('express');
const AuthController = require('../controllers/authController');
const ProfileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/auth');
const { 
  validateRegister, 
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
  handleValidationErrors 
} = require('../middlewares/validation');

const router = express.Router();

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', 
  validateRegister,
  handleValidationErrors,
  AuthController.register
);

// POST /api/auth/login - Iniciar sesión
router.post('/login',
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// POST /api/auth/refresh - Refrescar tokens
router.post('/refresh', AuthController.refresh);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', 
  verifyToken,
  AuthController.logout
);

// GET /api/auth/me - Obtener perfil del usuario (temporal para compatibilidad)
router.get('/me', 
  verifyToken,
  ProfileController.getProfile
);

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password',
  verifyToken,
  validateChangePassword,
  handleValidationErrors,
  AuthController.changePassword
);

// POST /api/auth/forgot-password - Solicitar reset de contraseña
router.post('/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  AuthController.forgotPassword
);

// POST /api/auth/reset-password - Resetear contraseña
router.post('/reset-password',
  validateResetPassword,
  handleValidationErrors,
  AuthController.resetPassword
);

// POST /api/auth/verify-email - Verificar email
router.post('/verify-email',
  validateVerifyEmail,
  handleValidationErrors,
  AuthController.verifyEmail
);

// POST /api/auth/resend-verification - Reenviar verificación de email
router.post('/resend-verification',
  verifyToken,
  AuthController.resendVerification
);

// GET /api/auth/sessions - Obtener sesiones activas
router.get('/sessions',
  verifyToken,
  AuthController.getActiveSessions
);

// POST /api/auth/logout-others - Cerrar otras sesiones
router.post('/logout-others',
  verifyToken,
  AuthController.logoutOtherSessions
);

// DELETE /api/auth/account - Eliminar cuenta
router.delete('/account',
  verifyToken,
  AuthController.deleteAccount
);

module.exports = router;
