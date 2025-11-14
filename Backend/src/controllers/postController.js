const PostService = require('../services/postService');
const MediaService = require('../services/mediaService');
const { responses } = require('../utils/apiResponse');

class PostController {
  // Subir media para post
  static async uploadPostMedia(req, res, next) {
    try {
      const result = await MediaService.uploadPostMedia(
        req.file.buffer,
        req.user.id,
        req.file.mimetype
      );

      res.status(200).json({
        success: true,
        message: result.type === 'video' ? 'Video subido exitosamente' : 'Imagen subida exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nueva publicación
  static async createPost(req, res, next) {
    try {
      const { 
        imageUrl, 
        cloudinaryPublicId, 
        description, 
        hashtags, 
        type, 
        thumbnailUrl 
      } = req.body;

      const post = await PostService.createPost(
        req.user.id,
        {
          description,
          hashtags,
          type,
          thumbnailUrl
        },
        imageUrl,
        cloudinaryPublicId
      );

      res.status(201).json({
        success: true,
        message: 'Publicación creada exitosamente',
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener feed de publicaciones (posts de usuarios seguidos)
  static async getFeed(req, res, next) {
    const startTime = Date.now();
    const traceId = req.id || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logger = require('../utils/logger');
    
    try {
      const { MAX_LIMIT, DEFAULT_LIMIT } = require('../middlewares/feedValidation');
      
      // Feature flag ya verificado por middleware, pero verificamos por seguridad
      const { isFeatureEnabled } = require('../middlewares/featureFlag');
      if (!isFeatureEnabled('ENABLE_CURSOR_FEED')) {
        logger.warn('[Feed] Feature flag deshabilitado (verificación adicional)', { traceId, userId: req.user?.id });
        return res.status(503).json({
          success: false,
          message: 'El feed está temporalmente deshabilitado',
          error: 'FEED_DISABLED',
          traceId
        });
      }
      
      logger.info('[Feed] Iniciando carga de feed', {
        traceId,
        userId: req.user?.id || 'anon',
        cursor: req.query.cursor ? 'present' : 'null',
        limit: req.query.limit
      });
      
      const options = PostService.buildFeedOptions(req.query, req.user?.id);
      
      // Validar y limitar cursor
      if (req.query.cursor) {
        // Validar formato básico del cursor
        if (typeof req.query.cursor !== 'string' || req.query.cursor.length > 500) {
          logger.warn('[Feed] Cursor inválido', { traceId, cursorLength: req.query.cursor?.length });
          return res.status(400).json({
            success: false,
            message: 'Cursor inválido',
            error: 'INVALID_CURSOR',
            traceId
          });
        }
        options.cursor = req.query.cursor;
      }
      
      // Validar y limitar el límite
      if (req.query.limit) {
        const limit = parseInt(req.query.limit);
        if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
          logger.warn('[Feed] Límite inválido', { traceId, limit: req.query.limit });
          return res.status(400).json({
            success: false,
            message: `El límite debe ser un número entre 1 y ${MAX_LIMIT}`,
            error: 'INVALID_LIMIT',
            traceId
          });
        }
        options.limit = limit;
      } else {
        options.limit = DEFAULT_LIMIT;
      }
      
      const result = await PostService.getFeed(options);
      
      const executionTimeMs = Date.now() - startTime;
      
      logger.info('[Feed] Feed cargado exitosamente', {
        traceId,
        userId: req.user?.id || 'anon',
        postsCount: result.posts?.length || 0,
        hasMore: !!result.nextCursor,
        executionTimeMs
      });
      
      res.status(200).json({
        success: true,
        message: 'Feed obtenido exitosamente',
        data: {
          ...result,
          executionTimeMs,
          traceId
        }
      });
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      logger.error('[Feed] Error obteniendo feed', {
        traceId,
        userId: req.user?.id || 'anon',
        error: error.message,
        stack: error.stack,
        executionTimeMs
      });
      next(error);
    }
  }

  // Obtener posts públicos para la sección Explorar
  static async getPublicPosts(req, res, next) {
    const startTime = Date.now();
    const traceId = req.id || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logger = require('../utils/logger');
    
    try {
      const { MAX_LIMIT, DEFAULT_LIMIT } = require('../middlewares/feedValidation');
      
      logger.info('[PublicFeed] Iniciando carga de posts públicos', {
        traceId,
        userId: req.user?.id || 'anon',
        ip: req.ip,
        filters: {
          type: req.query.type,
          style: req.query.style,
          sortBy: req.query.sortBy
        }
      });
      
      // Validar cursor
      let cursor = null;
      if (req.query.cursor) {
        if (typeof req.query.cursor !== 'string' || req.query.cursor.length > 500) {
          logger.warn('[PublicFeed] Cursor inválido', { traceId, cursorLength: req.query.cursor?.length });
          return res.status(400).json({
            success: false,
            message: 'Cursor inválido',
            error: 'INVALID_CURSOR',
            traceId
          });
        }
        cursor = req.query.cursor;
      }
      
      // Validar y limitar el límite
      let limit = DEFAULT_LIMIT;
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit);
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
          logger.warn('[PublicFeed] Límite inválido', { traceId, limit: req.query.limit });
          return res.status(400).json({
            success: false,
            message: `El límite debe ser un número entre 1 y ${MAX_LIMIT}`,
            error: 'INVALID_LIMIT',
            traceId
          });
        }
        limit = parsedLimit;
      }
      
      // Validar y sanitizar filtros
      const options = {
        cursor,
        limit,
        type: req.query.type && ['all', 'image', 'video', 'reel'].includes(req.query.type) 
          ? req.query.type 
          : 'all',
        style: req.query.style 
          ? String(req.query.style).trim().substring(0, 100) 
          : null,
        bodyPart: req.query.bodyPart 
          ? String(req.query.bodyPart).trim().substring(0, 100) 
          : null,
        location: req.query.location 
          ? String(req.query.location).trim().substring(0, 200) 
          : null,
        featured: req.query.featured !== undefined 
          ? req.query.featured === 'true' || req.query.featured === true 
          : undefined,
        sortBy: req.query.sortBy && ['recent', 'popular', 'views'].includes(req.query.sortBy)
          ? req.query.sortBy
          : 'recent',
        userId: req.user?.id || null
      };
      
      const result = await PostService.getPublicPosts(options);
      
      const executionTimeMs = Date.now() - startTime;
      
      logger.info('[PublicFeed] Posts públicos cargados exitosamente', {
        traceId,
        userId: req.user?.id || 'anon',
        postsCount: result.posts?.length || 0,
        hasMore: !!result.nextCursor,
        executionTimeMs,
        filters: options
      });
      
      res.status(200).json({
        success: true,
        message: 'Posts públicos obtenidos exitosamente',
        data: {
          ...result,
          executionTimeMs,
          traceId
        }
      });
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      logger.error('[PublicFeed] Error obteniendo posts públicos', {
        traceId,
        userId: req.user?.id || 'anon',
        ip: req.ip,
        error: error.message,
        stack: error.stack,
        executionTimeMs
      });
      next(error);
    }
  }

  // Obtener publicación por ID
  static async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      
      const post = await PostService.getPostById(id, userId);
      
      if (!post) {
        return responses.notFound(res, 'Publicación no encontrada', 'POST_NOT_FOUND');
      }
      
      res.status(200).json({
        success: true,
        message: 'Publicación obtenida exitosamente',
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  }

  // Dar like a una publicación
  static async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const { type = 'like' } = req.body;
      const userId = req.user.id;
      
      // Obtener el post para conocer al autor antes de hacer el toggle
      const Post = require('../models/Post');
      const post = await Post.findByPk(id, { attributes: ['userId'] });
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Publicación no encontrada'
        });
      }
      
      const postAuthorId = post.userId;
      const result = await PostService.toggleLike(userId, id, type);
      
      // Emitir evento Socket.io para sincronización en tiempo real
      // Emitir tanto al usuario que hace like como al autor del post
      if (global.io) {
        const eventData = {
          postId: id,
          isLiked: result.liked,
          likesCount: result.likesCount,
          action: result.liked ? 'like' : 'unlike',
          timestamp: new Date().toISOString()
        };
        
        const logger = require('../utils/logger');
        
        // Emitir al usuario que hizo el like (para actualizar su estado)
        global.io.to(userId).emit('LIKE_UPDATED', eventData);
        logger.info(`📡 Evento LIKE_UPDATED emitido a usuario que hizo like - Usuario: ${userId}, Post: ${id}, Acción: ${result.liked ? 'like' : 'unlike'}`);
        
        // Emitir al autor del post (para actualizar el contador en tiempo real)
        if (postAuthorId !== userId) {
          global.io.to(postAuthorId).emit('LIKE_UPDATED', eventData);
          logger.info(`📡 Evento LIKE_UPDATED emitido al autor del post - Autor: ${postAuthorId}, Post: ${id}, Acción: ${result.liked ? 'like' : 'unlike'}`);
        }
      }
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          liked: result.liked,
          likesCount: result.likesCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener información de likes de una publicación
  static async getLikeInfo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      
      const likeInfo = await PostService.getLikeInfo(id, userId);
      
      if (!likeInfo) {
        return responses.notFound(res, 'La publicación no existe', 'POST_NOT_FOUND');
      }
      
      res.status(200).json({
        success: true,
        data: likeInfo
      });
    } catch (error) {
      next(error);
    }
  }

