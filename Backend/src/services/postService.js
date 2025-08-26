const { Op } = require('sequelize');
const { Post, User, Comment, Like, Follow } = require('../models');
const { sequelize } = require('../config/db');
const { deletePostImage } = require('../config/cloudinary');

class PostService {
  // Función helper para transformar posts al formato esperado por el frontend
  static async transformPostForFrontend(post, userId = null) {
    const postData = post.toJSON ? post.toJSON() : post;
    
    // Si no tenemos isLiked y tenemos userId, calcularlo
    if (postData.isLiked === undefined && userId) {
      try {
        const hasLiked = await Like.exists(userId, postData.id);
        postData.isLiked = !!hasLiked;
      } catch (error) {
        console.error(`❌ Error calculando isLiked para post ${postData.id}:`, error);
        postData.isLiked = false;
      }
    }
    
    const transformed = {
      ...postData,
      imageUrl: postData.mediaUrl, // Transformar mediaUrl a imageUrl
      hashtags: postData.tags || [], // Transformar tags a hashtags
      isLiked: postData.isLiked || false, // Usar isLiked calculado o false por defecto
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
      const {
        page = 1,
        limit = 20,
        type = 'all',
        style,
        bodyPart,
        location,
        featured,
        sortBy = 'recent',
        userId = null // Agregar userId para verificar seguimiento
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        isPublic: true,
        status: 'published'
      };

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

      // Agregar campo isFollowing si hay usuario autenticado
      if (userId) {
        for (const post of posts.rows) {
          const isFollowing = await Follow.isFollowing(userId, post.author.id);
          post.author.isFollowing = isFollowing;
          
          // Agregar campo isLiked para indicar si el usuario ya dio like
          const hasLiked = await Like.exists(userId, post.id);
          post.isLiked = !!hasLiked;
          
        }
      }
      
      // Transformar posts al formato del frontend usando transformPostForFrontend
      const transformedPosts = await Promise.all(
        posts.rows.map(post => this.transformPostForFrontend(post, userId))
      );
      
      // Verificar que los posts transformados tengan isLiked
      // Logs removidos para evitar spam
      
      return {
        posts: transformedPosts,
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

      // Verificar si el usuario ha dado like
      let isLiked = false;
      if (userId) {
        const like = await Like.exists(userId, postId);
        isLiked = !!like;
      }

      // Transformar post al formato del frontend
      const transformedPost = await this.transformPostForFrontend(post, userId);
      
      return transformedPost;
    } catch (error) {
      throw error;
    }
  }

  // Dar like a una publicación
  static async likePost(userId, postId, type = 'like') {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
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
          // Crear nuevo like con transacción optimizada
          const result = await sequelize.transaction(async (t) => {
            
            // Usar lock optimista para evitar deadlocks
            const lockedPost = await Post.findByPk(postId, { 
              lock: true, 
              transaction: t 
            });
            
            if (!lockedPost) {
              throw new Error('Publicación no encontrada');
            }

            // Crear el like
            const newLike = await Like.create({
              userId,
              postId,
              type
            }, { transaction: t });

            // Incrementar contador de likes usando el método directo de Sequelize
            await Post.increment('likesCount', {
              where: { id: postId },
              transaction: t
            });

            // Verificar que el incremento funcionó
            await lockedPost.reload({ transaction: t });

            return { message: 'Like agregado' };
          }, {
            timeout: 10000 // 10 segundos de timeout para transacciones
          });

          return result;
        }
      } catch (error) {
        attempt++;
        
        console.error(`❌ Error en likePost (intento ${attempt}/${maxRetries}):`, error);
        console.error(`❌ Stack trace:`, error.stack);
        
        // Si es un deadlock y no hemos agotado los reintentos, esperar y reintentar
        if (error.message.includes('Deadlock') && attempt < maxRetries) {
          console.log(`⚠️ Deadlock detectado en likePost, reintentando... (${attempt}/${maxRetries})`);
          // Esperar un tiempo aleatorio antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          continue;
        }
        
        // Si no es deadlock o agotamos reintentos, lanzar el error
        throw error;
      }
    }
    
    throw new Error('No se pudo procesar el like después de múltiples intentos');
  }

  // Quitar like de una publicación
  static async unlikePost(userId, postId) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const like = await Like.exists(userId, postId);
        
        if (!like) {
          throw new Error('No has dado like a esta publicación');
        }

        const result = await sequelize.transaction(async (t) => {
          
          // Usar lock optimista para evitar deadlocks
          const lockedPost = await Post.findByPk(postId, { 
            lock: true, 
            transaction: t 
          });
          
          if (!lockedPost) {
            throw new Error('Publicación no encontrada');
          }

          // Eliminar el like
          await like.destroy({ transaction: t });

          // Decrementar contador de likes usando el método directo de Sequelize
          await Post.decrement('likesCount', {
            where: { id: postId },
            transaction: t
          });

          // Verificar que el decremento funcionó
          await lockedPost.reload({ transaction: t });

          return { message: 'Like removido' };
        }, {
          timeout: 10000 // 10 segundos de timeout para transacciones
        });

        return result;
      } catch (error) {
        attempt++;
        
        // Si es un deadlock y no hemos agotado los reintentos, esperar y reintentar
        if (error.message.includes('Deadlock') && attempt < maxRetries) {
          console.log(`⚠️ Deadlock detectado en unlikePost, reintentando... (${attempt}/${maxRetries})`);
          // Esperar un tiempo aleatorio antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          continue;
        }
        
        // Si no es deadlock o agotamos reintentos, lanzar el error
        throw error;
      }
    }
    
    throw new Error('No se pudo procesar el unlike después de múltiples intentos');
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

      // Agregar campo isLiked si hay usuario solicitante
      if (requesterId) {
        for (const post of posts.rows) {
          const hasLiked = await Like.exists(requesterId, post.id);
          post.isLiked = !!hasLiked;
        }
      }

      // Transformar los posts para el frontend usando transformPostForFrontend
      const transformedPosts = await Promise.all(
        posts.rows.map(post => this.transformPostForFrontend(post, requesterId))
      );
      
      // Verificar que los posts transformados tengan isLiked
      // Logs removidos para evitar spam

      return {
        posts: transformedPosts,
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
        console.log(`🔄 Quitando like del comentario ${commentId}`);
        await sequelize.transaction(async (t) => {
          await existingLike.destroy({ transaction: t });
          await comment.decrementLikes();
        });
        console.log(`✅ Like removido del comentario ${commentId}`);
        return { message: 'Like removido del comentario' };
      } else {
        // Dar like
        console.log(`🔄 Agregando like al comentario ${commentId}`);
        await sequelize.transaction(async (t) => {
          await Like.create({
            userId,
            commentId,
            type: 'like'
          }, { transaction: t });
          await comment.incrementLikes();
        });
        console.log(`✅ Like agregado al comentario ${commentId}`);
        return { message: 'Like agregado al comentario' };
      }
    } catch (error) {
      throw error;
    }
  }

  // Actualizar publicación
  static async updatePost(userId, postId, updateData) {
    try {
      const post = await Post.findByPk(postId);
      
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      // Verificar que el usuario sea el dueño de la publicación
      if (post.userId !== userId) {
        throw new Error('No tienes permisos para actualizar esta publicación');
      }

      // Actualizar solo los campos permitidos
      const allowedFields = ['description', 'tags'];
      const updateFields = {};

      if (updateData.description !== undefined) {
        updateFields.description = updateData.description;
        updateFields.title = updateData.description.substring(0, 255) || 'Nuevo tatuaje';
      }

      if (updateData.hashtags !== undefined) {
        updateFields.tags = updateData.hashtags;
      }

      // Actualizar la fecha de modificación
      updateFields.updatedAt = new Date();

      await post.update(updateFields);

      return { 
        message: 'Publicación actualizada exitosamente',
        post: this.transformPostForFrontend(post)
      };
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

      // Guardar el publicId de Cloudinary antes de eliminar el post
      const cloudinaryPublicId = post.cloudinaryPublicId;

      await sequelize.transaction(async (t) => {
        await post.destroy({ transaction: t });

        // Decrementar contador de posts del usuario
        await User.decrement('postsCount', {
          where: { id: userId },
          transaction: t
        });
      });

      // Eliminar la imagen de Cloudinary después de eliminar el post de la BD
      if (cloudinaryPublicId) {
        try {
          await deletePostImage(cloudinaryPublicId);
        } catch (cloudinaryError) {
          console.error('Error al eliminar imagen de Cloudinary:', cloudinaryError);
          // No fallar la operación si hay error en Cloudinary
        }
      }

      return { message: 'Publicación eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener posts de usuarios seguidos
  static async getFollowingPosts(userId, page, limit, offset) {
    try {
      console.log(`🔍 Buscando posts para usuario ${userId}, página ${page}, límite ${limit}`);
      
      // Obtener IDs de usuarios seguidos
      const followingUsers = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
      });

      const followingIds = followingUsers.map(follow => follow.followingId);
      console.log(`👥 Usuarios seguidos encontrados:`, followingIds);
      console.log(`👥 Detalle de registros de seguimiento:`, followingUsers.map(follow => ({
        id: follow.id,
        followerId: follow.followerId,
        followingId: follow.followingId
      })));

      if (followingIds.length === 0) {
        console.log(`⚠️ Usuario ${userId} no sigue a nadie, devolviendo array vacío`);
        // Si no sigue a nadie, devolver array vacío
        return {
          posts: [],
          total: 0
        };
      }

      console.log(`🔍 Buscando posts de usuarios seguidos: ${followingIds.join(', ')}`);
      
      // Obtener posts de usuarios seguidos
      const queryOptions = {
        where: {
          userId: {
            [Op.in]: followingIds
          },
          isPublic: true,
          status: 'published'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      };
      
      console.log(`🔍 Opciones de consulta:`, JSON.stringify(queryOptions, null, 2));
      
      const { count, rows } = await Post.findAndCountAll(queryOptions);

      console.log(`📝 Posts de usuarios seguidos encontrados: ${count}`);
      console.log(`📝 Detalle de posts encontrados:`, rows.map(post => ({
        id: post.id,
        userId: post.userId,
        authorId: post.author?.id,
        username: post.author?.username,
        description: post.description?.substring(0, 50)
      })));

      // Agregar campo isLiked para el usuario actual
      for (const post of rows) {
        const hasLiked = await Like.exists(userId, post.id);
        post.isLiked = !!hasLiked;
      }

      // Transformar los posts para el frontend usando transformPostForFrontend
      const transformedPosts = await Promise.all(
        rows.map(post => this.transformPostForFrontend(post, userId))
      );
      
      // Verificar que los posts transformados tengan isLiked
      // Logs removidos para evitar spam

      // Marcar todos los posts como seguidos ya que son de usuarios que sigue
      transformedPosts.forEach(post => {
        post.author.isFollowing = true;
        
        // Verificación adicional: asegurar que el post sea realmente de un usuario seguido
        if (!followingIds.includes(post.author.id)) {
          console.error(`❌ ERROR: Post ${post.id} del usuario ${post.author.username} (${post.author.id}) no está en la lista de usuarios seguidos:`, followingIds);
        }
      });

      // Filtrar solo posts de usuarios seguidos como medida de seguridad
      const filteredPosts = transformedPosts.filter(post => followingIds.includes(post.author.id));
      
      if (filteredPosts.length !== transformedPosts.length) {
        console.warn(`⚠️ Se filtraron ${transformedPosts.length - filteredPosts.length} posts que no eran de usuarios seguidos`);
      }

      console.log(`✅ Posts transformados y listos: ${filteredPosts.length}`);

      return {
        posts: filteredPosts,
        total: count
      };
    } catch (error) {
      console.error('Error in getFollowingPosts:', error);
      throw error;
    }
  }

  // Obtener todas las publicaciones con paginación
  static async getAllPosts(page = 1, limit = 20, userId = null) {
    try {
      const offset = (page - 1) * limit;
      
      const posts = await Post.findAndCountAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          }
        ],
        where: {
          isPublic: true,
          status: 'published'
        },
        order: [['publishedAt', 'DESC']],
        limit,
        offset
      });

      // Agregar campo isFollowing si hay usuario autenticado
      if (userId) {
        for (const post of posts.rows) {
          const isFollowing = await Follow.isFollowing(userId, post.author.id);
          post.author.isFollowing = isFollowing;
          
          // Agregar campo isLiked para indicar si el usuario ya dio like
          const hasLiked = await Like.exists(userId, post.id);
          post.isLiked = !!hasLiked;
          
        }
      }

      // Transformar posts al formato del frontend
      const transformedPosts = await Promise.all(
        posts.rows.map(post => this.transformPostForFrontend(post, userId))
      );
      
      // Verificar que los posts transformados tengan isLiked
      // Logs removidos para evitar spam

      return {
        posts: transformedPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(posts.count / limit),
          totalItems: posts.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error en getAllPosts:', error);
      throw error;
    }
  }
}

module.exports = PostService;
