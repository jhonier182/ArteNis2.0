const { AppError, DeadlockError } = require('../utils/errors');
const logger = require('../utils/logger');

// Rutas comunes que los navegadores solicitan automáticamente (no son errores reales)
const ignoredRoutes = ['/favicon.ico', '/robots.txt', '/sitemap.xml', '/apple-touch-icon.png'];

// Middleware para manejar errores 404
const notFound = (req, res, next) => {
  // Ignorar silenciosamente rutas comunes solicitadas por navegadores
  if (ignoredRoutes.includes(req.originalUrl)) {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado'
    });
  }
  
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware principal para manejo de errores
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errorCode = null;
  let errors = null;

  // Si es una instancia de AppError, usar sus propiedades
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    
    // Si tiene errores adicionales (como ValidationError)
    if (err.errors) {
      errors = err.errors;
    }

    // Si es DeadlockError, agregar retryAfter
    if (err instanceof DeadlockError) {
      return res.status(statusCode).json({
        success: false,
        message,
        error: errorCode,
        retryAfter: err.retryAfter,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          originalError: err.message 
        })
      });
    }

    // Respuesta para otros AppErrors
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorCode,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack 
      })
    });
  }

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Errores de validación';
    errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: 'VALIDATION_ERROR',
      errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Error de restricción única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'El recurso ya existe';
    const field = err.errors[0]?.path || 'campo';
    
    return res.status(statusCode).json({
      success: false,
      message: `${field} ya está en uso`,
      error: 'UNIQUE_CONSTRAINT_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Error de deadlock de MySQL
  if (err.message && err.message.includes('Deadlock')) {
    const deadlockError = new DeadlockError();
    return res.status(deadlockError.statusCode).json({
      success: false,
      message: deadlockError.message,
      error: deadlockError.errorCode,
      retryAfter: deadlockError.retryAfter,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        originalError: err.message 
      })
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
    errorCode = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Log del error (solo si no es una ruta ignorada)
  if (!ignoredRoutes.includes(req.originalUrl)) {
    logger.error('Error no manejado', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      user: req.user?.id || 'No autenticado',
      statusCode
    });
  }

  // Respuesta de error
  const errorResponse = {
    success: false,
    message,
    ...(errorCode && { error: errorCode }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.name 
    })
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  notFound,
  errorHandler
};
