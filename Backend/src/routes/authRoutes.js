const express = require('express');
const AuthController = require('../controllers/authController');
const ProfileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/auth');
const { 
  validateRegister, 
  validateLogin, 
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

module.exports = router;
