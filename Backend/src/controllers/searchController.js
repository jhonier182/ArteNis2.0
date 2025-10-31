const SearchService = require('../services/searchService');
const { searchUsers } = require('../config/performanceOptimization');
const { responses } = require('../utils/apiResponse');

class SearchController {
  // Buscar usuarios
  static async searchUsers(req, res, next) {
    try {
      const { q, limit = 15 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return responses.badRequest(res, 'La búsqueda debe tener al menos 2 caracteres', 'VALIDATION_ERROR');
      }
      
      // Usar función optimizada con caché
      const cachedResults = await searchUsers(q.trim(), parseInt(limit));
      
      const result = await SearchService.formatUserSearchResults(cachedResults || [], q.trim());
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda realizada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda global
  static async globalSearch(req, res, next) {
    try {
      const results = await SearchService.globalSearch(req.query);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda realizada exitosamente',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda específica de artistas
  static async searchArtists(req, res, next) {
    try {
      const { q } = req.query;
      const results = await SearchService.searchArtists(q, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda de artistas realizada exitosamente',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda específica de publicaciones
  static async searchPosts(req, res, next) {
    try {
      const { q } = req.query;
      const results = await SearchService.searchPosts(q, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda de publicaciones realizada exitosamente',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda específica de tableros
  static async searchBoards(req, res, next) {
    try {
      const { q } = req.query;
      const results = await SearchService.searchBoards(q, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda de tableros realizada exitosamente',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // Contenido trending para el feed principal
  static async getTrendingContent(req, res, next) {
    try {
      const results = await SearchService.getTrendingContent(req.query);
      
      res.status(200).json({
        success: true,
        message: 'Contenido trending obtenido exitosamente',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar artistas cercanos por geolocalización
  static async findNearbyArtists(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        return responses.badRequest(res, 'Las coordenadas de latitud y longitud son requeridas', 'MISSING_REQUIRED_FIELDS');
      }

      const artists = await SearchService.findNearbyArtists(
        parseFloat(lat),
        parseFloat(lng),
        parseInt(radius) || 50,
        req.query
      );
      
      res.status(200).json({
        success: true,
        message: 'Artistas cercanos encontrados exitosamente',
        data: { artists }
      });
    } catch (error) {
      next(error);
    }
  }

  // Sugerencias de búsqueda inteligente
  static async getSearchSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.status(200).json({
          success: true,
          message: 'Sugerencias obtenidas',
          data: { suggestions: [] }
        });
      }

      const suggestions = await SearchService.getSearchSuggestions(q);
      
      res.status(200).json({
        success: true,
        message: 'Sugerencias obtenidas exitosamente',
        data: { suggestions }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener filtros populares
  static async getPopularFilters(req, res, next) {
    try {
      const filters = SearchService.getPopularFilters();
      
      res.status(200).json({
        success: true,
        message: 'Filtros populares obtenidos exitosamente',
        data: { filters }
      });
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda por voz (texto convertido)
  static async voiceSearch(req, res, next) {
    try {
      const { transcription } = req.body;
      
      if (!transcription) {
        return responses.badRequest(res, 'La transcripción de voz es requerida', 'MISSING_REQUIRED_FIELDS');
      }

      // Procesar la transcripción para extraer intención
      const processedQuery = await SearchService.processVoiceQuery(transcription);
      
      // Realizar búsqueda con los parámetros procesados
      const results = await SearchService.globalSearch(processedQuery);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda por voz realizada exitosamente',
        data: {
          originalQuery: transcription,
          processedQuery,
          results
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda avanzada con múltiples filtros
  static async advancedSearch(req, res, next) {
    try {
      const results = await SearchService.advancedSearch(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda avanzada realizada exitosamente',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SearchController;
