const PostService = require('../services/postService');

class PostController {
  // Crear nueva publicación
  static async createPost(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un archivo de imagen o video'
        });
      }

      // En un proyecto real, aquí subirías el archivo a Cloudinary
      const mediaUrl = `uploads/${req.file.filename}`;
      const cloudinaryPublicId = req.file.filename;

      const post = await PostService.createPost(
        req.user.id,
        req.body,
        mediaUrl,
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
      const result = await PostService.getFeed(req.query);
      
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
        requesterId: req.user.id
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
}

module.exports = PostController;
