const express = require('express');
const AuthController = require('../controllers/authController');
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
router.post('/logout', AuthController.logout);

module.exports = router;
