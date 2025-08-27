const express = require('express');
const ProfileController = require('../controllers/profileController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');

const router = express.Router();

// GET /api/profile/me/profile - Obtener perfil del usuario autenticado (ruta original)
router.get('/me/profile',
  verifyToken,
  ProfileController.getProfile
);

// PUT /api/profile/me/profile - Actualizar perfil del usuario (ruta original)
router.put('/me/profile',
  verifyToken,
  ProfileController.updateProfile
);

// POST /api/profile/me/avatar - Subir avatar del usuario (ruta original)
router.post('/me/avatar',
  verifyToken,
  upload.single('avatar'),
  handleMulterError,
  ProfileController.uploadAvatar
);

// GET /api/profile/:id - Obtener usuario por ID (ruta original)
router.get('/:id',
  optionalAuth,
  ProfileController.getUserById
);

module.exports = router;
