const { BadRequestError } = require('../utils/errors');
const sharp = require('sharp');

/**
 * Middleware para validar que se haya subido un archivo de media
 * Exige formato vertical 9:16 (1080x1920 o proporciones similares)
 */
const validateMediaUpload = async (req, res, next) => {
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

  // Validar dimensiones para imágenes (formato vertical 9:16)
  const isImage = req.file.mimetype.startsWith('image/');
  if (isImage) {
    try {
      const metadata = await sharp(req.file.buffer).metadata();
      const { width, height } = metadata;
      
      // Calcular aspect ratio
      const aspectRatio = width / height;
      const targetRatio = 9 / 16; // 0.5625
      const tolerance = 0.1; // 10% de tolerancia
      
      // Validar que sea formato vertical (height > width)
      if (height <= width) {
        return res.status(400).json({
          success: false,
          message: 'La imagen debe ser en formato vertical (altura mayor que ancho). Formato requerido: 9:16 (ej: 1080x1920)',
          error: 'INVALID_ASPECT_RATIO',
          currentDimensions: `${width}x${height}`,
          requiredRatio: '9:16',
          currentRatio: `${width}:${height}`
        });
      }
      
      // Validar aspect ratio aproximado a 9:16
      if (Math.abs(aspectRatio - targetRatio) > tolerance) {
        return res.status(400).json({
          success: false,
          message: `La imagen debe tener un aspect ratio de 9:16. Formato recomendado: 1080x1920px. Tu imagen: ${width}x${height}px`,
          error: 'INVALID_ASPECT_RATIO',
          currentDimensions: `${width}x${height}`,
          requiredRatio: '9:16',
          currentRatio: `${width}:${height}`,
          currentAspectRatio: aspectRatio.toFixed(3),
          targetAspectRatio: targetRatio.toFixed(3)
        });
      }
      
      // Validar dimensiones mínimas
      const minWidth = 540; // Mitad de 1080
      const minHeight = 960; // Mitad de 1920
      
      if (width < minWidth || height < minHeight) {
        return res.status(400).json({
          success: false,
          message: `La imagen es demasiado pequeña. Dimensiones mínimas: ${minWidth}x${minHeight}px. Formato recomendado: 1080x1920px`,
          error: 'IMAGE_TOO_SMALL',
          currentDimensions: `${width}x${height}`,
          minimumDimensions: `${minWidth}x${minHeight}`,
          recommendedDimensions: '1080x1920'
        });
      }
    } catch (error) {
      // Si sharp falla, continuar sin validación de dimensiones (fallback)
      console.warn('Error validando dimensiones de imagen:', error.message);
    }
  }

  // Para videos, la validación de dimensiones se puede hacer después de subir
  // o usando ffprobe si está disponible. Por ahora solo validamos tipo y tamaño.

  next();
};

module.exports = {
  validateMediaUpload
};

