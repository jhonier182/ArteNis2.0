const express = require('express');
const SearchController = require('../controllers/searchController');
const { optionalAuth } = require('../middlewares/auth');
const { sanitizeQuery, handleValidationErrors } = require('../middlewares/validation');
const { validateSearch, validateSearchSuggestions } = require('../middlewares/searchValidation');

const router = express.Router();

// GET /api/search - Búsqueda general unificada
// Parámetros: q (requerido), city (opcional), type (opcional: all|artists|posts|boards), page, limit
router.get('/',
  optionalAuth,
  sanitizeQuery,
  validateSearch,
  handleValidationErrors,
  SearchController.search
);

// GET /api/search/suggestions - Sugerencias de búsqueda
// Parámetros: q (opcional, mínimo 2 caracteres)
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

module.exports = router;
