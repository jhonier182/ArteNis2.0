const { User, Post, Follow } = require('../models');
const { uploadAvatar: cloudinaryUploadAvatar, deleteAvatar } = require('../config/cloudinary');
const taskQueue = require('../utils/taskQueue');
const logger = require('../utils/logger');

class ProfileService {

  // Obtener perfil del usuario autenticado (con taskQueue para operaciones pesadas)
  static async getProfile(userId) {
    try {
      // Usar task queue para operaciones de base de datos
      return await taskQueue.add(async () => {
        const user = await User.findByPk(userId);
        
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        return {
          ...user.toJSON(),
          password: undefined // Excluir contraseña
        };
      }, 'normal');
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID (con taskQueue para operaciones pesadas)
  static async getUserById(userId, requesterId = null) {
    try {
      // Usar task queue para operaciones de base de datos
      return await taskQueue.add(async () => {
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
      }, 'normal');
    } catch (error) {
      throw error;
    }
  }

  // Subir avatar del usuario (OPTIMIZADO - SOLO CLOUDINARY)
  static async uploadAvatar(userId, imageBuffer) {
    try {
      // OPTIMIZACIÓN: Obtener usuario con campos mínimos
      const user = await User.findByPk(userId, {
        attributes: ['id', 'cloudinaryPublicId']
      });
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // OPTIMIZACIÓN: Eliminar avatar anterior de forma asíncrona (no bloquear)
      const deletePromise = user.cloudinaryPublicId 
        ? deleteAvatar(user.cloudinaryPublicId).catch(error => {

            return false; // No fallar si no se puede eliminar
          })
        : Promise.resolve(true);

      // OPTIMIZACIÓN: Subir nueva imagen en paralelo con la eliminación
      const uploadPromise = cloudinaryUploadAvatar(imageBuffer, userId);

      // OPTIMIZACIÓN: Esperar ambas operaciones en paralelo
      const [, { url, publicId }] = await Promise.all([deletePromise, uploadPromise]);

      // OPTIMIZACIÓN: Actualizar solo los campos necesarios
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

      console.log('📥 [Backend] Datos recibidos para actualizar:', profileData);
      console.log('📥 [Backend] Usuario actual antes de actualizar:', {
        id: user.id,
        fullName: user.fullName,
        username: user.username
      });

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

      console.log('📤 [Backend] Datos que se van a actualizar:', updateData);

      // Actualizar usuario
      await user.update(updateData);
      
      // Recargar el usuario desde la base de datos para obtener los valores actualizados
      await user.reload();
      
      console.log('✅ [Backend] Usuario actualizado. Nuevos valores:', {
        id: user.id,
        fullName: user.fullName,
        username: user.username
      });

      return {
        user: user.toJSON(),
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProfileService;
