/**
 * Clases de error personalizadas para el manejo de errores en servicios
 * Los servicios deben lanzar estas excepciones en lugar de retornar { error: ... }
 */

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Error de validación', errors = [], errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
    this.errors = errors;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto de recursos', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

class DeadlockError extends ConflictError {
  constructor(message = 'Error temporal debido a alta concurrencia. Por favor, inténtalo de nuevo.', errorCode = 'DEADLOCK_DETECTED') {
    super(message, 409, errorCode);
    this.retryAfter = 1; // Sugerir reintento después de 1 segundo
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  DeadlockError
};

