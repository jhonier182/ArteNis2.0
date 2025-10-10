const { User, Post, Follow } = require('../models');
const { uploadAvatar: cloudinaryUploadAvatar, deleteAvatar } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cache local para avatares (ultra rápido)
const avatarCache = new Map();
const AVATAR_CACHE_DIR = path.join(__dirname, '../../uploads/avatars');

// Crear directorio de cache si no existe
if (!fs.existsSync(AVATAR_CACHE_DIR)) {
  fs.mkdirSync(AVATAR_CACHE_DIR, { recursive: true });
}

class ProfileService {
  // Guardar avatar en cache local (ultra rápido)
  static saveAvatarToCache(userId, imageBuffer) {
    try {
      const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
      const filename = `avatar_${userId}_${hash}.jpg`;
      const filepath = path.join(AVATAR_CACHE_DIR, filename);
      
      // Guardar archivo
      fs.writeFileSync(filepath, imageBuffer);
      
      // Guardar en cache en memoria
      const localUrl = `/uploads/avatars/${filename}`;
      avatarCache.set(userId, {
        url: localUrl,
        filepath,
        timestamp: Date.now()
      });
      
      return localUrl;
    } catch (error) {
      console.error('Error guardando avatar en cache local:', error);
      return null;
    }
  }

  // Obtener avatar del cache local
  static getAvatarFromCache(userId) {
    return avatarCache.get(userId);
  }

  // Limpiar cache local expirado
  static cleanAvatarCache() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [userId, cacheData] of avatarCache.entries()) {
      if (now - cacheData.timestamp > maxAge) {
        // Eliminar archivo
        try {
          if (fs.existsSync(cacheData.filepath)) {
            fs.unlinkSync(cacheData.filepath);
          }
        } catch (error) {
          console.warn('Error eliminando archivo de cache:', error);
        }
        
        // Eliminar del cache
        avatarCache.delete(userId);
      }
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(userId) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        ...user.toJSON(),
        password: undefined // Excluir contraseña
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  static async getUserById(userId, requesterId = null) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Post,
            as: 'posts',
            where: { isPublic: true },
            required: false,
            limit: 6,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si hay un solicitante, verificar si lo sigue
      let isFollowing = false;
      if (requesterId && requesterId !== userId) {
        isFollowing = await Follow.isFollowing(requesterId, userId);
      }

      return {
        ...user.toJSON(),
        isFollowing,
        postsPreview: user.posts || []
      };
    } catch (error) {
      throw error;
    }
  }

  // Subir avatar del usuario (ULTRA OPTIMIZADO CON CACHE LOCAL)
  static async uploadAvatar(userId, imageBuffer) {
    try {
      // OPTIMIZACIÓN CRÍTICA: Guardar inmediatamente en cache local
      const localUrl = this.saveAvatarToCache(userId, imageBuffer);
      
      if (localUrl) {
        // OPTIMIZACIÓN: Actualizar usuario inmediatamente con URL local
        await User.update({
          avatar: localUrl,
          cloudinaryPublicId: null // Se actualizará en background
        }, {
          where: { id: userId },
          fields: ['avatar', 'cloudinaryPublicId']
        });

        // OPTIMIZACIÓN: Procesar Cloudinary en background completamente asíncrono
        setImmediate(() => {
          this.processCloudinaryUpload(userId, imageBuffer).catch(error => {
            console.error('Error procesando Cloudinary en background:', error);
          });
        });

        return {
          avatarUrl: localUrl,
          message: 'Avatar actualizado exitosamente',
          cached: true
        };
      } else {
        // Fallback al método anterior si el cache falla
        return await this.uploadAvatarFallback(userId, imageBuffer);
      }
    } catch (error) {
      console.error('Error en uploadAvatar:', error);
      throw error;
    }
  }

  // Procesar upload a Cloudinary en background
  static async processCloudinaryUpload(userId, imageBuffer) {
    try {
      const { url, publicId } = await cloudinaryUploadAvatar(imageBuffer, userId);
      
      // Actualizar usuario con URL de Cloudinary
      await User.update({
        avatar: url,
        cloudinaryPublicId: publicId
      }, {
        where: { id: userId },
        fields: ['avatar', 'cloudinaryPublicId']
      });

      console.log(`✅ Avatar de usuario ${userId} procesado en Cloudinary`);
    } catch (error) {
      console.error('Error procesando Cloudinary:', error);
    }
  }

  // Método fallback si el cache local falla
  static async uploadAvatarFallback(userId, imageBuffer) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'avatar', 'cloudinaryPublicId']
      });
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar avatar anterior de forma asíncrona
      if (user.cloudinaryPublicId) {
        setImmediate(() => {
          deleteAvatar(user.cloudinaryPublicId).catch(error => {
            console.warn('Error eliminando avatar anterior:', error.message);
          });
        });
      }

      // Subir a Cloudinary
      const { url, publicId } = await cloudinaryUploadAvatar(imageBuffer, userId);

      // Actualizar usuario
      await user.update({
        avatar: url,
        cloudinaryPublicId: publicId
      }, {
        fields: ['avatar', 'cloudinaryPublicId']
      });

      return {
        avatarUrl: url,
        message: 'Avatar actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en uploadAvatarFallback:', error);
      throw error;
    }
  }

  // Actualizar perfil de usuario
  static async updateProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Campos permitidos para actualización
      const allowedFields = [
        'fullName', 'bio', 'phone', 'city', 'state', 'country',
        'studioName', 'studioAddress', 'pricePerHour', 'experience', 'specialties',
        'userType'
      ];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      });

      // Actualizar usuario
      await user.update(updateData);

      return {
        user: user.toJSON(),
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }
}

// Limpiar cache de avatares cada hora
setInterval(() => {
  ProfileService.cleanAvatarCache();
}, 60 * 60 * 1000); // Cada hora

module.exports = ProfileService;
