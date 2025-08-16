const { Op } = require('sequelize');
const { Post, User, Comment, Like } = require('../models');
const { sequelize } = require('../config/db');

class PostService {
  // Función helper para transformar posts al formato esperado por el frontend
  static transformPostForFrontend(post) {
    const postData = post.toJSON ? post.toJSON() : post;
    console.log('🔍 Transformando post:', {
      id: postData.id,
      mediaUrl: postData.mediaUrl,
      imageUrl: postData.mediaUrl
    });
    
    const transformed = {
      ...postData,
      imageUrl: postData.mediaUrl, // Transformar mediaUrl a imageUrl
      hashtags: postData.tags || [], // Transformar tags a hashtags
      isLiked: postData.hasLiked || false, // Asegurar que isLiked esté presente
      likesCount: postData.likesCount || 0,
      commentsCount: postData.commentsCount || 0,
      viewsCount: postData.viewsCount || 0,
      savesCount: postData.savesCount || 0,
      description: postData.description || '',
      // Asegurar que el autor tenga los campos necesarios
      author: postData.author ? {
        id: postData.author.id,
        username: postData.author.username,
        fullName: postData.author.fullName,
        avatar: postData.author.avatar || null,
        isVerified: postData.author.isVerified || false,
        userType: postData.author.userType || 'user'
      } : null
    };
    
    console.log('🔍 Post transformado:', {
      id: transformed.id,
      imageUrl: transformed.imageUrl,
      author: transformed.author
    });
    
    return transformed;
  }

  // Función helper para transformar múltiples posts
  static transformPostsForFrontend(posts) {
    return posts.map(post => this.transformPostForFrontend(post));
  }

  // Crear nueva publicación
  static async createPost(userId, postData, mediaUrl, cloudinaryPublicId) {
    try {
      const post = await Post.create({
        userId,
        title: postData.description?.substring(0, 255) || 'Nuevo tatuaje', // Usar descripción como título
        description: postData.description || '',
        type: postData.type || 'image',
        mediaUrl,
        cloudinaryPublicId,
        tags: postData.hashtags || [],
        style: postData.style || null,
        bodyPart: postData.bodyPart || null,
        location: postData.location || null,
        isPremiumContent: postData.isPremiumContent || false,
        allowComments: postData.allowComments !== false,
        // Inicializar explícitamente los contadores
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        savesCount: 0,
        // Asegurar que el estado sea correcto
        status: 'published',
        isPublic: true,
        isFeatured: false,
        // Establecer fecha de publicación
        publishedAt: new Date()
      });

      // Incrementar contador de posts del usuario
      await User.increment('postsCount', {
        where: { id: userId }
      });

      return post;
    } catch (error) {
      throw error;
    }
  }

  // Obtener feed de publicaciones
  static async getFeed(options = {}) {
    try {
      console.log('🔍 getFeed service llamado con opciones:', options);
      const {
        page = 1,
        limit = 20,
        type = 'all',
        style,
        bodyPart,
        location,
        featured,
        sortBy = 'recent'
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        isPublic: true,
        status: 'published'
      };
      console.log('🔍 Where clause:', where);

      // Filtros
      if (type !== 'all') {
        where.type = type;
      }

      if (style) {
        where.style = { [Op.like]: `%${style}%` };
      }

      if (bodyPart) {
        where.bodyPart = { [Op.like]: `%${bodyPart}%` };
      }

      if (location) {
        where.location = { [Op.like]: `%${location}%` };
      }

      if (featured !== undefined) {
        where.isFeatured = featured;
      }

      // Ordenamiento
      const orderBy = [];
      switch (sortBy) {
        case 'popular':
          orderBy.push(['likesCount', 'DESC']);
          break;
        case 'views':
          orderBy.push(['viewsCount', 'DESC']);
          break;
        case 'comments':
          orderBy.push(['commentsCount', 'DESC']);
          break;
        default:
          orderBy.push(['createdAt', 'DESC']);
      }

      const posts = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          }
        ],
        order: orderBy,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      console.log('🔍 Posts encontrados:', posts.rows.length);
      console.log('🔍 Primer post:', posts.rows[0] ? {
        id: posts.rows[0].id,
        mediaUrl: posts.rows[0].mediaUrl,
        author: posts.rows[0].author
      } : 'No hay posts');

