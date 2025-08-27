const { User, Post, Follow } = require('../models');
const { uploadAvatar: cloudinaryUploadAvatar, deleteAvatar } = require('../config/cloudinary');

class ProfileService {
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

  // Subir avatar del usuario
  static async uploadAvatar(userId, imageBuffer) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si el usuario ya tiene avatar, eliminar el anterior
      if (user.avatar && user.cloudinaryPublicId) {
        await deleteAvatar(user.cloudinaryPublicId);
      }

      // Subir nueva imagen a Cloudinary
      const { url, publicId } = await cloudinaryUploadAvatar(imageBuffer, userId);

      // Actualizar usuario con nueva URL de avatar
      await user.update({
        avatar: url,
        cloudinaryPublicId: publicId
      });

      return {
        user: user.toJSON(),
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

      // Campos permitidos para actualización
      const allowedFields = [
        'fullName', 'bio', 'phone', 'city', 'state', 'country',
        'studioName', 'studioAddress', 'pricePerHour', 'experience', 'specialties'
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

module.exports = ProfileService;
