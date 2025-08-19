const express = require('express');
const PostController = require('../controllers/postController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');
const { trackPostView, trackFeedViews } = require('../middlewares/viewTracking');
const { 
  validateCreatePost, 
  validateComment, 
  handleValidationErrors 
} = require('../middlewares/validation');

const router = express.Router();

// Rutas públicas o con autenticación opcional

// GET /api/posts - Obtener feed de publicaciones
router.get('/',
  verifyToken,
  PostController.getFeed
);

// POST /api/posts/track-views - Trackear visualizaciones del feed
router.post('/track-views',
  verifyToken,
  trackFeedViews,
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

// GET /api/posts/:id - Obtener publicación por ID
router.get('/:id',
  optionalAuth,
  trackPostView, // Trackear visualización
  PostController.getPostById
);

// GET /api/posts/user/:userId - Obtener publicaciones de un usuario
router.get('/user/:userId',
  optionalAuth,
  PostController.getUserPosts
);

// Rutas protegidas (requieren autenticación)

// POST /api/posts/upload - Subir imagen para post
router.post('/upload',
  verifyToken,
  upload.single('image'),
  handleMulterError,
  PostController.uploadPostImage
);

// POST /api/posts - Crear nueva publicación
router.post('/',
  verifyToken,
  validateCreatePost,
  handleValidationErrors,
  PostController.createPost
);

// POST /api/posts/:id/like - Dar like a una publicación
router.post('/:id/like',
  verifyToken,
  PostController.likePost
);

// DELETE /api/posts/:id/like - Quitar like de una publicación
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

module.exports = router;
