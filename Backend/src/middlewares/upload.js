const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento en memoria para Cloudinary
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
  
  const isImage = allowedImageTypes.includes(file.mimetype);
  const isVideo = allowedVideoTypes.includes(file.mimetype);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo excede el tamaño máximo permitido (50MB)'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error al procesar el archivo'
        });
    }
  }

  if (error && error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP, MP4, MOV, AVI'
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleMulterError
};