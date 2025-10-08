const { Op } = require('sequelize');
const { Board, BoardPost, BoardCollaborator, BoardFollow, Post, User } = require('../models');
const { sequelize } = require('../config/db');

class BoardService {
  // Crear nuevo tablero
  static async createBoard(userId, boardData) {
    try {
      const board = await Board.create({
        userId,
        name: boardData.name,
        description: boardData.description,
        coverImage: boardData.coverImage,
        isPublic: boardData.isPublic !== false, // por defecto público
        isPinned: boardData.isPinned || false,
        style: boardData.style,
        category: boardData.category,
        tags: boardData.tags || [],
        settings: {
          ...boardData.settings,
          allowCollaborators: boardData.settings?.allowCollaborators || false,
          allowComments: boardData.settings?.allowComments !== false,
          allowDownloads: boardData.settings?.allowDownloads || false,
          emailNotifications: boardData.settings?.emailNotifications !== false
        },
        sortOrder: boardData.sortOrder || 0
      });

      return board;
    } catch (error) {
      throw error;
    }
  }

  // Obtener tableros de un usuario
  static async getUserBoards(userId, requesterId = null, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        includePrivate = false
      } = options;

      const offset = (page - 1) * limit;
      const where = { userId };

      // Si no es el propietario, solo mostrar tableros públicos
      if (requesterId !== userId && !includePrivate) {
        where.isPublic = true;
      }

