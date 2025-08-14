const { body, query } = require('express-validator');

// DTO para crear tablero
const validateCreateBoard = [
  body('name')
    .notEmpty()
    .withMessage('El nombre del tablero es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres')
    .trim(),

  body('coverImage')
    .optional()
    .isURL()
    .withMessage('La imagen de portada debe ser una URL válida'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un booleano'),

  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned debe ser un booleano'),

  body('style')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El estilo no puede exceder 100 caracteres'),

  body('category')
    .optional()
    .isIn([
      'traditional', 'realistic', 'minimalist', 'geometric', 
      'watercolor', 'blackwork', 'dotwork', 'tribal', 'japanese', 'other'
    ])
    .withMessage('Categoría inválida'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array')
    .custom((tags) => {
      if (tags.length > 20) {
        throw new Error('Máximo 20 tags permitidos');
      }
      return true;
    }),

  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada tag debe tener entre 1 y 50 caracteres'),

  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings debe ser un objeto'),

  body('settings.allowCollaborators')
    .optional()
    .isBoolean()
    .withMessage('allowCollaborators debe ser un booleano'),

  body('settings.allowComments')
    .optional()
    .isBoolean()
    .withMessage('allowComments debe ser un booleano'),

  body('settings.allowDownloads')
    .optional()
    .isBoolean()
    .withMessage('allowDownloads debe ser un booleano'),

  body('settings.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications debe ser un booleano'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder debe ser un número entero positivo')
];

// DTO para actualizar tablero
const validateUpdateBoard = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres')
    .trim(),

  body('coverImage')
    .optional()
    .isURL()
    .withMessage('La imagen de portada debe ser una URL válida'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un booleano'),

  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned debe ser un booleano'),

  body('style')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El estilo no puede exceder 100 caracteres'),

  body('category')
    .optional()
    .isIn([
      'traditional', 'realistic', 'minimalist', 'geometric', 
      'watercolor', 'blackwork', 'dotwork', 'tribal', 'japanese', 'other'
    ])
    .withMessage('Categoría inválida'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array')
    .custom((tags) => {
      if (tags.length > 20) {
        throw new Error('Máximo 20 tags permitidos');
      }
      return true;
    }),

  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings debe ser un objeto')
];

// DTO para agregar post a tablero
const validateAddPostToBoard = [
  body('postId')
    .notEmpty()
    .withMessage('El ID del post es requerido')
    .isUUID()
    .withMessage('ID de post inválido'),

  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La nota no puede exceder 500 caracteres'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder debe ser un número entero positivo')
];

// DTO para búsqueda de tableros
const validateSearchBoards = [
  query('q')
    .optional()
    .isLength({ min: 2 })
    .withMessage('La búsqueda debe tener al menos 2 caracteres'),

  query('category')
    .optional()
    .isIn([
      'traditional', 'realistic', 'minimalist', 'geometric', 
      'watercolor', 'blackwork', 'dotwork', 'tribal', 'japanese', 'other'
    ])
    .withMessage('Categoría inválida'),

  query('style')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El estilo no puede exceder 100 caracteres'),

  query('sortBy')
    .optional()
    .isIn(['followers', 'posts', 'recent', 'name'])
    .withMessage('sortBy debe ser: followers, posts, recent o name'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order debe ser: asc o desc'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100')
];

// DTO para obtener posts de tablero
const validateGetBoardPosts = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100'),

  query('sortBy')
    .optional()
    .isIn(['recent', 'oldest', 'popular', 'custom'])
    .withMessage('sortBy debe ser: recent, oldest, popular o custom')
];

module.exports = {
  validateCreateBoard,
  validateUpdateBoard,
  validateAddPostToBoard,
  validateSearchBoards,
  validateGetBoardPosts
};
