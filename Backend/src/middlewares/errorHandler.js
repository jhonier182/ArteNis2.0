// Middleware para manejar errores 404
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware principal para manejo de errores
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Errores de validación';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
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
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Error de deadlock de MySQL
  if (err.message && err.message.includes('Deadlock')) {
    statusCode = 409;
    message = 'Error temporal debido a alta concurrencia. Por favor, inténtalo de nuevo.';
    

    
    return res.status(statusCode).json({
      success: false,
      message,
      error: 'DEADLOCK_DETECTED',
      retryAfter: 1, // Sugerir reintento después de 1 segundo
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
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Respuesta de error
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.name 
    })
  };

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      user: req.user?.id || 'No autenticado'
    });
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  notFound,
  errorHandler
};
