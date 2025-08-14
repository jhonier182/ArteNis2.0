const BoardService = require('../services/boardService');

class BoardController {
  // Crear nuevo tablero
  static async createBoard(req, res, next) {
    try {
      const board = await BoardService.createBoard(req.user.id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tablero creado exitosamente',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener tableros de un usuario
  static async getUserBoards(req, res, next) {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id || null;
      
      const result = await BoardService.getUserBoards(userId, requesterId, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Tableros obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener tableros del usuario autenticado
  static async getMyBoards(req, res, next) {
    try {
      const result = await BoardService.getUserBoards(req.user.id, req.user.id, {
        ...req.query,
        includePrivate: true
      });
      
      res.status(200).json({
        success: true,
        message: 'Mis tableros obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener tablero por ID
  static async getBoardById(req, res, next) {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id || null;
      
      const board = await BoardService.getBoardById(id, requesterId);
      
      res.status(200).json({
        success: true,
        message: 'Tablero obtenido exitosamente',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener posts de un tablero
  static async getBoardPosts(req, res, next) {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id || null;
      
      const result = await BoardService.getBoardPosts(id, requesterId, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Posts del tablero obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Agregar post a tablero
  static async addPostToBoard(req, res, next) {
    try {
      const { id } = req.params;
      const { postId, note, sortOrder } = req.body;
      
      const result = await BoardService.addPostToBoard(id, postId, req.user.id, {
        note,
        sortOrder
      });
      
      res.status(201).json({
        success: true,
        message: 'Post agregado al tablero exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Remover post de tablero
  static async removePostFromBoard(req, res, next) {
    try {
      const { id, postId } = req.params;
      
      const result = await BoardService.removePostFromBoard(id, postId, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Post removido del tablero exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Seguir tablero
  static async followBoard(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await BoardService.followBoard(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Tablero seguido exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Dejar de seguir tablero
  static async unfollowBoard(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await BoardService.unfollowBoard(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Has dejado de seguir el tablero',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar tableros públicos
  static async searchBoards(req, res, next) {
    try {
      const result = await BoardService.searchBoards(req.query);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda de tableros realizada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar tablero
  static async updateBoard(req, res, next) {
    try {
      const { id } = req.params;
      
      const board = await BoardService.updateBoard(id, req.user.id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Tablero actualizado exitosamente',
        data: { board }
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar tablero
  static async deleteBoard(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await BoardService.deleteBoard(id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Tablero eliminado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener categorías disponibles
  static async getCategories(req, res, next) {
    try {
      const categories = [
        { id: 'traditional', name: 'Tradicional', description: 'Tatuajes tradicionales y old school' },
        { id: 'realistic', name: 'Realista', description: 'Tatuajes fotorrealistas y retratos' },
        { id: 'minimalist', name: 'Minimalista', description: 'Diseños simples y líneas finas' },
        { id: 'geometric', name: 'Geométrico', description: 'Patrones y formas geométricas' },
        { id: 'watercolor', name: 'Acuarela', description: 'Estilo acuarela y colores difuminados' },
        { id: 'blackwork', name: 'Blackwork', description: 'Trabajo en negro sólido' },
        { id: 'dotwork', name: 'Dotwork', description: 'Técnica de puntos y puntillismo' },
        { id: 'tribal', name: 'Tribal', description: 'Diseños tribales y étnicos' },
        { id: 'japanese', name: 'Japonés', description: 'Estilo tradicional japonés' },
        { id: 'other', name: 'Otros', description: 'Otros estilos y categorías' }
      ];
      
      res.status(200).json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BoardController;
