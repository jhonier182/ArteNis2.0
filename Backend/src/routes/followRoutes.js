const express = require('express');
const FollowController = require('../controllers/followController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros
// GET /api/follow/following - Obtener usuarios que sigues
router.get('/following',
  verifyToken,
  FollowController.getFollowingUsers
);

// GET /api/follow/status/:userId - Verificar si sigues a un usuario específico
router.get('/status/:userId',
  verifyToken,
  FollowController.checkFollowingStatus
);

// POST /api/follow - Seguir usuario
router.post('/',
  verifyToken,
  FollowController.followUser
);

// DELETE /api/follow/:userId - Dejar de seguir usuario (DEBE ir después de rutas específicas)
router.delete('/:userId',
  verifyToken,
  FollowController.unfollowUser
);

module.exports = router;
