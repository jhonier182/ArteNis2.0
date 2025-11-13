const { Op } = require('sequelize');
const { Post, User, Comment, Like, Follow, SavedPost } = require('../models');
const { sequelize } = require('../config/db');
const { deletePostImage, deletePostVideo } = require('../config/cloudinary');
const taskQueue = require('../utils/taskQueue');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');
const { decodeCursor, generateCursorFromPost } = require('../utils/cursorHelper');

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
      isSaved: postData.isSaved || false, // Usar isSaved ya calculado
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

  // Construir opciones para el feed
  static buildFeedOptions(queryParams, userId = null) {
    const options = { ...queryParams };
    if (userId) {
      options.userId = userId;
    }
    return options;
  }

  // Validar datos requeridos para crear post
  static validateCreatePostData(imageUrl, cloudinaryPublicId) {
    if (!imageUrl || !cloudinaryPublicId) {
      throw new BadRequestError('Se requiere la URL del media y el ID de Cloudinary', 'MISSING_REQUIRED_FIELDS');
    }
  }

  // Validar datos para actualizar post
  static validateUpdatePostData(description) {
    if (!description || !description.trim()) {
      throw new BadRequestError('Se requiere una descripción para la publicación', 'MISSING_REQUIRED_FIELDS');
    }
  }

  // Crear nueva publicación
  static async createPost(userId, postData, mediaUrl, cloudinaryPublicId) {
    try {
      this.validateCreatePostData(mediaUrl, cloudinaryPublicId);
      
      const post = await Post.create({
        userId,
        title: postData.description?.substring(0, 255) || 'Nuevo tatuaje',
        description: postData.description || '',
        type: postData.type || 'image',
        mediaUrl,
        thumbnailUrl: postData.thumbnailUrl || null,
        cloudinaryPublicId,
        tags: postData.hashtags || [],
        style: postData.style || null,
        bodyPart: postData.bodyPart || null,
        location: postData.location || null,
        isPremiumContent: postData.isPremiumContent || false,
        allowComments: postData.allowComments !== false,
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        savesCount: 0,
        status: 'published',
        isPublic: true,
        isFeatured: false,
        publishedAt: new Date()
      });

      // Incrementar contador de posts del usuario
      await User.increment('postsCount', {
        where: { id: userId }
      });

      return post;
    } catch (error) {
      logger.error('Error creando post', {
        userId,
        error: error.message
      });
      throw error;
    }
  }


  // Obtener feed de publicaciones (estilo Instagram - posts de usuarios seguidos)
  static async getFeed(options = {}) {
    try {
      const {
        cursor = null,
        limit = 20,
        type = 'all',
        style,
        bodyPart,
        location,
        featured,
        sortBy = 'recent',
        userId = null
      } = options;

      // Si no hay userId, devolver posts públicos
      if (!userId) {
        return await this.getPublicPosts(options);
      }

      // Obtener usuarios seguidos
      const followingUsers = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
      });

      const followingIds = followingUsers.map(follow => follow.followingId);
      
      // Obtener likes del usuario en paralelo
      const [userLikesData] = await Promise.all([
        Like.findAll({
          where: { userId: userId },
          attributes: ['postId']
        })
      ]);

      const userLikes = new Set(userLikesData.map(like => like.postId));

      // Si el usuario sigue a alguien, mostrar solo posts de seguidos
      // Si no sigue a nadie, mostrar posts públicos de otros usuarios
      const where = {
        isPublic: true,
        status: 'published'
      };

      if (followingIds.length > 0) {
        // Mostrar posts de usuarios seguidos
        where.userId = {
          [Op.in]: followingIds
        };
      } else {
        // Si no sigue a nadie, mostrar posts públicos excluyendo los propios
        where.userId = {
          [Op.ne]: userId
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

      // Si hay cursor y sortBy es 'recent', usar paginación por cursor
      if (cursor && sortBy === 'recent') {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          // WHERE (created_at < cursorCreatedAt OR (created_at = cursorCreatedAt AND id < cursorId))
          where[Op.or] = [
            {
              createdAt: {
                [Op.lt]: decoded.createdAt
              }
            },
            {
              [Op.and]: [
                {
                  createdAt: decoded.createdAt
                },
                {
                  id: {
                    [Op.lt]: decoded.id
                  }
                }
              ]
            }
          ];
        }
      }

      // Ordenamiento
      const orderBy = [];
      // Para cursor-based pagination, siempre usar createdAt e id
      if (cursor && sortBy === 'recent') {
        orderBy.push(['createdAt', 'DESC']);
        orderBy.push(['id', 'DESC']);
      } else {
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
            orderBy.push(['id', 'DESC']);
        }
      }

      // Si usamos cursor, no necesitamos count (más eficiente)
      if (cursor && sortBy === 'recent') {
        const posts = await Post.findAll({
          where,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
            }
          ],
          order: orderBy,
          limit: parseInt(limit) + 1 // Obtener uno más para saber si hay más
        });

        // Determinar si hay más posts
        const hasMore = posts.length > limit;
        const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

        // OPTIMIZACIÓN: Procesar datos sin consultas adicionales
        const transformedPosts = postsToReturn.map(post => {
          const postData = post.toJSON();
          
          // Agregar campos calculados directamente
          if (userId) {
            postData.isLiked = userLikes.has(post.id);
          } else {
            postData.isLiked = false;
          }
          
          // Transformar al formato del frontend
          return this.transformPostForFrontendSync(postData, userId);
        });

        // Generar nextCursor desde el último post
        const nextCursor = transformedPosts.length > 0 && hasMore 
          ? generateCursorFromPost(postsToReturn[postsToReturn.length - 1])
          : null;

        return {
          posts: transformedPosts,
          nextCursor
        };
      } else {
        // Paginación tradicional para otros tipos de ordenamiento
        const page = options.page || 1;
        const offset = (page - 1) * limit;
        
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
          } else {
            postData.isLiked = false;
          }
          
          // Transformar al formato del frontend
          return this.transformPostForFrontendSync(postData, userId);
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
      }
    } catch (error) {
      logger.error('Error obteniendo feed', {
        userId: options?.userId || null,
        cursor: options?.cursor || null,
        error: error.message,
        stack: error.stack
      });
      // Error silencioso - devolver feed vacío para no romper el frontend
      return {
        posts: [],
        nextCursor: null
      };
    }
  }

  // Obtener posts públicos para la sección Explorar
  static async getPublicPosts(options = {}) {
    try {
      const {
        cursor = null,
        limit = 20,
        type = 'all',
        style,
        bodyPart,
        location,
        featured,
        sortBy = 'recent',
        userId = null
      } = options;

      const where = {
        isPublic: true,
        status: 'published'
      };

      // Excluir posts del usuario si está autenticado
      if (userId) {
        where.userId = {
          [Op.ne]: userId
        };
      }

      // Filtros opcionales
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

      // Paginación por cursor
      if (cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          where[Op.or] = [
            {
              createdAt: {
                [Op.lt]: decoded.createdAt
              }
            },
            {
              [Op.and]: [
                {
                  createdAt: decoded.createdAt
                },
                {
                  id: {
                    [Op.lt]: decoded.id
                  }
                }
              ]
            }
          ];
        }
      }

      // Ordenamiento
      const orderBy = [];
      if (sortBy === 'popular') {
        orderBy.push(['likesCount', 'DESC']);
        orderBy.push(['createdAt', 'DESC']);
      } else if (sortBy === 'views') {
        orderBy.push(['viewsCount', 'DESC']);
        orderBy.push(['createdAt', 'DESC']);
      } else {
        // Por defecto: más recientes
        orderBy.push(['createdAt', 'DESC']);
        orderBy.push(['id', 'DESC']);
      }

      // Obtener likes del usuario si está autenticado
      let userLikes = new Set();
      if (userId) {
        const userLikesData = await Like.findAll({
          where: { userId: userId },
          attributes: ['postId']
        });
        userLikes = new Set(userLikesData.map(like => like.postId));
      }

      // Consulta de posts
      const posts = await Post.findAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          }
        ],
        order: orderBy,
        limit: parseInt(limit) + 1 // Obtener uno más para saber si hay más
      });

      // Determinar si hay más posts
      const hasMore = posts.length > limit;
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

      // Transformar posts
      const transformedPosts = postsToReturn.map(post => {
        const postData = post.toJSON();
        
        // Agregar campo isLiked
        if (userId) {
          postData.isLiked = userLikes.has(post.id);
        } else {
          postData.isLiked = false;
        }
        
        return this.transformPostForFrontendSync(postData, userId);
      });

      // Generar nextCursor
      const nextCursor = transformedPosts.length > 0 && hasMore 
        ? generateCursorFromPost(postsToReturn[postsToReturn.length - 1])
        : null;

      return {
        posts: transformedPosts,
        nextCursor
      };
    } catch (error) {
      logger.error('Error obteniendo posts públicos', {
        error: error.message,
        stack: error.stack
      });
      return {
        posts: [],
        nextCursor: null
      };
    }
  }

  // Obtener publicación por ID (OPTIMIZADO)
  static async getPostById(postId, userId = null) {
    try {
      // OPTIMIZACIÓN: Usar una sola consulta con includes para reducir bloqueos del event loop
      const post = await Post.findByPk(postId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType'],
            required: false
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
              }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20, // Reducir comentarios para mejor rendimiento
            required: false
          },
          {
            model: Like,
            as: 'likes',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'avatar']
              }
            ],
            limit: 10, // Reducir likes mostrados
            required: false
          }
        ]
      });

      if (!post) {
        return null;
      }

      // Verificar si el usuario actual le dio like (consulta separada pero rápida)
      let isLiked = false;
      let isSaved = false;
      if (userId) {
        const [userLike, savedPost] = await Promise.all([
          Like.findOne({
            where: { postId, userId },
            attributes: ['id']
          }),
          SavedPost.findOne({
            where: { postId, userId },
            attributes: ['id']
          })
        ]);
        isLiked = !!userLike;
        isSaved = !!savedPost;
      }

      // Construir respuesta optimizada usando los datos del include
      const postData = post.toJSON();
      
      // Procesar comentarios del include
      postData.comments = (postData.comments || []).map(comment => ({
        ...comment,
        author: comment.author
      }));
      
      // Procesar likes del include
      postData.likes = (postData.likes || []).map(like => ({
        ...like,
        user: like.user
      }));
      
      postData.isLiked = isLiked;
      postData.isSaved = isSaved;
      postData.commentsCount = postData.comments.length;
      // NO sobrescribir likesCount - usar el valor de la base de datos
      // postData.likesCount ya viene del campo likes_count de la tabla posts

      const transformed = this.transformPostForFrontendSync(postData, userId);
      transformed.isSaved = isSaved;
      return transformed;
      
    } catch (error) {
      // Error silencioso - devolver null
      return null;
    }
  }

  // Toggle like a una publicación (AGREGAR O QUITAR)
  static async toggleLike(userId, postId, type = 'like') {
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
          // Si ya existe, ELIMINAR el like (toggle OFF)
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
            await existingLike.destroy({ transaction: t });

            // Decrementar contador de likes
            await Post.decrement('likesCount', {
              where: { id: postId },
              transaction: t
            });

            // Verificar que el decremento funcionó
            await lockedPost.reload({ transaction: t });

            return { 
              message: 'Like removido',
              liked: false,
              likesCount: lockedPost.likesCount
            };
          }, {
            timeout: 10000
          });

          return result;
        } else {
          // Si no existe, CREAR el like (toggle ON)
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

            // Incrementar contador de likes
            await Post.increment('likesCount', {
              where: { id: postId },
              transaction: t
            });

            // Verificar que el incremento funcionó
            await lockedPost.reload({ transaction: t });

            return { 
              message: 'Like agregado',
              liked: true,
              likesCount: lockedPost.likesCount
            };
          }, {
            timeout: 10000
          });

          return result;
        }
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
    
    throw new Error('No se pudo procesar el toggle de like después de múltiples intentos');
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
        cursor = null,
        limit = 20,
        type = 'all',
        requesterId = null
      } = options;

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

      // Si hay cursor, agregar condición para paginación por cursor
      if (cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          // WHERE (created_at < cursorCreatedAt OR (created_at = cursorCreatedAt AND id < cursorId))
          where[Op.or] = [
            {
              createdAt: {
                [Op.lt]: decoded.createdAt
              }
            },
            {
              [Op.and]: [
                {
                  createdAt: decoded.createdAt
                },
                {
                  id: {
                    [Op.lt]: decoded.id
                  }
                }
              ]
            }
          ];
        }
      }

      // Obtener posts con paginación por cursor
      const posts = await Post.findAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: parseInt(limit) + 1 // Obtener uno más para saber si hay más
      });

      // Determinar si hay más posts
      const hasMore = posts.length > limit;
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

      // OPTIMIZACIÓN: Solo procesar likes si hay posts y usuario solicitante
      let transformedPosts = [];
      
      if (postsToReturn.length > 0) {
        // OPTIMIZACIÓN: Obtener todos los likes de una vez si hay usuario solicitante
        let userLikes = new Set();
        if (requesterId) {
          const likes = await Like.findAll({
            where: { 
              userId: requesterId,
              postId: postsToReturn.map(post => post.id)
            },
            attributes: ['postId']
          });
          userLikes = new Set(likes.map(like => like.postId));
        }

        // Agregar campo isLiked usando el Set optimizado
        postsToReturn.forEach(post => {
          post.isLiked = userLikes.has(post.id);
        });

        // OPTIMIZACIÓN: Transformar posts de forma más eficiente
        transformedPosts = postsToReturn.map(post => this.transformPostForFrontendSync(post, requesterId));
      }
      
      // Generar nextCursor desde el último post
      const nextCursor = transformedPosts.length > 0 && hasMore 
        ? generateCursorFromPost(postsToReturn[postsToReturn.length - 1])
        : null;
      
      return {
        posts: transformedPosts,
        nextCursor
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
      this.validateUpdatePostData(updateData.description);
      
      const post = await Post.findByPk(postId);
      
      if (!post) {
        throw new NotFoundError('Publicación no encontrada');
      }

      // Verificar que el usuario sea el dueño de la publicación
      if (post.userId !== userId) {
        throw new ForbiddenError('No tienes permisos para actualizar esta publicación');
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
        throw new NotFoundError('Publicación no encontrada');
      }

      // Verificar permisos
      if (post.userId !== userId) {
        throw new ForbiddenError('No tienes permisos para eliminar esta publicación');
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
          logger.warn('Error decrementando postsCount en background', {
            userId,
            error: error.message
          });
        });
      });

      // OPTIMIZACIÓN 5: Eliminar de Cloudinary en background completamente asíncrono
      if (cloudinaryPublicId) {
        setImmediate(() => {
          this.deleteCloudinaryFile(cloudinaryPublicId, postType).catch(error => {
            logger.warn('Error eliminando archivo de Cloudinary en background', {
              publicId: cloudinaryPublicId,
              error: error.message
            });
          });
        });
      }

      return { message: 'Publicación eliminada exitosamente' };
    } catch (error) {
      logger.error('Error eliminando publicación', {
        userId,
        postId,
        error: error.message
      });
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
      logger.warn('Error eliminando archivo de Cloudinary', {
        publicId: cloudinaryPublicId,
        type: postType,
        error: error.message
      });
      // No lanzar error, es operación en background
    }
  }

  // Obtener posts de usuarios seguidos con paginación
  static async getFollowingPosts(userId, options = {}) {
    const cursor = options.cursor || null;
    const limit = options.limit || 15;
    try {
      // Obtener IDs de usuarios seguidos
      const followingUsers = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
      });

      const followingIds = followingUsers.map(follow => follow.followingId);

      if (followingIds.length === 0) {
        return {
          posts: [],
          nextCursor: null
        };
      }

      const where = {
        userId: { [Op.in]: followingIds },
        isPublic: true,
        status: 'published'
      };

      // Si hay cursor, agregar condición para paginación por cursor
      if (cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          // WHERE (created_at < cursorCreatedAt OR (created_at = cursorCreatedAt AND id < cursorId))
          where[Op.or] = [
            {
              createdAt: {
                [Op.lt]: decoded.createdAt
              }
            },
            {
              [Op.and]: [
                {
                  createdAt: decoded.createdAt
                },
                {
                  id: {
                    [Op.lt]: decoded.id
                  }
                }
              ]
            }
          ];
        }
      }

      // Obtener posts con paginación por cursor
      const posts = await Post.findAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          }
        ],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: parseInt(limit) + 1, // Obtener uno más para saber si hay más
        subQuery: false,
        distinct: true
      });

      // Determinar si hay más posts
      const hasMore = posts.length > limit;
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

      // Obtener likes del usuario para todos los posts de una vez
      let userLikes = new Set();
      if (userId && postsToReturn.length > 0) {
        const postIds = postsToReturn.map(post => post.id);
        const likes = await Like.findAll({
          where: {
            userId: userId,
            postId: { [Op.in]: postIds }
          },
          attributes: ['postId']
        });
        userLikes = new Set(likes.map(like => like.postId));
      }

      // Transformar posts para el frontend con información de likes
      const transformedPosts = postsToReturn.map(post => {
        const postData = post.toJSON();
        
        // Agregar información de likes
        if (userId) {
          postData.isLiked = userLikes.has(post.id);
        } else {
          postData.isLiked = false;
        }
        
        return this.transformPostForFrontendSync(postData, userId);
      });

      // Generar nextCursor desde el último post
      const nextCursor = transformedPosts.length > 0 && hasMore 
        ? generateCursorFromPost(postsToReturn[postsToReturn.length - 1])
        : null;

      return {
        posts: transformedPosts,
        nextCursor
      };

    } catch (error) {
      logger.error('Error obteniendo posts de usuarios seguidos', {
        userId,
        cursor,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Obtener posts de usuarios seguidos (MÉTODO ANTIGUO - SIN USAR)
  static async getFollowingPosts_OLD(userId, page, limit, offset) {
    try {
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

  // Guardar o quitar post de guardados
  static async toggleSave(userId, postId) {
    try {
      // Verificar que el post existe
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new NotFoundError('Post no encontrado');
      }

      // Verificar si ya está guardado
      const existing = await SavedPost.findOne({
        where: {
          userId,
          postId
        }
      });

      let saved = false;
      let savesCount = 0;

      if (existing) {
        // Quitar de guardados
        await existing.destroy();
        // Decrementar savesCount del post
        await post.decrement('savesCount');
        saved = false;
        savesCount = Math.max(0, (post.savesCount || 0) - 1);
      } else {
        // Guardar post
        await SavedPost.create({
          userId,
          postId
        });
        // Incrementar savesCount del post
        await post.increment('savesCount');
        saved = true;
        savesCount = (post.savesCount || 0) + 1;
      }

      // Recargar el post para obtener el savesCount actualizado
      await post.reload();

      return {
        saved,
        savesCount: post.savesCount || 0
      };
    } catch (error) {
      logger.error('Error en toggleSave:', error);
      throw error;
    }
  }

  // Obtener posts guardados del usuario
  static async getSavedPosts(userId, cursor = null, limit = 20) {
    try {
      const where = { userId };

      // Si hay cursor, necesitamos obtener el post asociado para comparar
      let cursorPostId = null;
      let cursorPostCreatedAt = null;
      if (cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          cursorPostId = decoded.id;
          cursorPostCreatedAt = decoded.createdAt;
        }
      }

      // Construir query base
      const queryOptions = {
        where,
        include: [
          {
            model: Post,
            as: 'post',
            where: { isPublic: true },
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
              }
            ]
          }
        ],
        order: [[{ model: Post, as: 'post' }, 'createdAt', 'DESC'], [{ model: Post, as: 'post' }, 'id', 'DESC']],
        limit: parseInt(limit) + 1 // Obtener uno más para saber si hay más
      };

      // Si hay cursor, agregar condición
      if (cursor && cursorPostId && cursorPostCreatedAt) {
        // Necesitamos filtrar por el createdAt e id del Post asociado
        // Esto se hace en el where del include
        queryOptions.include[0].where = {
          ...queryOptions.include[0].where,
          [Op.or]: [
            {
              createdAt: {
                [Op.lt]: cursorPostCreatedAt
              }
            },
            {
              [Op.and]: [
                {
                  createdAt: cursorPostCreatedAt
                },
                {
                  id: {
                    [Op.lt]: cursorPostId
                  }
                }
              ]
            }
          ]
        };
      }

      const savedPosts = await SavedPost.findAll(queryOptions);

      // Determinar si hay más posts
      const hasMore = savedPosts.length > limit;
      const savedPostsToReturn = hasMore ? savedPosts.slice(0, limit) : savedPosts;

      // Obtener likes del usuario para todos los posts
      let userLikes = new Set();
      if (savedPostsToReturn.length > 0) {
        const postIds = savedPostsToReturn.map(sp => sp.post?.id).filter(Boolean);
        if (postIds.length > 0) {
          const likes = await Like.findAll({
            where: {
              userId,
              postId: { [Op.in]: postIds }
            },
            attributes: ['postId']
          });
          userLikes = new Set(likes.map(like => like.postId));
        }
      }

      // Verificar qué posts están guardados (todos deberían estarlo, pero verificamos)
      let savedPostsSet = new Set();
      if (savedPostsToReturn.length > 0) {
        const postIds = savedPostsToReturn.map(sp => sp.post?.id).filter(Boolean);
        if (postIds.length > 0) {
          const saved = await SavedPost.findAll({
            where: {
              userId,
              postId: { [Op.in]: postIds }
            },
            attributes: ['postId']
          });
          savedPostsSet = new Set(saved.map(sp => sp.postId));
        }
      }

      // Transformar posts
      const posts = savedPostsToReturn
        .map(savedPost => savedPost.post)
        .filter(Boolean)
        .map(post => {
          const postData = this.transformPostForFrontendSync(post, userId);
          postData.isLiked = userLikes.has(post.id);
          postData.isSaved = savedPostsSet.has(post.id);
          return postData;
        });

      // Generar nextCursor desde el último post
      const lastPost = posts.length > 0 ? savedPostsToReturn[savedPostsToReturn.length - 1]?.post : null;
      const nextCursor = lastPost && hasMore 
        ? generateCursorFromPost(lastPost)
        : null;

      return {
        posts,
        nextCursor
      };
    } catch (error) {
      logger.error('Error en getSavedPosts:', error);
      throw error;
    }
  }

  // Verificar si un post está guardado por el usuario
  static async isPostSaved(userId, postId) {
    try {
      const saved = await SavedPost.findOne({
        where: {
          userId,
          postId
        }
      });
      return !!saved;
    } catch (error) {
      logger.error('Error en isPostSaved:', error);
      return false;
    }
  }

  // Obtener información de likes de una publicación
  static async getLikeInfo(postId, userId = null) {
    try {
      const post = await this.getPostById(postId, userId);
      
      if (!post) {
        return null;
      }

      return {
        likesCount: post.likesCount || 0,
        isLiked: post.isLiked || false,
        postId
      };
    } catch (error) {
      logger.error('Error obteniendo información de likes', { postId, userId, error: error.message });
      throw error;
    }
  }
}

module.exports = PostService;
