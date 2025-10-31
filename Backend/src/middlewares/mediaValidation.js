const { BadRequestError } = require('../utils/errors');

/**
 * Middleware para validar que se haya subido un archivo de media
 */
const validateMediaUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un archivo de imagen o video',
      error: 'MISSING_FILE'
    });
  }

  // Validar tipo MIME
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no soportado',
      error: 'INVALID_FILE_TYPE',
      allowedTypes: allowedMimeTypes
    });
  }

  // Validar tamaño (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande. Máximo 50MB',
      error: 'FILE_TOO_LARGE',
      maxSize: maxSize
    });
  }

  next();
};

module.exports = {
  validateMediaUpload
};

