const { v2: cloudinary } = require('cloudinary');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Función para subir imagen de avatar
const uploadAvatar = async (imageBuffer, userId) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'avatars', // Carpeta en Cloudinary
        public_id: `avatar_${userId}`, // ID único por usuario
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        overwrite: true, // Sobrescribir avatar anterior
        invalidate: true, // Invalidar CDN para este recurso
        resource_type: 'image'
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

// Función para eliminar imagen de avatar
const deleteAvatar = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
      type: 'upload'
    });
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
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

// Función para eliminar imagen de post
const deletePostImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
      type: 'upload'
    });
    return true;
  } catch (error) {
    console.error('Error deleting post image from Cloudinary:', error);
    return false;
  }
};

// Función para eliminar video de post
const deletePostVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'video',
      type: 'upload'
    });
    return true;
  } catch (error) {
    console.error('Error deleting post video from Cloudinary:', error);
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
