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

// Middleware de cache simple (sin dependencias externas)
const simpleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const cacheMiddleware = (key, ttl = CACHE_TTL) => {
  return (req, res, next) => {
    const cacheKey = `${key}:${JSON.stringify(req.query)}`;
    const cached = simpleCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`📦 Cache hit para ${cacheKey}`);
      return res.status(200).json(cached.data);
    }
    
    const originalSend = res.json;
    res.json = function(data) {
      if (res.statusCode === 200 && data.success) {
        console.log(`💾 Guardando en cache: ${cacheKey}`);
        simpleCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        // Limpiar cache antiguo cada 100 entradas
        if (simpleCache.size > 100) {
          const now = Date.now();
          for (const [k, v] of simpleCache.entries()) {
            if (now - v.timestamp > ttl) {
              simpleCache.delete(k);
            }
          }
        }
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};

const router = express.Router();

// Rutas públicas o con autenticación opcional

// GET /api/posts - Obtener feed de publicaciones
router.get('/',
  verifyToken,
  cacheMiddleware('feed', 2 * 60 * 1000), // Cache de 2 minutos para feed
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

// POST /api/posts/upload - Subir imagen o video para post
router.post('/upload',
  verifyToken,
  upload.single('image'),
  handleMulterError,
  PostController.uploadPostMedia
);

// POST /api/posts - Crear nueva publicación
router.post('/',
  verifyToken,
  validateCreatePost,
  handleValidationErrors,
  (req, res, next) => {
    // Invalidar cache después de crear post
    const originalSend = res.json;
    res.json = function(data) {
      if (res.statusCode === 201) {
        simpleCache.clear();
        console.log('🗑️ Cache invalidado después de crear post');
      }
      return originalSend.call(this, data);
    };
    next();
  },
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

// DELETE /api/posts/:id - Eliminar publicación (OPTIMIZADO)
router.delete('/:id',
  verifyToken,
  (req, res, next) => {
    // OPTIMIZACIÓN: Invalidar cache de forma asíncrona
    const originalSend = res.json;
    res.json = function(data) {
      if (res.statusCode === 200) {
        // Invalidar cache en background para no bloquear respuesta
        setImmediate(() => {
          try {
            simpleCache.clear();
          } catch (error) {
            console.warn('Error invalidando cache:', error.message);
          }
        });
      }
      return originalSend.call(this, data);
    };
    next();
  },
  PostController.deletePost
);

module.exports = router;