  // Quitar like de una publicación (mantener para compatibilidad)
  static async unlikePost(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await PostService.unlikePost(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Like removido exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener comentarios de una publicación
  static async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user?.id || null;
      
      const result = await PostService.getComments(id, { page, limit, userId });
      
      res.status(200).json({
        success: true,
        message: 'Comentarios obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Agregar comentario
  static async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      
      const comment = await PostService.addComment(req.user.id, id, content, parentId);
      
      res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener publicaciones de un usuario
  // Obtener publicaciones de un usuario específico
  static async getUserPosts(req, res, next) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 15;
      const cursor = req.query.cursor || null;
      
      const options = {
        cursor,
        limit,
        requesterId: req.user?.id || null,
        type: req.query.type || 'all'
      };
      
      const result = await PostService.getUserPosts(userId, options);
      
      res.status(200).json({
        success: true,
        message: 'Publicaciones obtenidas exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener publicaciones del usuario autenticado
  static async getMyPosts(req, res, next) {
    try {
      const options = {
        ...req.query,
        requesterId: req.user.id,
        limit: parseInt(req.query.limit) || 15
      };
      
      const result = await PostService.getUserPosts(req.user.id, options);
      
      res.status(200).json({
        success: true,
        message: 'Publicaciones obtenidas exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Dar like a un comentario
  static async likeComment(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await PostService.likeComment(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Like en comentario agregado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar publicación
  static async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { description, hashtags } = req.body;

      const result = await PostService.updatePost(
        req.user.id,
        id,
        {
          description: description.trim(),
          hashtags: hashtags || []
        }
      );

      res.status(200).json({
        success: true,
        message: 'Publicación actualizada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar publicación
  static async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await PostService.deletePost(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Publicación eliminada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener posts de usuarios seguidos
  static async getFollowingPosts(req, res, next) {
    try {
      const userId = req.user.id;
      const options = {
        cursor: req.query.cursor || null,
        limit: parseInt(req.query.limit) || 15
      };

      const result = await PostService.getFollowingPosts(userId, options);
      
      res.status(200).json({
        success: true,
        message: 'Posts de usuarios seguidos obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Guardar o quitar post de guardados
  static async toggleSave(req, res, next) {
    try {
      const { id: postId } = req.params;
      const userId = req.user.id;

      const result = await PostService.toggleSave(userId, postId);

      res.status(200).json({
        success: true,
        message: result.saved ? 'Post guardado exitosamente' : 'Post eliminado de guardados',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener posts guardados del usuario
  static async getSavedPosts(req, res, next) {
    try {
      const userId = req.user.id;
      const cursor = req.query.cursor || null;
      const limit = parseInt(req.query.limit) || 20;

      const result = await PostService.getSavedPosts(userId, cursor, limit);

      res.status(200).json({
        success: true,
        message: 'Posts guardados obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;
