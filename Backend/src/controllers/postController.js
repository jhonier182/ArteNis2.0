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

  // Obtener feed de publicaciones
  static async getFeed(req, res, next) {
    try {
      const options = PostService.buildFeedOptions(req.query, req.user?.id);
      // Agregar cursor si está presente
      if (req.query.cursor) {
        options.cursor = req.query.cursor;
      }
      const result = await PostService.getFeed(options);
      
      res.status(200).json({
        success: true,
        message: 'Feed obtenido exitosamente',
        data: result
      });
    } catch (error) {
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
