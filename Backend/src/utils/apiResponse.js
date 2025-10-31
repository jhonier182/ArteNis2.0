/**
 * Utilidades para estandarizar respuestas de la API
 * 
 * Todas las respuestas de la API deben seguir el formato:
 * {
 *   success: boolean,
 *   message?: string,
 *   data?: any,
 *   error?: string,
 *   errors?: array
 * }
 */

/**
 * Formato estándar de respuesta exitosa
 * @param {Object} res - Objeto response de Express
 * @param {number} statusCode - Código HTTP (default: 200)
 * @param {string} message - Mensaje descriptivo
 * @param {any} data - Datos a retornar
 * @returns {Object} Respuesta JSON estandarizada
 */
const successResponse = (res, statusCode = 200, message = null, data = null) => {
  const response = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Formato estándar de respuesta de error
 * @param {Object} res - Objeto response de Express
 * @param {number} statusCode - Código HTTP
 * @param {string} message - Mensaje de error
 * @param {string} errorCode - Código de error estandarizado
 * @param {array} errors - Array de errores de validación (opcional)
 * @returns {Object} Respuesta JSON estandarizada
 */
const errorResponse = (res, statusCode, message, errorCode = null, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errorCode) {
    response.error = errorCode;
  }

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuestas rápidas comunes
 */
const responses = {
  // Respuestas exitosas
  ok: (res, message = 'Operación exitosa', data = null) => {
    return successResponse(res, 200, message, data);
  },

  created: (res, message = 'Recurso creado exitosamente', data = null) => {
    return successResponse(res, 201, message, data);
  },

  noContent: (res) => {
    return res.status(204).send();
  },

  // Respuestas de error
  badRequest: (res, message = 'Solicitud inválida', errorCode = 'BAD_REQUEST', errors = null) => {
    return errorResponse(res, 400, message, errorCode, errors);
  },

  unauthorized: (res, message = 'No autorizado', errorCode = 'UNAUTHORIZED') => {
    return errorResponse(res, 401, message, errorCode);
  },

  forbidden: (res, message = 'Acceso denegado', errorCode = 'FORBIDDEN') => {
    return errorResponse(res, 403, message, errorCode);
  },

  notFound: (res, message = 'Recurso no encontrado', errorCode = 'NOT_FOUND') => {
    return errorResponse(res, 404, message, errorCode);
  },

  conflict: (res, message = 'Conflicto con el estado actual', errorCode = 'CONFLICT') => {
    return errorResponse(res, 409, message, errorCode);
  },

  internalError: (res, message = 'Error interno del servidor', errorCode = 'INTERNAL_ERROR') => {
    return errorResponse(res, 500, message, errorCode);
  }
};

module.exports = {
  successResponse,
  errorResponse,
  responses
};

