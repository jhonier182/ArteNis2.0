const { query } = require('express-validator');

/**
 * Validaciones para endpoints de feed
 */

// Constantes de límites
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;

// Validaciones para GET /api/posts/feed
const validateFeed = [
  query('cursor')
    .optional()
    .isString()
    .withMessage('El cursor debe ser una cadena válida')
    .isLength({ min: 1, max: 500 })
    .withMessage('El cursor es inválido'),

  query('limit')
    .optional()
    .isInt({ min: MIN_LIMIT, max: MAX_LIMIT })
    .withMessage(`El límite debe ser un número entre ${MIN_LIMIT} y ${MAX_LIMIT}`)
    .toInt(),

  query('type')
    .optional()
    .isIn(['all', 'image', 'video', 'reel'])
    .withMessage('El tipo debe ser: all, image, video o reel'),

  query('sortBy')
    .optional()
    .isIn(['recent', 'popular', 'views', 'comments'])
    .withMessage('El ordenamiento debe ser: recent, popular, views o comments')
];

// Validaciones para GET /api/posts/public
const validatePublicPosts = [
  query('cursor')
    .optional()
    .isString()
    .withMessage('El cursor debe ser una cadena válida')
    .isLength({ min: 1, max: 500 })
    .withMessage('El cursor es inválido'),

  query('limit')
    .optional()
    .isInt({ min: MIN_LIMIT, max: MAX_LIMIT })
    .withMessage(`El límite debe ser un número entre ${MIN_LIMIT} y ${MAX_LIMIT}`)
    .toInt(),

  query('type')
    .optional()
    .isIn(['all', 'image', 'video', 'reel'])
    .withMessage('El tipo debe ser: all, image, video o reel'),

  query('style')
    .optional()
    .isString()
    .withMessage('El estilo debe ser una cadena válida')
    .isLength({ min: 1, max: 100 })
    .withMessage('El estilo no puede exceder 100 caracteres')
    .trim()
    .escape(),

  query('bodyPart')
    .optional()
    .isString()
    .withMessage('La parte del cuerpo debe ser una cadena válida')
    .isLength({ min: 1, max: 100 })
    .withMessage('La parte del cuerpo no puede exceder 100 caracteres')
    .trim()
    .escape(),

  query('location')
    .optional()
    .isString()
    .withMessage('La ubicación debe ser una cadena válida')
    .isLength({ min: 1, max: 200 })
    .withMessage('La ubicación no puede exceder 200 caracteres')
    .trim()
    .escape(),

  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured debe ser un booleano')
    .toBoolean(),

  query('sortBy')
    .optional()
    .isIn(['recent', 'popular', 'views'])
    .withMessage('El ordenamiento debe ser: recent, popular o views')
];

module.exports = {
  validateFeed,
  validatePublicPosts,
  MAX_LIMIT,
  DEFAULT_LIMIT,
  MIN_LIMIT
};

