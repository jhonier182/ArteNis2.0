const express = require('express');
const SearchController = require('../controllers/searchController');
const { optionalAuth } = require('../middlewares/auth');
const { handleValidationErrors, sanitizeQuery } = require('../middlewares/validation');
const {
  validateGlobalSearch,
  validateSearchArtists,
  validateSearchPosts,
  validateNearbyArtists,
  validateVoiceSearch,
  validateAdvancedSearch,
  validateSearchSuggestions
} = require('../middlewares/searchValidation');

const router = express.Router();

// Rutas públicas de búsqueda

// GET /api/search - Búsqueda global
router.get('/',
  optionalAuth,
  sanitizeQuery,
  validateGlobalSearch,
  handleValidationErrors,
  SearchController.globalSearch
);

// GET /api/search/artists - Búsqueda específica de artistas
router.get('/artists',
  optionalAuth,
  sanitizeQuery,
  validateSearchArtists,
  handleValidationErrors,
  SearchController.searchArtists
);

// GET /api/search/posts - Búsqueda específica de publicaciones
router.get('/posts',
  optionalAuth,
  sanitizeQuery,
  validateSearchPosts,
  handleValidationErrors,
  SearchController.searchPosts
);

// GET /api/search/boards - Búsqueda específica de tableros
router.get('/boards',
  optionalAuth,
  sanitizeQuery,
  handleValidationErrors,
  SearchController.searchBoards
);

// GET /api/search/trending - Contenido trending
router.get('/trending',
  optionalAuth,
  sanitizeQuery,
  SearchController.getTrendingContent
);

// GET /api/search/nearby - Artistas cercanos por geolocalización
router.get('/nearby',
  optionalAuth,
  sanitizeQuery,
  validateNearbyArtists,
  handleValidationErrors,
  SearchController.findNearbyArtists
);

// GET /api/search/suggestions - Sugerencias de búsqueda inteligente
router.get('/suggestions',
  optionalAuth,
  sanitizeQuery,
  validateSearchSuggestions,
  handleValidationErrors,
  SearchController.getSearchSuggestions
);

// GET /api/search/filters - Filtros populares
router.get('/filters',
  optionalAuth,
  SearchController.getPopularFilters
);

// POST /api/search/voice - Búsqueda por voz
router.post('/voice',
  optionalAuth,
  validateVoiceSearch,
  handleValidationErrors,
  SearchController.voiceSearch
);

// POST /api/search/advanced - Búsqueda avanzada con múltiples filtros
router.post('/advanced',
  optionalAuth,
  validateAdvancedSearch,
  handleValidationErrors,
  SearchController.advancedSearch
);

// GET /api/search/users - Buscar usuarios
router.get('/users',
  optionalAuth,
  SearchController.searchUsers
);

module.exports = router;
