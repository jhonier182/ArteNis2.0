const { uploadPostImage, uploadPostVideo } = require('../config/cloudinary');
const { BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');
const taskQueue = require('../utils/taskQueue');

class MediaService {
  /**
   * Sube media (imagen o video) para un post
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} userId - ID del usuario
   * @param {string} mimeType - Tipo MIME del archivo
   * @param {string} postId - ID del post (opcional, se genera si no se proporciona)
   * @returns {Promise<{url: string, publicId: string, thumbnailUrl?: string, type: string}>}
   */
  static async uploadPostMedia(fileBuffer, userId, mimeType, postId = null) {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new BadRequestError('Se requiere un buffer de archivo válido');
    }

    if (!mimeType) {
      throw new BadRequestError('Se requiere el tipo MIME del archivo');
    }

    // Generar ID único para el post si no se proporciona
    const mediaPostId = postId || Date.now().toString();
    const isVideo = mimeType.startsWith('video/');

    logger.info('Iniciando upload de media', {
      userId,
      postId: mediaPostId,
      type: isVideo ? 'video' : 'image',
      mimeType
    });

    try {
      // Usar task queue para operaciones pesadas de Cloudinary
      const uploadTask = async () => {
        let result;
        
        if (isVideo) {
          // Subir video a Cloudinary
          result = await uploadPostVideo(
            fileBuffer,
            userId,
            mediaPostId,
            mimeType
          );
        } else {
          // Subir imagen a Cloudinary
          result = await uploadPostImage(
            fileBuffer,
            userId,
            mediaPostId
          );
        }

        return {
          url: result.url,
          publicId: result.publicId,
          thumbnailUrl: result.thumbnailUrl || null,
          type: isVideo ? 'video' : 'image'
        };
      };

      // Procesar upload en task queue con prioridad alta
      const result = await taskQueue.add(uploadTask, 'high');

      logger.info('Media subido exitosamente', {
        userId,
        postId: mediaPostId,
        type: result.type,
        publicId: result.publicId
      });

      return result;
    } catch (error) {
      logger.error('Error subiendo media a Cloudinary', {
        userId,
        postId: mediaPostId,
        error: error.message,
        stack: error.stack
      });
      
      throw new BadRequestError(
        isVideo ? 'Error al subir el video' : 'Error al subir la imagen'
      );
    }
  }
}

module.exports = MediaService;

