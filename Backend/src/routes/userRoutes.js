const express = require('express');
const AuthController = require('../controllers/authController');
const ProfileController = require('../controllers/profileController');
const SearchController = require('../controllers/searchController');
const FollowController = require('../controllers/followController');
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
  AuthController.register
);

// POST /api/users/login - Iniciar sesión
router.post('/login',
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// POST /api/users/refresh - Refrescar tokens
router.post('/refresh', AuthController.refresh);

// GET /api/users/search - Buscar usuarios
router.get('/search',
  optionalAuth,
  SearchController.searchUsers
);

// Rutas protegidas (requieren autenticación)

// GET /api/users/me/profile - Obtener perfil del usuario autenticado
router.get('/me/profile',
  verifyToken,
  ProfileController.getProfile
);

// PUT /api/users/me/profile - Actualizar perfil del usuario
router.put('/me/profile',
  verifyToken,
  ProfileController.updateProfile
);

// POST /api/users/me/avatar - Subir avatar del usuario
router.post('/me/avatar',
  verifyToken,
  upload.single('avatar'),
  handleMulterError,
  ProfileController.uploadAvatar
);

// POST /api/users/follow - Seguir usuario
router.post('/follow',
  verifyToken,
  FollowController.followUser
);

// DELETE /api/users/:userId/follow - Dejar de seguir usuario
router.delete('/:userId/follow',
  verifyToken,
  FollowController.unfollowUser
);

// GET /api/users/following - Obtener usuarios que sigues
router.get('/following',
  verifyToken,
  FollowController.getFollowingUsers
);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id',
  optionalAuth,
  ProfileController.getUserById
);

// POST /api/users/logout - Cerrar sesión
router.post('/logout',
  verifyToken,
  AuthController.logout
);

module.exports = router;
