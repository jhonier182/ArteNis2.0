const SearchService = require('../services/searchService');
const { responses } = require('../utils/apiResponse');

class SearchController {
  /**
   * Búsqueda general unificada
   * GET /api/search?q=prueba&city=Bogotá&type=all&page=1&limit=15
   */
  static async search(req, res, next) {
    try {
      const { q, city, type = 'all', page = 1, limit = 15 } = req.query;

      // Validación: si type es 'all', se requiere query
      // Si type es específico (artists, posts, boards), el query puede estar vacío
      const isEmptyQueryAllowed = type !== 'all';
      
      if (!isEmptyQueryAllowed && (!q || q.trim().length < 2)) {
        return responses.badRequest(res, 'La búsqueda debe tener al menos 2 caracteres');
      }

      const results = await SearchService.search({
        q: q ? q.trim() : '',
        city: city || undefined,
        type,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return responses.ok(res, 'Búsqueda realizada exitosamente', results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sugerencias de búsqueda inteligente
   * GET /api/search/suggestions?q=prueba
   */
  static async getSearchSuggestions(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return responses.ok(res, 'Sugerencias obtenidas', { suggestions: [] });
      }

      const suggestions = await SearchService.getSearchSuggestions(q);

      return responses.ok(res, 'Sugerencias obtenidas exitosamente', { suggestions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Filtros populares
   * GET /api/search/filters
   */
  static async getPopularFilters(req, res, next) {
    try {
      const filters = SearchService.getPopularFilters();

      return responses.ok(res, 'Filtros populares obtenidos exitosamente', { filters });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SearchController;