      // Primero obtener los boards sin los posts
      const boards = await Board.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: [['isPinned', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Luego cargar los posts para cada board (preview de 4)
      const boardsWithPosts = await Promise.all(
        boards.rows.map(async (board) => {
          const posts = await board.getPosts({
            limit: 4,
            order: [['createdAt', 'DESC']],
            through: { attributes: ['sortOrder', 'addedAt'] }
          });
          return {
            ...board.toJSON(),
            posts
          };
        })
      );

      return {
        boards: boardsWithPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(boards.count / limit),
          totalItems: boards.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener tablero por ID
  static async getBoardById(boardId, requesterId = null) {
    try {
      const board = await Board.findByPk(boardId, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'userType']
          },
          {
            model: BoardCollaborator,
            as: 'collaborators',
            where: { status: 'accepted' },
            required: false,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
              }
            ]
          }
        ]
      });

      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      // Verificar permisos de acceso
      if (!board.isPublic && board.userId !== requesterId) {
        // Verificar si es colaborador
        const isCollaborator = await BoardCollaborator.findOne({
          where: {
            boardId,
            userId: requesterId,
            status: 'accepted'
          }
        });

        if (!isCollaborator) {
          throw new Error('No tienes permisos para ver este tablero');
        }
      }

      // Verificar si el usuario sigue el tablero
      let isFollowing = false;
      if (requesterId && requesterId !== board.userId) {
        isFollowing = await BoardFollow.isFollowing(requesterId, boardId);
      }

      return {
        ...board.toJSON(),
        isFollowing,
        isOwner: requesterId === board.userId,
        canEdit: requesterId === board.userId || board.collaborators?.some(c => 
          c.userId === requesterId && (c.permissions?.canEditBoard || c.role === 'moderator')
        )
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener posts de un tablero
  static async getBoardPosts(boardId, requesterId = null, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'recent'
      } = options;

      const offset = (page - 1) * limit;

      // Verificar acceso al tablero
      const board = await Board.findByPk(boardId);
      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      if (!board.isPublic && board.userId !== requesterId) {
        const isCollaborator = await BoardCollaborator.findOne({
          where: {
            boardId,
            userId: requesterId,
            status: 'accepted'
          }
        });

        if (!isCollaborator) {
          throw new Error('No tienes permisos para ver este tablero');
        }
      }

      // Ordenamiento
      let order = [];
      switch (sortBy) {
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'popular':
          order = [['likesCount', 'DESC']];
          break;
        case 'custom':
          order = [[{ model: BoardPost, as: 'BoardPost' }, 'sortOrder', 'ASC']];
          break;
        default:
          order = [['createdAt', 'DESC']];
      }

      const posts = await Post.findAndCountAll({
        include: [
          {
            model: BoardPost,
            where: { boardId },
            attributes: ['sortOrder', 'note', 'createdAt'],
            include: [
              {
                model: User,
                as: 'addedByUser',
                attributes: ['id', 'username', 'fullName', 'avatar']
              }
            ]
          },
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        where: { isPublic: true }, // Solo posts públicos
        order,
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

  // Agregar post a tablero
  static async addPostToBoard(boardId, postId, userId, options = {}) {
    try {
      // Verificar que el tablero existe y el usuario tiene permisos
      const board = await Board.findByPk(boardId);
      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      // Verificar permisos
      const canAdd = await this.canUserModifyBoard(boardId, userId, 'canAddPosts');
      if (!canAdd) {
        throw new Error('No tienes permisos para agregar posts a este tablero');
      }

      // Verificar que el post existe
      const post = await Post.findByPk(postId);
      if (!post) {
        throw new Error('Publicación no encontrada');
      }

      // Verificar que no esté ya en el tablero
      const existingBoardPost = await BoardPost.findOne({
        where: { boardId, postId }
      });

      if (existingBoardPost) {
        throw new Error('La publicación ya está en este tablero');
      }

      let boardPost;
      await sequelize.transaction(async (t) => {
        // Crear relación board-post
        boardPost = await BoardPost.create({
          boardId,
          postId,
          addedBy: userId,
          sortOrder: options.sortOrder || 0,
          note: options.note
        }, { transaction: t });

        // Incrementar contador de posts del tablero
        await board.incrementPosts();
      });

      return boardPost;
    } catch (error) {
      throw error;
    }
  }

  // Remover post de tablero
  static async removePostFromBoard(boardId, postId, userId) {
    try {
      const boardPost = await BoardPost.findOne({
        where: { boardId, postId }
      });

      if (!boardPost) {
        throw new Error('La publicación no está en este tablero');
      }

      // Verificar permisos
      const canRemove = await this.canUserModifyBoard(boardId, userId, 'canRemovePosts');
      if (!canRemove && boardPost.addedBy !== userId) {
        throw new Error('No tienes permisos para remover esta publicación');
      }

      await sequelize.transaction(async (t) => {
        await boardPost.destroy({ transaction: t });

        // Decrementar contador
        const board = await Board.findByPk(boardId);
        await board.decrementPosts();
      });

      return { message: 'Publicación removida del tablero exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  // Seguir tablero
  static async followBoard(userId, boardId) {
    try {
      const board = await Board.findByPk(boardId);
      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      if (!board.isPublic) {
        throw new Error('No puedes seguir un tablero privado');
      }

      if (board.userId === userId) {
        throw new Error('No puedes seguir tu propio tablero');
      }

      const existingFollow = await BoardFollow.findOne({
        where: { userId, boardId }
      });

      if (existingFollow) {
        throw new Error('Ya sigues este tablero');
      }

      await sequelize.transaction(async (t) => {
        await BoardFollow.create({ userId, boardId }, { transaction: t });
        await board.incrementFollowers();
      });

      return { message: 'Tablero seguido exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  // Dejar de seguir tablero
  static async unfollowBoard(userId, boardId) {
    try {
      const follow = await BoardFollow.findOne({
        where: { userId, boardId }
      });

      if (!follow) {
        throw new Error('No sigues este tablero');
      }

      await sequelize.transaction(async (t) => {
        await follow.destroy({ transaction: t });

        const board = await Board.findByPk(boardId);
        await board.decrementFollowers();
      });

      return { message: 'Has dejado de seguir el tablero' };
    } catch (error) {
      throw error;
    }
  }

  // Verificar permisos de usuario en tablero
  static async canUserModifyBoard(boardId, userId, permission = 'canAddPosts') {
    try {
      const board = await Board.findByPk(boardId);
      if (!board) return false;

      // El propietario siempre puede modificar
      if (board.userId === userId) return true;

      // Verificar si es colaborador
      const collaborator = await BoardCollaborator.findOne({
        where: {
          boardId,
          userId,
          status: 'accepted'
        }
      });

      if (!collaborator) return false;

      // Verificar permisos específicos
      return collaborator.permissions?.[permission] || collaborator.role === 'moderator';
    } catch (error) {
      return false;
    }
  }

  // Buscar tableros públicos
  static async searchBoards(searchParams) {
    try {
      const {
        q = '',
        category,
        style,
        tags,
        sortBy = 'followers',
        order = 'desc',
        page = 1,
        limit = 20
      } = searchParams;

      const offset = (page - 1) * limit;
      const where = { isPublic: true };

      // Filtro por texto de búsqueda
      if (q) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ];
      }

      // Filtros específicos
      if (category) where.category = category;
      if (style) where.style = { [Op.like]: `%${style}%` };
      if (tags && Array.isArray(tags)) {
        where.tags = { [Op.overlap]: tags };
      }

      // Ordenamiento
      const orderBy = [];
      switch (sortBy) {
        case 'followers':
          orderBy.push(['followersCount', order.toUpperCase()]);
          break;
        case 'posts':
          orderBy.push(['postsCount', order.toUpperCase()]);
          break;
        case 'recent':
          orderBy.push(['createdAt', order.toUpperCase()]);
          break;
        case 'name':
          orderBy.push(['name', order.toUpperCase()]);
          break;
        default:
          orderBy.push(['followersCount', 'DESC']);
      }

      const boards = await Board.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: orderBy,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        boards: boards.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(boards.count / limit),
          totalItems: boards.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar tablero
  static async updateBoard(boardId, userId, updateData) {
    try {
      const board = await Board.findByPk(boardId);
      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      // Verificar permisos
      const canEdit = await this.canUserModifyBoard(boardId, userId, 'canEditBoard');
      if (!canEdit) {
        throw new Error('No tienes permisos para editar este tablero');
      }

      // Campos permitidos para actualización
      const allowedFields = [
        'name', 'description', 'coverImage', 'isPublic', 'isPinned',
        'style', 'category', 'tags', 'settings', 'sortOrder'
      ];

      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      await board.update(filteredData);

      return board;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar tablero
  static async deleteBoard(boardId, userId) {
    try {
      const board = await Board.findByPk(boardId);
      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      // Solo el propietario puede eliminar
      if (board.userId !== userId) {
        throw new Error('Solo el propietario puede eliminar el tablero');
      }

      await board.destroy();

      return { message: 'Tablero eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BoardService;
