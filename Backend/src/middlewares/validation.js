const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: formattedErrors
    });
  }

  next();
};

// Middleware simple para sanitizar query params
// - Recorta espacios en blanco
// - Normaliza valores 'true'/'false' a booleanos cuando aplica
// - Normaliza números si son enteros válidos
const sanitizeQuery = (req, res, next) => {
  try {
    if (!req.query) return next();

    Object.keys(req.query).forEach((key) => {
      const value = req.query[key];

      if (typeof value === 'string') {
        const trimmed = value.trim();

        // Convertir booleanos
        if (trimmed.toLowerCase() === 'true') {
          req.query[key] = true;
          return;
        }
        if (trimmed.toLowerCase() === 'false') {
          req.query[key] = false;
          return;
        }

        // Convertir enteros simples
        if (/^-?\d+$/.test(trimmed)) {
          const num = Number(trimmed);
          if (!Number.isNaN(num)) {
            req.query[key] = num;
            return;
          }
        }

        req.query[key] = trimmed;
      }
    });

    next();
  } catch (_) {
    // Si algo falla, continuar sin bloquear
    next();
  }
};

// Validaciones para registro de usuario
const validateRegister = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .isAlphanumeric()
    .withMessage('El nombre de usuario solo puede contener letras y números'),

  body('email')
    .notEmpty()
    .withMessage('Requerido')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Requerida')
    .isLength({ min: 8 })
    .withMessage('Mínimo 8 caracteres'),

  body('fullName')
    .notEmpty()
    .withMessage('Requerido')
    .trim()
    .custom((value) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        throw new Error('Mínimo 2 caracteres');
      }
      if (trimmed.length > 255) {
        throw new Error('Máximo 255 caracteres');
      }
      if (trimmed.split(' ').filter(word => word.length > 0).length < 2) {
        throw new Error('Mínimo 2 palabras');
      }
      if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        throw new Error('Solo letras, sin espacios, guiones y tildes');
      }
      return true;
    }),

  body('userType')
    .optional()
    .isIn(['user', 'artist'])
    .withMessage('El tipo de usuario debe ser "user" o "artist"')
];

// Validaciones para login
const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Email o nombre de usuario es requerido')
    .trim(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para crear publicación
const validateCreatePost = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('El título debe tener entre 1 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),

  body('type')
    .isIn(['image', 'video', 'reel'])
    .withMessage('El tipo debe ser: image, video o reel'),

  body('style')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El estilo no puede exceder 100 caracteres'),

  body('bodyPart')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La parte del cuerpo no puede exceder 100 caracteres')
];

// Validaciones para comentarios
const validateComment = [
  body('content')
    .notEmpty()
    .withMessage('El contenido del comentario es requerido')
    .isLength({ min: 1, max: 1000 })
    .withMessage('El comentario debe tener entre 1 y 1000 caracteres'),

  body('parentId')
    .optional()
    .isUUID()
    .withMessage('ID del comentario padre inválido')
];

// Validaciones para cambio de contraseña
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

// Validaciones para solicitar reset de contraseña
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
];

// Validaciones para resetear contraseña
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('El token de reseteo es requerido'),

  body('newPassword')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

// Validaciones para verificar email
const validateVerifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('El token de verificación es requerido')
];

module.exports = {
  handleValidationErrors,
  sanitizeQuery,
  validateRegister,
  validateLogin,
  validateCreatePost,
  validateComment,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail
};
