const express = require('express');
const UserController = require('../controllers/userController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');
const { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} = require('../middlewares/validation');

const router = express.Router();

// Rutas públicas (sin autenticación)

// POST /api/users/register - Registrar nuevo usuario
router.post('/register', 
  validateRegister,
  handleValidationErrors,
  UserController.register
);

// POST /api/users/login - Iniciar sesión
router.post('/login',
  validateLogin,
  handleValidationErrors,
  UserController.login
);

// POST /api/users/refresh - Refrescar tokens
router.post('/refresh', UserController.refresh);

// GET /api/users/search - Buscar usuarios
router.get('/search',
  optionalAuth,
  UserController.searchUsers
);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id',
  optionalAuth,
  UserController.getUserById
);

// Rutas protegidas (requieren autenticación)

// GET /api/users/me/profile - Obtener perfil del usuario autenticado
router.get('/me/profile',
  verifyToken,
  UserController.getProfile
);

// PUT /api/users/me/profile - Actualizar perfil del usuario
router.put('/me/profile',
  verifyToken,
  UserController.updateProfile
);

// POST /api/users/me/avatar - Subir avatar del usuario
router.post('/me/avatar',
  verifyToken,
  upload.single('avatar'),
  handleMulterError,
  UserController.uploadAvatar
);

// POST /api/users/follow - Seguir usuario
router.post('/follow',
  verifyToken,
  UserController.followUser
);

// DELETE /api/users/:userId/follow - Dejar de seguir usuario
router.delete('/:userId/follow',
  verifyToken,
  UserController.unfollowUser
);

// POST /api/users/logout - Cerrar sesión
router.post('/logout',
  verifyToken,
  UserController.logout
);

module.exports = router;
