const express = require('express');
const PostController = require('../controllers/postController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');
const { validateMediaUpload } = require('../middlewares/mediaValidation');
const { 
  validateCreatePost, 
  validateComment, 
  handleValidationErrors 
} = require('../middlewares/validation');

const router = express.Router();

// Rutas públicas o con autenticación opcional

// GET /api/posts/feed - Obtener feed de publicaciones (posts de usuarios seguidos)
router.get('/feed',
  verifyToken,
  PostController.getFeed
);

// GET /api/posts/public - Obtener posts públicos para Explorar
router.get('/public',
  optionalAuth,
  PostController.getPublicPosts
);

// GET /api/posts - Obtener feed de publicaciones (mantener para compatibilidad)
router.get('/',
  verifyToken,
  PostController.getFeed
);

// POST /api/posts/track-views - Trackear visualizaciones del feed (funcionalidad removida)
router.post('/track-views',
  verifyToken,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Visualizaciones trackeadas correctamente'
    });
  }
);

// GET /api/posts/user/me - Obtener publicaciones del usuario autenticado
router.get('/user/me',
  verifyToken,
  PostController.getMyPosts
);

// GET /api/posts/following - Obtener posts de usuarios seguidos
router.get('/following',
  verifyToken,
  PostController.getFollowingPosts
);

// GET /api/posts/saved - Obtener posts guardados del usuario (debe estar antes de /:id)
router.get('/saved',
  verifyToken,
  PostController.getSavedPosts
);

// GET /api/posts/user/:userId - Obtener publicaciones de un usuario (debe estar antes de /:id)
router.get('/user/:userId',
  optionalAuth,
  PostController.getUserPosts
);

// GET /api/posts/:id - Obtener publicación por ID
router.get('/:id',
  optionalAuth,
  PostController.getPostById
);

// Rutas protegidas (requieren autenticación)

// POST /api/posts/upload - Subir imagen o video para post
router.post('/upload',
  verifyToken,
  upload.single('image'),
  handleMulterError,
  validateMediaUpload,
  PostController.uploadPostMedia
);

// POST /api/posts - Crear nueva publicación
router.post('/',
  verifyToken,
  validateCreatePost,
  handleValidationErrors,
  PostController.createPost
);

// GET /api/posts/:id/likes - Obtener información de likes de una publicación
router.get('/:id/likes',
  optionalAuth,
  PostController.getLikeInfo
);

// POST /api/posts/:id/like - Toggle like a una publicación (agregar o quitar)
router.post('/:id/like',
  verifyToken,
  PostController.toggleLike
);

// DELETE /api/posts/:id/like - Quitar like de una publicación (mantener para compatibilidad)
router.delete('/:id/like',
  verifyToken,
  PostController.unlikePost
);

// GET /api/posts/:id/comments - Obtener comentarios de una publicación
router.get('/:id/comments',
  optionalAuth,
  PostController.getComments
);

// POST /api/posts/:id/comments - Agregar comentario a una publicación
router.post('/:id/comments',
  verifyToken,
  validateComment,
  handleValidationErrors,
  PostController.addComment
);

// POST /api/comments/:id/like - Dar like a un comentario
router.post('/comments/:id/like',
  verifyToken,
  PostController.likeComment
);

// PUT /api/posts/:id - Actualizar publicación
router.put('/:id',
  verifyToken,
  PostController.updatePost
);

// DELETE /api/posts/:id - Eliminar publicación
router.delete('/:id',
  verifyToken,
  PostController.deletePost
);

// POST /api/posts/:id/save - Guardar o quitar post de guardados
router.post('/:id/save',
  verifyToken,
  PostController.toggleSave
);

module.exports = router;
