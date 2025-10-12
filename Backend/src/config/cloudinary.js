const { v2: cloudinary } = require('cloudinary');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Función para subir imagen de avatar (ULTRA OPTIMIZADA)
const uploadAvatar = async (imageBuffer, userId) => {
  try {
    // OPTIMIZACIÓN CRÍTICA: Detectar tipo de imagen de forma más rápida
    const isJPEG = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
    const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
    const mimeType = isJPEG ? 'image/jpeg' : isPNG ? 'image/png' : 'image/jpeg';

    // OPTIMIZACIÓN CRÍTICA: Configuración ultra rápida
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'avatars',
        public_id: `avatar_${userId}`,
        // OPTIMIZACIÓN: Transformación mínima para velocidad máxima
        transformation: [
          { 
            width: 400, 
            height: 400, 
            crop: 'fill', 
            gravity: 'face',
            quality: 'auto:low', // Calidad baja para velocidad máxima
            fetch_format: 'auto'
          }
        ],
        overwrite: true,
        invalidate: false, // No invalidar CDN para velocidad
        resource_type: 'image',
        // OPTIMIZACIÓN: Configuraciones para velocidad extrema
        eager_async: true,
        use_filename: false,
        unique_filename: false,
        // OPTIMIZACIÓN: Reducir metadatos
        context: false,
        tags: false,
        // OPTIMIZACIÓN: Timeout más agresivo
        timeout: 10000 // 10 segundos máximo
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error al subir la imagen');
  }
};

// Función para eliminar imagen de avatar (OPTIMIZADA)
const deleteAvatar = async (publicId) => {
  try {
    // OPTIMIZACIÓN: Eliminación asíncrona con timeout
    const deletePromise = cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
      type: 'upload'
    });

    // Timeout de 5 segundos para evitar bloqueos largos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout eliminando avatar')), 5000);
    });

    await Promise.race([deletePromise, timeoutPromise]);
    return true;
  } catch (error) {

    return false; // No fallar si no se puede eliminar
  }
};

// Función para subir imagen de post
const uploadPostImage = async (imageBuffer, userId, postId) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'posts',
        public_id: `post_${userId}_${postId}_${Date.now()}`,
        transformation: [
          { width: 1080, height: 1080, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading post image to Cloudinary:', error);
    throw new Error('Error al subir la imagen del post');
  }
};

// Función para subir video de post
const uploadPostVideo = async (videoBuffer, userId, postId, mimeType) => {
  try {
    // Determinar el formato basado en el mime type
    let format = 'mp4';
    if (mimeType.includes('mov')) format = 'mov';
    if (mimeType.includes('avi')) format = 'avi';
    if (mimeType.includes('quicktime')) format = 'mov';

    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${videoBuffer.toString('base64')}`,
      {
        folder: 'posts/videos',
        public_id: `video_${userId}_${postId}_${Date.now()}`,
        resource_type: 'video',
        transformation: [
          { width: 1080, height: 1080, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        eager: [
          { width: 300, height: 300, crop: 'fill', format: 'jpg' } // Generar thumbnail
        ]
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnailUrl: result.eager?.[0]?.secure_url || null
    };
  } catch (error) {
    console.error('Error uploading post video to Cloudinary:', error);
    throw new Error('Error al subir el video del post');
  }
};

// Función para eliminar imagen de post (OPTIMIZADA)
const deletePostImage = async (publicId) => {
  try {
    // OPTIMIZACIÓN: Eliminación con timeout agresivo
    const deletePromise = cloudinary.uploader.destroy(publicId, {
      invalidate: false, // No invalidar CDN para velocidad
      resource_type: 'image',
      type: 'upload'
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout eliminando imagen')), 3000);
    });

    await Promise.race([deletePromise, timeoutPromise]);
    return true;
  } catch (error) {

    return false;
  }
};

// Función para eliminar video de post (OPTIMIZADA)
const deletePostVideo = async (publicId) => {
  try {
    // OPTIMIZACIÓN: Eliminación con timeout agresivo
    const deletePromise = cloudinary.uploader.destroy(publicId, {
      invalidate: false, // No invalidar CDN para velocidad
      resource_type: 'video',
      type: 'upload'
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout eliminando video')), 5000);
    });

    await Promise.race([deletePromise, timeoutPromise]);
    return true;
  } catch (error) {

    return false;
  }
};

// Función para generar URLs optimizadas
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto'
  };

  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

module.exports = {
  cloudinary,
  uploadAvatar,
  deleteAvatar,
  uploadPostImage,
  uploadPostVideo,
  deletePostImage,
  deletePostVideo,
  getOptimizedUrl
};
