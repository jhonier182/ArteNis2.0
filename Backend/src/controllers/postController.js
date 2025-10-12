const PostService = require('../services/postService');
const { uploadPostImage, uploadPostVideo } = require('../config/cloudinary');
const { getPopularPosts, invalidateCache } = require('../config/performanceOptimization');
const taskQueue = require('../utils/taskQueue');

class PostController {
  // Subir imagen o video para post
  // Subir media para post (COMPLETAMENTE NO BLOQUEANTE CON TASK QUEUE)
  static async uploadPostMedia(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Se requiere un archivo de imagen o video',
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
        
        const isVideo = req.file.mimetype.startsWith('video/');
        
        // Usar task queue para operaciones pesadas de Cloudinary
        const uploadTask = async () => {
          let result;
          if (isVideo) {
            // Subir video a Cloudinary
            result = await uploadPostVideo(
              req.file.buffer,
              req.user.id,
              postId,
              req.file.mimetype
            );
          } else {
            // Subir imagen a Cloudinary
            result = await uploadPostImage(
              req.file.buffer,
              req.user.id,
              postId
            );
          }
          return result;
        };

        // Procesar upload en task queue con prioridad alta
        const result = await taskQueue.add(uploadTask, 'high');

        res.status(200).json({
          success: true,
          message: isVideo ? 'Video subido exitosamente' : 'Imagen subida exitosamente',
          data: {
            url: result.url,
            publicId: result.publicId,
            thumbnailUrl: result.thumbnailUrl || null,
            type: isVideo ? 'video' : 'image'
          }
        });
      } catch (error) {
        next(error);
      }
    });
  }

  // Crear nueva publicación
  // Crear nueva publicación (NO BLOQUEANTE)
  static async createPost(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
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
            message: 'Se requiere la URL del media y el ID de Cloudinary'
          });
        }

        // Usar task queue para operaciones de base de datos
        const post = await taskQueue.add(async () => {
          return await PostService.createPost(
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
        }, 'high');

        // Invalidar caché de posts populares
        invalidateCache('popular_posts');

        res.status(201).json({
          success: true,
          message: 'Publicación creada exitosamente',
          data: { post }
        });
      } catch (error) {
        next(error);
      }
    });
  }

  // Obtener feed de publicaciones
  // Obtener feed de publicaciones (NO BLOQUEANTE)
  static async getFeed(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        // Agregar userId si hay usuario autenticado
        const options = { ...req.query };
        if (req.user) {
          options.userId = req.user.id;
        }
        
        // Si es una consulta de posts populares sin filtros específicos, usar caché
        if (!options.userId && !options.search && !options.type && !options.style) {
          const limit = parseInt(options.limit) || 15; // Reducir límite por defecto
          const cachedPosts = await getPopularPosts(limit);
          
          if (cachedPosts && cachedPosts.length > 0) {
            return res.status(200).json({
              success: true,
              message: 'Feed obtenido exitosamente (desde caché)',
              data: {
                posts: cachedPosts,
                total: cachedPosts.length,
                hasMore: cachedPosts.length === limit
              }
            });
          }
        }
        
        const result = await PostService.getFeedWithWorkers(options);
        
        // Los posts ya están transformados en el servicio
        res.status(200).json({
          success: true,
          message: 'Feed obtenido exitosamente',
          data: result
        });
      } catch (error) {
        next(error);
      }
    });
  }

  // Obtener publicación por ID (NO BLOQUEANTE)
  static async getPostById(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        const { id } = req.params;
        const userId = req.user?.id || null;
        
        const post = await PostService.getPostById(id, userId);
        
        if (!post) {
          return res.status(404).json({
            success: false,
            message: 'Publicación no encontrada'
          });
        }
        
        // El post ya está transformado en el servicio
        res.status(200).json({
          success: true,
          message: 'Publicación obtenida exitosamente',
          data: { post }
        });
      } catch (error) {
        next(error);
      }
    });
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
  // Obtener publicaciones de un usuario específico (NO BLOQUEANTE)
  static async getUserPosts(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        const { userId } = req.params;
        const options = {
          ...req.query,
          requesterId: req.user?.id || null,
          limit: parseInt(req.query.limit) || 15 // Reducir límite por defecto
        };
        
        const result = await PostService.getUserPosts(userId, options);
        
        // Los posts ya están transformados en el servicio
        res.status(200).json({
          success: true,
          message: 'Publicaciones obtenidas exitosamente',
          data: result
        });
      } catch (error) {
        next(error);
      }
    });
  }

  // Obtener publicaciones del usuario autenticado (NO BLOQUEANTE)
  static async getMyPosts(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        const options = {
          ...req.query,
          requesterId: req.user.id,
          limit: parseInt(req.query.limit) || 15 // Reducir límite por defecto
        };
        
        const result = await PostService.getUserPosts(req.user.id, options);
      
        // Los posts ya están transformados en el servicio
        res.status(200).json({
          success: true,
          message: 'Publicaciones obtenidas exitosamente',
          data: result
        });
      } catch (error) {
        next(error);
      }
    });
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
  // Obtener posts de usuarios seguidos (NO BLOQUEANTE)
  static async getFollowingPosts(req, res, next) {
    // Usar setImmediate para evitar bloquear el event loop
    setImmediate(async () => {
      try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // Reducir límite por defecto
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
    });
  }
}

module.exports = PostController;
