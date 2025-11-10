const { query } = require('express-validator');

// Validación para búsqueda general unificada
const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('El término de búsqueda es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
    .trim(),

  query('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres')
    .trim(),

  query('type')
    .optional()
    .isIn(['all', 'artists', 'posts', 'boards'])
    .withMessage('El tipo debe ser: all, artists, posts o boards'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// Validación para sugerencias de búsqueda
const validateSearchSuggestions = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El término debe tener entre 2 y 50 caracteres')
    .trim()
];

module.exports = {
  validateSearch,
  validateSearchSuggestions
};
