const { Op } = require('sequelize');
const { Post, User, Comment, Like, Follow } = require('../models');
const { sequelize } = require('../config/db');
const { deletePostImage, deletePostVideo } = require('../config/cloudinary');
const { getCachedData, invalidateCache } = require('../config/performanceOptimization');

class PostService {
  // Función helper para transformar posts al formato esperado por el frontend
  // Versión síncrona de transformPostForFrontend (OPTIMIZADA)
  static transformPostForFrontendSync(post, userId = null) {
    const postData = post.toJSON ? post.toJSON() : post;
    
    const transformed = {
      ...postData,
      imageUrl: postData.mediaUrl, // Transformar mediaUrl a imageUrl
      hashtags: postData.tags || [], // Transformar tags a hashtags
      isLiked: postData.isLiked || false, // Usar isLiked ya calculado
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
        isVerified: postData.author.isVerified || false
      } : null
    };

    return transformed;
  }

  static async transformPostForFrontend(post, userId = null) {
    const postData = post.toJSON ? post.toJSON() : post;
    
    // Si no tenemos isLiked y tenemos userId, calcularlo
    if (postData.isLiked === undefined && userId) {
      try {
        const hasLiked = await Like.exists(userId, postData.id);
        postData.isLiked = !!hasLiked;
      } catch (error) {
        // Error silencioso - continuar sin isLiked
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
        thumbnailUrl: postData.thumbnailUrl || null, // Agregar thumbnail para videos
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
        userId = null
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        isPublic: true,
        status: 'published'
      };

      // OPTIMIZACIÓN: Obtener usuarios seguidos y likes en una sola consulta
      let excludeUserIds = [];
      let userLikes = new Set();
      
      if (userId) {
        // Consulta optimizada: obtener seguidos y likes en paralelo
        const [followingUsers, userLikesData] = await Promise.all([
          Follow.findAll({
            where: { followerId: userId },
            attributes: ['followingId']
          }),
          Like.findAll({
            where: { userId: userId },
            attributes: ['postId']
          })
        ]);

        excludeUserIds = followingUsers.map(follow => follow.followingId);
        excludeUserIds.push(userId); // Excluir propios posts
        
        // Crear Set para búsqueda O(1)
        userLikes = new Set(userLikesData.map(like => like.postId));
      }

      // Aplicar filtros de exclusión
      if (excludeUserIds.length > 0) {
        where.userId = {
          [Op.notIn]: excludeUserIds
        };
      }

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

      // OPTIMIZACIÓN: Procesar datos sin consultas adicionales
      const transformedPosts = posts.rows.map(post => {
        const postData = post.toJSON();
        
        // Agregar campos calculados directamente
        if (userId) {
          postData.isLiked = userLikes.has(post.id);
          // isFollowing se puede calcular si es necesario, pero por ahora lo omitimos para rendimiento
        } else {
          postData.isLiked = false;
        }
        
        // Transformar al formato del frontend
        return this.transformPostForFrontend(postData, userId);
      });
      
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
      // Error silencioso - devolver feed vacío
      return {
        posts: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit)
        }
      };
    }
  }

  // Obtener publicación por ID (OPTIMIZADO)
  static async getPostById(postId, userId = null) {
    try {
      // OPTIMIZACIÓN: Obtener post con datos básicos primero
      const post = await Post.findByPk(postId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType'],
            required: false
          }
        ]
      });

      if (!post) {
        return null;
      }

      // OPTIMIZACIÓN: Obtener datos relacionados en paralelo
      const [comments, likes, isLiked] = await Promise.all([
        // Comentarios con usuarios
        Comment.findAll({
          where: { postId },
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 50 // Limitar comentarios para rendimiento
        }),
        // Likes del post
        Like.findAll({
          where: { postId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'avatar']
            }
          ],
          limit: 20 // Limitar likes mostrados
        }),
        // Verificar si el usuario actual le dio like
        userId ? Like.findOne({
          where: { postId, userId },
          attributes: ['id']
        }) : Promise.resolve(null)
      ]);

      // Construir respuesta optimizada
      const postData = post.toJSON();
      postData.comments = comments.map(comment => ({
        ...comment.toJSON(),
        author: comment.User
      }));
      postData.likes = likes.map(like => ({
        ...like.toJSON(),
        user: like.User
      }));
      postData.isLiked = !!isLiked;
      postData.commentsCount = comments.length;
      postData.likesCount = likes.length;

      return this.transformPostForFrontendSync(postData, userId);
      
    } catch (error) {
      // Error silencioso - devolver null
      return null;
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
        
        // Error silencioso - continuar con siguiente intento
        
        // Si es un deadlock y no hemos agotado los reintentos, esperar y reintentar
        if (error.message.includes('Deadlock') && attempt < maxRetries) {
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

      // OPTIMIZACIÓN: Obtener todos los likes de comentarios de una vez
      let commentLikes = new Set();
      if (userId && comments.rows.length > 0) {
        const commentIds = comments.rows.map(comment => comment.id);
        const likes = await Like.findAll({
          where: {
            userId: userId,
            commentId: commentIds
          },
          attributes: ['commentId']
        });
        commentLikes = new Set(likes.map(like => like.commentId));
      }

      // Agregar información de likes usando el Set optimizado
      const commentsWithLikes = comments.rows.map(comment => ({
        ...comment.toJSON(),
        hasLiked: commentLikes.has(comment.id)
      }));

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
      const where = { 
        userId,
        status: 'published' // Solo mostrar publicaciones publicadas
      };

      // Si no es el mismo usuario, solo mostrar publicaciones públicas
      if (requesterId !== userId) {
        where.isPublic = true;
      }

      if (type !== 'all') {
        where.type = type;
      }

      // OPTIMIZACIÓN: Usar Promise.all para ejecutar queries en paralelo
      const [posts, totalCount] = await Promise.all([
        Post.findAll({
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
        }),
        Post.count({ where })
      ]);

      // OPTIMIZACIÓN: Solo procesar likes si hay posts y usuario solicitante
      let transformedPosts = [];
      
      if (posts.length > 0) {
        // OPTIMIZACIÓN: Obtener todos los likes de una vez si hay usuario solicitante
        let userLikes = new Set();
        if (requesterId) {
          const likes = await Like.findAll({
            where: { 
              userId: requesterId,
              postId: posts.map(post => post.id)
            },
            attributes: ['postId']
          });
          userLikes = new Set(likes.map(like => like.postId));
        }

        // Agregar campo isLiked usando el Set optimizado
        posts.forEach(post => {
          post.isLiked = userLikes.has(post.id);
        });

        // OPTIMIZACIÓN: Transformar posts de forma más eficiente
        transformedPosts = posts.map(post => this.transformPostForFrontendSync(post, requesterId));
      }
      
      // Verificar que los posts transformados tengan isLiked
      // Logs removidos para evitar spam

      return {
        posts: transformedPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
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

  // Eliminar publicación (ULTRA OPTIMIZADO)
  static async deletePost(userId, postId) {
    try {
      // OPTIMIZACIÓN 1: Obtener solo campos necesarios
      const post = await Post.findByPk(postId, {
        attributes: ['id', 'userId', 'cloudinaryPublicId', 'type']
      });
      
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      // Verificar permisos
      if (post.userId !== userId) {
        throw new Error('No tienes permisos para eliminar esta publicación');
      }

      // OPTIMIZACIÓN 2: Guardar datos para procesamiento en background
      const cloudinaryPublicId = post.cloudinaryPublicId;
      const postType = post.type;

      // OPTIMIZACIÓN 3: Eliminar de BD de forma rápida sin transacción innecesaria
      await post.destroy();

      // OPTIMIZACIÓN 4: Decrementar contador de forma asíncrona
      setImmediate(() => {
        User.decrement('postsCount', {
          where: { id: userId }
        }).catch(error => {

        });
      });

      // OPTIMIZACIÓN 5: Eliminar de Cloudinary en background completamente asíncrono
      if (cloudinaryPublicId) {
        setImmediate(() => {
          this.deleteCloudinaryFile(cloudinaryPublicId, postType).catch(error => {

          });
        });
      }

      return { message: 'Publicación eliminada exitosamente' };
    } catch (error) {
      // Error silencioso - continuar
      throw error;
    }
  }

  // Eliminar archivo de Cloudinary en background
  static async deleteCloudinaryFile(cloudinaryPublicId, postType) {
    try {
      const { deletePostImage, deletePostVideo } = require('../config/cloudinary');
      
      // Timeout de 5 segundos para evitar bloqueos
      const deletePromise = postType === 'video' 
        ? deletePostVideo(cloudinaryPublicId)
        : deletePostImage(cloudinaryPublicId);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout eliminando archivo')), 5000);
      });

      await Promise.race([deletePromise, timeoutPromise]);

    } catch (error) {

    }
  }

  // Obtener posts de usuarios seguidos (OPTIMIZADO CON CACHE)
  static async getFollowingPosts(userId, page, limit, offset) {
    try {
      // OPTIMIZACIÓN 1: Cache para posts de usuarios seguidos
      const cacheKey = `following_posts:${userId}:${page}:${limit}`;
      
      // Usar el sistema de caché optimizado
      const cachedData = await getCachedData(cacheKey, async () => {
        // OPTIMIZACIÓN 2: Obtener IDs de usuarios seguidos de forma más eficiente
        const followingUsers = await Follow.findAll({
          where: { followerId: userId },
          attributes: ['followingId']
        });

        const followingIds = followingUsers.map(follow => follow.followingId);

        if (followingIds.length === 0) {
          return {
            posts: [],
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit)
            }
          };
        }

        // OPTIMIZACIÓN 3: Obtener posts con una sola consulta optimizada
        const posts = await Post.findAndCountAll({
          where: {
            userId: { [Op.in]: followingIds },
            isPublic: true,
            status: 'published'
          },
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset),
          subQuery: false,
          distinct: true
        });

        // OPTIMIZACIÓN 4: Obtener estadísticas de posts en una sola consulta
        const postIds = posts.rows.map(post => post.id);
        let postStats = {};
        
        if (postIds.length > 0) {
          const [likesStats, commentsStats] = await Promise.all([
            sequelize.query(`
              SELECT post_id, COUNT(*) as likes_count 
              FROM likes 
              WHERE post_id IN (:postIds) 
              GROUP BY post_id
            `, {
              replacements: { postIds },
              type: sequelize.QueryTypes.SELECT
            }),
            sequelize.query(`
              SELECT post_id, COUNT(*) as comments_count 
              FROM comments 
              WHERE post_id IN (:postIds) 
              GROUP BY post_id
            `, {
              replacements: { postIds },
              type: sequelize.QueryTypes.SELECT
            })
          ]);
          
          likesStats.forEach(stat => {
            postStats[stat.post_id] = { ...postStats[stat.post_id], likesCount: stat.likes_count };
          });
          
          commentsStats.forEach(stat => {
            postStats[stat.post_id] = { ...postStats[stat.post_id], commentsCount: stat.comments_count };
          });
        }

        // OPTIMIZACIÓN 5: Transformar posts de forma síncrona
        const transformedPosts = posts.rows.map(post => {
          const postData = post.toJSON();
          const stats = postStats[postData.id] || {};
          postData.likesCount = stats.likesCount || postData.likesCount || 0;
          postData.commentsCount = stats.commentsCount || postData.commentsCount || 0;
          return PostService.transformPostForFrontendSync(postData, userId);
        });

        return {
          posts: transformedPosts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(posts.count / limit),
            totalItems: posts.count,
            itemsPerPage: parseInt(limit)
          }
        };
      }, 300000); // Cache por 5 minutos

      return cachedData;

    } catch (error) {
      // Error silencioso - devolver datos vacíos
      return {
        posts: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit)
        }
      };
    }
  }

  // Obtener todas las publicaciones con paginación
  static async getAllPosts(page = 1, limit = 20, userId = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Si hay usuario autenticado, excluir posts de usuarios que ya sigue Y sus propios posts
      let excludeUserIds = [];
      if (userId) {
        const followingUsers = await Follow.findAll({
          where: { followerId: userId },
          attributes: ['followingId']
        });
        excludeUserIds = followingUsers.map(follow => follow.followingId);
        
        // Agregar el propio usuario a la lista de exclusión
        excludeUserIds.push(userId);
      }
      
      // Construir condición where
      const whereCondition = {
        isPublic: true,
        status: 'published'
      };
      
      // Excluir posts de usuarios seguidos Y propios posts
      if (excludeUserIds.length > 0) {
        whereCondition.userId = {
          [Op.notIn]: excludeUserIds
        };
      }
      
      const posts = await Post.findAndCountAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType'],
            required: false // No fallar si el usuario no existe
          }
        ],
        where: whereCondition,
        order: [['publishedAt', 'DESC']],
        limit,
        offset
      });

      // OPTIMIZACIÓN: Obtener todos los follows y likes de una vez si hay usuario autenticado
      if (userId && posts.rows.length > 0) {
        const authorIds = posts.rows
          .map(post => post.author?.id)
          .filter(id => id && id !== userId); // Excluir el propio usuario
        
        const postIds = posts.rows.map(post => post.id);
        
        // Obtener follows y likes en paralelo
        const [follows, likes] = await Promise.all([
          authorIds.length > 0 ? Follow.findAll({
            where: {
              followerId: userId,
              followingId: authorIds
            },
            attributes: ['followingId']
          }) : Promise.resolve([]),
          Like.findAll({
            where: {
              userId: userId,
              postId: postIds
            },
            attributes: ['postId']
          })
        ]);
        
        const followingSet = new Set(follows.map(follow => follow.followingId));
        const likesSet = new Set(likes.map(like => like.postId));

        // Agregar campos usando los Sets optimizados
        posts.rows.forEach(post => {
          if (post.author) {
            post.author.isFollowing = followingSet.has(post.author.id);
          }
          post.isLiked = likesSet.has(post.id);
        });
      }

      // OPTIMIZACIÓN: Transformar posts de forma síncrona
      const transformedPosts = posts.rows.map(post => {
        const postData = post.toJSON();
        // Agregar User para compatibilidad frontend
        if (postData.author) {
          postData.User = postData.author;
        }
        const transformed = this.transformPostForFrontendSync(postData, userId);
        if (postData.author) {
          transformed.User = postData.author;
        }
        return transformed;
      });
      
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
      // Error silencioso - devolver datos vacíos
      return {
        posts: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit)
        }
      };
    }
  }
}

module.exports = PostService;