      return {
        posts: posts.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(posts.count / limit),
          totalItems: posts.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener publicación por ID
  static async getPostById(postId, userId = null) {
    try {
      const post = await Post.findByPk(postId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'fullName', 'avatar']
              }
            ],
            where: { parentId: null },
            required: false,
            order: [['createdAt', 'DESC']],
            limit: 10
          }
        ]
      });

      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      // Incrementar contador de vistas
      await post.incrementViews();

      // Verificar si el usuario ha dado like
      let hasLiked = false;
      if (userId) {
        const like = await Like.exists(userId, postId);
        hasLiked = !!like;
      }

      return {
        ...post.toJSON(),
        hasLiked
      };
    } catch (error) {
      throw error;
    }
  }

  // Dar like a una publicación
  static async likePost(userId, postId, type = 'like') {
    try {
      // Verificar si la publicación existe
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      // Verificar si ya ha dado like
      const existingLike = await Like.exists(userId, postId);
      
      if (existingLike) {
        // Si ya existe, actualizar el tipo de like
        existingLike.type = type;
        await existingLike.save();
        return { message: 'Like actualizado' };
      } else {
        // Crear nuevo like
        await sequelize.transaction(async (t) => {
          await Like.create({
            userId,
            postId,
            type
          }, { transaction: t });

          await post.incrementLikes();
        });

        return { message: 'Like agregado' };
      }
    } catch (error) {
      throw error;
    }
  }

  // Quitar like de una publicación
  static async unlikePost(userId, postId) {
    try {
      const like = await Like.exists(userId, postId);
      
      if (!like) {
        throw new Error('No has dado like a esta publicación');
      }

      await sequelize.transaction(async (t) => {
        await like.destroy({ transaction: t });

        const post = await Post.findByPk(postId);
        await post.decrementLikes();
      });

      return { message: 'Like removido' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener comentarios de una publicación
  static async getComments(postId, options = {}) {
    try {
      const { page = 1, limit = 20, userId = null } = options;
      const offset = (page - 1) * limit;

      // Verificar que la publicación existe
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      const comments = await Comment.findAndCountAll({
        where: { 
          postId,
          parentId: null // Solo comentarios principales, no replies
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          },
          {
            model: Comment,
            as: 'replies',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
              }
            ],
            limit: 3, // Solo mostrar primeras 3 respuestas
            order: [['createdAt', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Agregar información de si el usuario ha dado like a cada comentario
      const commentsWithLikes = await Promise.all(
        comments.rows.map(async (comment) => {
          let hasLiked = false;
          if (userId) {
            const like = await Like.findOne({
              where: { userId, commentId: comment.id }
            });
            hasLiked = !!like;
          }
          return {
            ...comment.toJSON(),
            hasLiked
          };
        })
      );

      return {
        comments: commentsWithLikes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(comments.count / limit),
          totalItems: comments.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Agregar comentario a una publicación
  static async addComment(userId, postId, content, parentId = null) {
    try {
      // Verificar si la publicación existe y permite comentarios
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      if (!post.allowComments) {
        throw new Error('Los comentarios están deshabilitados para esta publicación');
      }

      // Si es una respuesta, verificar que el comentario padre existe
      if (parentId) {
        const parentComment = await Comment.findByPk(parentId);
        if (!parentComment || parentComment.postId !== postId) {
          throw new Error('Comentario padre no encontrado');
        }
      }

      let comment;
      await sequelize.transaction(async (t) => {
        comment = await Comment.create({
          userId,
          postId,
          parentId,
          content
        }, { transaction: t });

        // Incrementar contador de comentarios en el post
        await post.incrementComments();

        // Si es una respuesta, incrementar contador del comentario padre
        if (parentId) {
          const parentComment = await Comment.findByPk(parentId);
          await parentComment.incrementReplies();
        }
      });

      // Obtener el comentario con información del autor
      const fullComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar']
          }
        ]
      });

      return fullComment;
    } catch (error) {
      throw error;
    }
  }

  // Obtener publicaciones de un usuario
  static async getUserPosts(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = 'all',
        requesterId = null
      } = options;

      const offset = (page - 1) * limit;
      const where = { userId };

      // Si no es el mismo usuario, solo mostrar publicaciones públicas
      if (requesterId !== userId) {
        where.isPublic = true;
      }

      if (type !== 'all') {
        where.type = type;
      }

      const posts = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        posts: posts.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(posts.count / limit),
          totalItems: posts.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Dar like a un comentario
  static async likeComment(userId, commentId) {
    try {
      // Verificar si el comentario existe
      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        throw new Error('Comentario no encontrado');
      }

      // Verificar si ya ha dado like
      const existingLike = await Like.findOne({
        where: { userId, commentId }
      });
      
      if (existingLike) {
        // Quitar like
        await sequelize.transaction(async (t) => {
          await existingLike.destroy({ transaction: t });
          await comment.decrementLikes();
        });
        return { message: 'Like removido del comentario' };
      } else {
        // Dar like
        await sequelize.transaction(async (t) => {
          await Like.create({
            userId,
            commentId,
            type: 'like'
          }, { transaction: t });
          await comment.incrementLikes();
        });
        return { message: 'Like agregado al comentario' };
      }
    } catch (error) {
      throw error;
    }
  }

  // Eliminar publicación
  static async deletePost(userId, postId) {
    try {
      const post = await Post.findByPk(postId);
      
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      // Verificar que el usuario sea el dueño de la publicación
      if (post.userId !== userId) {
        throw new Error('No tienes permisos para eliminar esta publicación');
      }

      await sequelize.transaction(async (t) => {
        await post.destroy({ transaction: t });

        // Decrementar contador de posts del usuario
        await User.decrement('postsCount', {
          where: { id: userId },
          transaction: t
        });
      });

      return { message: 'Publicación eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PostService;
