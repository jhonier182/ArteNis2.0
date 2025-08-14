const { body, query } = require('express-validator');

// Validación para búsqueda global
const validateGlobalSearch = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
    .trim(),

  query('type')
    .optional()
    .isIn(['all', 'artists', 'posts', 'boards'])
    .withMessage('El tipo debe ser: all, artists, posts o boards'),

  query('style')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El estilo no puede exceder 50 caracteres'),

  query('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),

  query('priceRange')
    .optional()
    .matches(/^\d+(-\d+)?$/)
    .withMessage('El rango de precios debe tener formato: min-max o solo min'),

  query('sortBy')
    .optional()
    .isIn(['relevance', 'recent', 'popular', 'followers', 'rating', 'price_low', 'price_high', 'nearby'])
    .withMessage('sortBy inválido'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// Validación para búsqueda de artistas
const validateSearchArtists = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
    .trim(),

  query('style')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El estilo no puede exceder 50 caracteres'),

  query('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),

  query('priceRange')
    .optional()
    .matches(/^\d+(-\d+)?$/)
    .withMessage('El rango de precios debe tener formato: min-max'),

  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La calificación debe ser entre 0 y 5'),

  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified debe ser un booleano'),

  query('sortBy')
    .optional()
    .isIn(['relevance', 'followers', 'rating', 'recent', 'price_low', 'price_high', 'nearby'])
    .withMessage('sortBy inválido para artistas'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// Validación para búsqueda de publicaciones
const validateSearchPosts = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
    .trim(),

  query('style')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El estilo no puede exceder 50 caracteres'),

  query('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),

  query('bodyPart')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La parte del cuerpo no puede exceder 50 caracteres'),

  query('size')
    .optional()
    .isIn(['pequeño', 'mediano', 'grande'])
    .withMessage('El tamaño debe ser: pequeño, mediano o grande'),

  query('color')
    .optional()
    .isIn(['color', 'black'])
    .withMessage('El color debe ser: color o black'),

  query('dateRange')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})?$/)
    .withMessage('El rango de fechas debe tener formato: YYYY-MM-DD,YYYY-MM-DD'),

  query('sortBy')
    .optional()
    .isIn(['relevance', 'popular', 'recent', 'oldest', 'trending'])
    .withMessage('sortBy inválido para posts'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// Validación para artistas cercanos
const validateNearbyArtists = [
  query('lat')
    .notEmpty()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90'),

  query('lng')
    .notEmpty()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180'),

  query('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('El radio debe ser entre 1 y 500 km'),

  query('style')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El estilo no puede exceder 50 caracteres'),

  query('priceRange')
    .optional()
    .matches(/^\d+(-\d+)?$/)
    .withMessage('El rango de precios debe tener formato: min-max'),

  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La calificación debe ser entre 0 y 5'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// Validación para búsqueda por voz
const validateVoiceSearch = [
  body('transcription')
    .notEmpty()
    .withMessage('La transcripción es requerida')
    .isLength({ min: 3, max: 500 })
    .withMessage('La transcripción debe tener entre 3 y 500 caracteres')
    .trim()
];

// Validación para búsqueda avanzada
const validateAdvancedSearch = [
  body('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
    .trim(),

  body('type')
    .optional()
    .isIn(['all', 'artists', 'posts', 'boards'])
    .withMessage('El tipo debe ser: all, artists, posts o boards'),

  body('styles')
    .optional()
    .isArray()
    .withMessage('Los estilos deben ser un array'),

  body('styles.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Cada estilo no puede exceder 50 caracteres'),

  body('bodyParts')
    .optional()
    .isArray()
    .withMessage('Las partes del cuerpo deben ser un array'),

  body('bodyParts.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Cada parte del cuerpo no puede exceder 50 caracteres'),

  body('sizes')
    .optional()
    .isArray()
    .withMessage('Los tamaños deben ser un array'),

  body('sizes.*')
    .optional()
    .isIn(['pequeño', 'mediano', 'grande'])
    .withMessage('Cada tamaño debe ser: pequeño, mediano o grande'),

  body('colors')
    .optional()
    .isArray()
    .withMessage('Los colores deben ser un array'),

  body('colors.*')
    .optional()
    .isIn(['color', 'black'])
    .withMessage('Cada color debe ser: color o black'),

  body('priceRange')
    .optional()
    .matches(/^\d+(-\d+)?$/)
    .withMessage('El rango de precios debe tener formato: min-max'),

  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),

  body('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('El radio debe ser entre 1 y 500 km'),

  body('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90'),

  body('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La calificación debe ser entre 0 y 5'),

  body('isVerified')
    .optional()
    .isIn(['true', 'false', true, false])
    .withMessage('isVerified debe ser true o false'),

  body('dateRange')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})?$/)
    .withMessage('El rango de fechas debe tener formato: YYYY-MM-DD,YYYY-MM-DD'),

  body('sortBy')
    .optional()
    .isIn(['relevance', 'recent', 'popular', 'followers', 'rating', 'price_low', 'price_high', 'nearby'])
    .withMessage('sortBy inválido'),

  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// Validación para sugerencias de búsqueda
const validateSearchSuggestions = [
  query('q')
    .notEmpty()
    .withMessage('El término de búsqueda es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El término debe tener entre 2 y 50 caracteres')
    .trim()
];

module.exports = {
  validateGlobalSearch,
  validateSearchArtists,
  validateSearchPosts,
  validateNearbyArtists,
  validateVoiceSearch,
  validateAdvancedSearch,
  validateSearchSuggestions
};
