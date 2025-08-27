const express = require('express');
const ProfileController = require('../controllers/profileController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');

const router = express.Router();

// GET /api/profile/me - Obtener perfil del usuario autenticado
router.get('/me',
  verifyToken,
  ProfileController.getProfile
);

// PUT /api/profile/me - Actualizar perfil del usuario
router.put('/me',
  verifyToken,
  ProfileController.updateProfile
);

// POST /api/profile/me/avatar - Subir avatar del usuario
router.post('/me/avatar',
  verifyToken,
  upload.single('avatar'),
  handleMulterError,
  ProfileController.uploadAvatar
);

// GET /api/profile/:id - Obtener usuario por ID
router.get('/:id',
  optionalAuth,
  ProfileController.getUserById
);

module.exports = router;
