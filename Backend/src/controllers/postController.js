const PostService = require('../services/postService');
const { uploadPostImage } = require('../config/cloudinary');

class PostController {
  // Subir imagen para post
  static async uploadPostImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo de imagen',
          debug: {
            bodyKeys: Object.keys(req.body),
            files: req.files,
            file: req.file,
            contentType: req.headers['content-type']
          }
        });
      }

      // Generar ID único para el post
      const postId = Date.now().toString();
      
      // Subir imagen a Cloudinary
      const result = await uploadPostImage(
        req.file.buffer,
        req.user.id,
        postId
      );

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          url: result.url,
          publicId: result.publicId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nueva publicación
  static async createPost(req, res, next) {
    try {
      const { imageUrl, cloudinaryPublicId, description, hashtags, type } = req.body;

      if (!imageUrl || !cloudinaryPublicId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere la URL de la imagen y el ID de Cloudinary'
        });
      }

      const post = await PostService.createPost(
        req.user.id,
        {
          description,
          hashtags,
          type
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
      // Agregar userId si hay usuario autenticado
      const options = { ...req.query };
      if (req.user) {
        options.userId = req.user.id;
      }
      
      const result = await PostService.getFeed(options);
      
      // Transformar los posts para el frontend
      const transformedPosts = PostService.transformPostsForFrontend(result.posts);
      
      res.status(200).json({
        success: true,
        message: 'Feed obtenido exitosamente',
        data: {
          ...result,
          posts: transformedPosts
        }
      });
    } catch (error) {
      console.error('❌ Error en getFeed:', error);
      next(error);
    }
  }

  // Obtener publicación por ID
  static async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      
      const post = await PostService.getPostById(id, userId);
      
      // Transformar el post para el frontend
      const transformedPost = PostService.transformPostForFrontend(post);
      
      res.status(200).json({
        success: true,
        message: 'Publicación obtenida exitosamente',
        data: { post: transformedPost }
      });
    } catch (error) {
      next(error);
    }
  }

  // Dar like a una publicación
  static async likePost(req, res, next) {
    try {
      const { id } = req.params;
      const { type = 'like' } = req.body;
      
      const result = await PostService.likePost(req.user.id, id, type);
      
      res.status(200).json({
        success: true,
        message: 'Like agregado exitosamente',
        data: result
      });
    } catch (error) {
      // Manejo específico para deadlocks
      if (error.message.includes('Deadlock')) {
        console.log(`🚨 Deadlock en likePost para usuario ${req.user.id}, post ${req.params.id}`);
        return res.status(409).json({
          success: false,
          message: 'Error temporal al procesar el like. Por favor, inténtalo de nuevo.',
          error: 'DEADLOCK_DETECTED'
        });
      }
      
      // Otros errores
      if (error.message.includes('Publicación no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'La publicación no existe'
        });
      }
      
      next(error);
    }
  }

  // Quitar like de una publicación
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
      // Manejo específico para deadlocks
      if (error.message.includes('Deadlock')) {
        console.log(`🚨 Deadlock en unlikePost para usuario ${req.user.id}, post ${req.params.id}`);
        return res.status(409).json({
          success: false,
          message: 'Error temporal al procesar el unlike. Por favor, inténtalo de nuevo.',
          error: 'DEADLOCK_DETECTED'
        });
      }
      
      // Otros errores
      if (error.message.includes('No has dado like')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('Publicación no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'La publicación no existe'
        });
      }
      
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
  static async getUserPosts(req, res, next) {
    try {
      const { userId } = req.params;
      const options = {
        ...req.query,
        requesterId: req.user?.id || null
      };
      
      const result = await PostService.getUserPosts(userId, options);
      
      // Transformar los posts para el frontend
      const transformedPosts = PostService.transformPostsForFrontend(result.posts);
      
      res.status(200).json({
        success: true,
        message: 'Publicaciones obtenidas exitosamente',
        data: {
          ...result,
          posts: transformedPosts
        }
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
        requesterId: req.user.id
      };
      
      const result = await PostService.getUserPosts(req.user.id, options);
      
      // Transformar los posts para el frontend
      const transformedPosts = PostService.transformPostForFrontend(result.posts);
      
      res.status(200).json({
        success: true,
        message: 'Publicaciones obtenidas exitosamente',
        data: {
          ...result,
          posts: transformedPosts
        }
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
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const result = await PostService.getFollowingPosts(userId, page, limit, offset);
      
      res.json({
        success: true,
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
