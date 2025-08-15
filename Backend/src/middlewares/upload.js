const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento en memoria para Cloudinary
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  console.log('🔍 FileFilter - Archivo recibido:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    encoding: file.encoding,
    size: file.size
  });

  // Verificar que el archivo sea válido
  if (!file || !file.mimetype) {
    console.log('❌ FileFilter - Archivo inválido o corrupto');
    return cb(new Error('Archivo inválido o corrupto'), false);
  }
  
  // En React Native, file.size puede ser undefined, pero el archivo sigue siendo válido
  console.log('🔍 FileFilter - Tamaño del archivo:', file.size || 'No disponible (React Native)');

  // Tipos de archivo permitidos
  const allowedImageTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff'
  ];
  const allowedVideoTypes = [
    'video/mp4', 
    'video/mov', 
    'video/avi',
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  const isImage = allowedImageTypes.includes(file.mimetype);
  const isVideo = allowedVideoTypes.includes(file.mimetype);

  console.log('🔍 FileFilter - Validación:', {
    isImage,
    isVideo,
    mimetype: file.mimetype,
    allowed: isImage || isVideo,
    size: file.size || 'No disponible',
    buffer: file.buffer ? 'Presente' : 'No disponible'
  });

  if (isImage || isVideo) {
    console.log('✅ FileFilter - Archivo aceptado');
    cb(null, true);
  } else {
    console.log('❌ FileFilter - Archivo rechazado:', file.mimetype);
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
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

// Middleware para debuggear multer
const debugMulter = (req, res, next) => {
  console.log('🔍 Debug Multer:');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('Body keys:', Object.keys(req.body));
  console.log('Body content:', req.body);
  console.log('Files:', req.files);
  console.log('File:', req.file);
  
  // Verificar si hay algún middleware que esté interfiriendo
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('⚠️  ADVERTENCIA: El body ya tiene contenido antes de multer');
    console.log('Body content:', req.body);
    
    // Detectar si el archivo llegó como objeto en lugar de archivo real
    if (req.body.image && typeof req.body.image === 'string' && req.body.image.includes('[object Object]')) {
      console.log('🚨 PROBLEMA DETECTADO: El archivo llegó como objeto serializado, no como archivo binario');
      console.log('🚨 Esto indica un problema en el cliente (React Native)');
    }
  }
  
  next();
};

// Log de configuración de multer
console.log('🔧 Configuración de Multer:');
console.log('Storage:', storage);
console.log('FileFilter:', fileFilter);
console.log('Limits:', { fileSize: '50MB' });

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
  handleMulterError,
  debugMulter
};