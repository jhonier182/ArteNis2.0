const PostService = require('../services/postService');
const MediaService = require('../services/mediaService');

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

      if (!imageUrl || !cloudinaryPublicId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere la URL del media y el ID de Cloudinary',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

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
      const options = { ...req.query };
      if (req.user) {
        options.userId = req.user.id;
      }
      
      const result = await PostService.getFeedWithCache(options);
      
      res.status(200).json({
        success: true,
        message: result.fromCache ? 'Feed obtenido exitosamente (desde caché)' : 'Feed obtenido exitosamente',
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
        return res.status(404).json({
          success: false,
          message: 'Publicación no encontrada',
          error: 'POST_NOT_FOUND'
        });
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
      
      const result = await PostService.toggleLike(req.user.id, id, type);
      
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
      const userId = req.user?.id;
      
      const post = await PostService.getPostById(id, userId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'La publicación no existe',
          error: 'POST_NOT_FOUND'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          likesCount: post.likesCount || 0,
          isLiked: post.isLiked || false,
          postId: id
        }
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
      const options = {
        ...req.query,
        requesterId: req.user?.id || null,
        limit: parseInt(req.query.limit) || 15
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

      if (!description || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere una descripción para la publicación'
        });
      }

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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const offset = (page - 1) * limit;

      const result = await PostService.getFollowingPosts(userId, page, limit, offset);
      
      res.status(200).json({
        success: true,
        message: 'Posts de usuarios seguidos obtenidos exitosamente',
        data: {
          posts: result.posts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(result.total / limit),
            totalPosts: result.total,
            hasMore: page < Math.ceil(result.total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;
