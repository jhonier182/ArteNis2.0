const SearchService = require('../services/searchService');
const { searchUsers } = require('../config/performanceOptimization');

class SearchController {
  // Buscar usuarios (método que se usa en las rutas)
  static async searchUsers(req, res, next) {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'La búsqueda debe tener al menos 2 caracteres'
        });
      }
      
      // Usar función optimizada con caché
      const cachedResults = await searchUsers(q.trim(), parseInt(limit));
      
      res.status(200).json({
        success: true,
        message: 'Búsqueda realizada exitosamente',
        data: {
          users: cachedResults || [],
          total: (cachedResults || []).length,
          query: q.trim()
        }
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
        return res.status(400).json({
          success: false,
          message: 'Las coordenadas de latitud y longitud son requeridas'
        });
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
        return res.status(400).json({
          success: false,
          message: 'La transcripción de voz es requerida'
        });
      }

      // Procesar la transcripción para extraer intención
      const processedQuery = await SearchController.processVoiceQuery(transcription);
      
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

  // Procesar consulta de voz para extraer intención
  static async processVoiceQuery(transcription) {
    try {
      const query = transcription.toLowerCase();
      const params = { q: query };

      // Detectar tipo de búsqueda
      if (query.includes('artista') || query.includes('tatuador')) {
        params.type = 'artists';
      } else if (query.includes('tablero') || query.includes('colección')) {
        params.type = 'boards';
      } else if (query.includes('tatuaje') || query.includes('diseño')) {
        params.type = 'posts';
      }

      // Detectar estilo
      const styles = {
        'tradicional': ['tradicional', 'old school', 'clásico'],
        'realista': ['realista', 'fotorrealista', 'realismo'],
        'minimalista': ['minimalista', 'simple', 'fino'],
        'geométrico': ['geométrico', 'geometría', 'formas'],
        'acuarela': ['acuarela', 'watercolor', 'colores'],
        'blackwork': ['negro', 'blackwork', 'black work'],
        'tribal': ['tribal', 'étnico']
      };

      for (const [style, keywords] of Object.entries(styles)) {
        if (keywords.some(keyword => query.includes(keyword))) {
          params.style = style;
          break;
        }
      }

      // Detectar ubicación
      const locationKeywords = ['cerca', 'cercano', 'en', 'de'];
      if (locationKeywords.some(keyword => query.includes(keyword))) {
        const words = query.split(' ');
        const locationIndex = words.findIndex(word => locationKeywords.includes(word));
        if (locationIndex !== -1 && words[locationIndex + 1]) {
          params.location = words[locationIndex + 1];
        }
      }

      // Detectar orden
      if (query.includes('popular') || query.includes('famoso')) {
        params.sortBy = 'followers';
      } else if (query.includes('nuevo') || query.includes('reciente')) {
        params.sortBy = 'recent';
      } else if (query.includes('mejor calificado') || query.includes('mejor rated')) {
        params.sortBy = 'rating';
      }

      return params;
    } catch (error) {
      return { q: transcription };
    }
  }

  // Búsqueda avanzada con múltiples filtros
  static async advancedSearch(req, res, next) {
    try {
      const {
        q,
        type = 'all',
        styles = [],
        bodyParts = [],
        sizes = [],
        colors = [],
        priceRange,
        location,
        radius,
        lat,
        lng,
        rating,
        isVerified,
        dateRange,
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = req.body;

      let results;

      // Si hay coordenadas, incluir búsqueda geográfica
      if (lat && lng && (type === 'all' || type === 'artists')) {
        const nearbyArtists = await SearchService.findNearbyArtists(
          parseFloat(lat),
          parseFloat(lng),
          parseInt(radius) || 50,
          {
            style: styles[0],
            priceRange,
            rating: parseFloat(rating),
            limit: type === 'artists' ? limit : 10
          }
        );

        if (type === 'artists') {
          results = {
            artists: nearbyArtists,
            pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(nearbyArtists.length / limit),
              totalItems: nearbyArtists.length,
              itemsPerPage: parseInt(limit)
            }
          };
        } else {
          results = await SearchService.globalSearch({
            q,
            type,
            style: styles[0],
            location,
            priceRange,
            sortBy,
            page,
            limit
          });
          results.nearbyArtists = nearbyArtists.slice(0, 5);
        }
      } else {
        // Búsqueda estándar
        const searchParams = {
          q,
          type,
          style: styles[0],
          location,
          priceRange,
          sortBy,
          page,
          limit,
          bodyPart: bodyParts[0],
          size: sizes[0],
          color: colors.includes('color') ? 'color' : colors.includes('black') ? 'black' : undefined,
          isVerified: isVerified === 'true',
          rating: parseFloat(rating),
          dateRange
        };

        // Remover parámetros undefined
        Object.keys(searchParams).forEach(key => {
          if (searchParams[key] === undefined || searchParams[key] === '') {
            delete searchParams[key];
          }
        });

        results = await SearchService.globalSearch(searchParams);
      }

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
