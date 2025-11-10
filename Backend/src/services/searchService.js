const { Op } = require('sequelize');
const { User, Post, Board } = require('../models');
const { sequelize } = require('../config/db');
const { BadRequestError } = require('../utils/errors');

class SearchService {
  /**
   * Búsqueda general unificada
   * Busca en usuarios, posts y boards con filtro opcional por ciudad
   * 
   * @param {Object} searchParams - Parámetros de búsqueda
   * @param {string} searchParams.q - Query de búsqueda (requerido)
   * @param {string} searchParams.city - Filtro opcional por ciudad
   * @param {string} searchParams.type - Tipo: 'all', 'artists', 'posts', 'boards' (default: 'all')
   * @param {number} searchParams.page - Página (default: 1)
   * @param {number} searchParams.limit - Límite por página (default: 15)
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  static async search(searchParams) {
    try {
      const {
        q = '',
        city,
        type = 'all', // all, artists, posts, boards
        page = 1,
        limit = 15
      } = searchParams;

      // Si se especifica un tipo específico (no 'all'), permitir query vacío para obtener todos
      // Si es 'all', se requiere query porque buscar en todo sin filtro sería muy costoso
      const isEmptyQueryAllowed = type !== 'all';
      const query = q.trim();

      // Validación: requerir query solo si no se permite query vacío
      if (!isEmptyQueryAllowed && (!query || query.length < 2)) {
        throw new BadRequestError('La búsqueda debe tener al menos 2 caracteres');
      }

      // Si la query está vacía pero está permitida, usar query especial para obtener todos
      const searchQuery = isEmptyQueryAllowed && !query ? null : query;

      // Ejecutar búsquedas en paralelo según el tipo
      const searchPromises = [];

      // Búsqueda de usuarios/artistas
      if (type === 'all' || type === 'artists') {
        searchPromises.push(this._searchUsers(searchQuery, city, page, limit));
      } else {
        searchPromises.push(Promise.resolve({ users: [], total: 0 }));
      }

      // Búsqueda de posts
      if (type === 'all' || type === 'posts') {
        searchPromises.push(this._searchPosts(searchQuery, city, page, limit));
      } else {
        searchPromises.push(Promise.resolve({ posts: [], total: 0 }));
      }

      // Búsqueda de boards
      if (type === 'all' || type === 'boards') {
        searchPromises.push(this._searchBoards(searchQuery, city, page, limit));
      } else {
        searchPromises.push(Promise.resolve({ boards: [], total: 0 }));
      }

      // Ejecutar búsquedas en paralelo
      const [usersResult, postsResult, boardsResult] = await Promise.all(searchPromises);

      // Calcular total de items para paginación
      const totalItems = (usersResult.total || 0) + (postsResult.total || 0) + (boardsResult.total || 0);

      // Formatear respuesta
      const results = {
        artists: usersResult.users || [],
        posts: postsResult.posts || [],
        boards: boardsResult.boards || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      };

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método privado: Buscar usuarios/artistas
   */
  static async _searchUsers(query, city, page, limit) {
    try {
      const offset = (page - 1) * limit;
      const where = {
        isActive: true
      };

      // Filtro por texto de búsqueda (si hay query)
      if (query) {
        where[Op.or] = [
          { username: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } },
          { bio: { [Op.like]: `%${query}%` } }
        ];
      }
      // Si no hay query, buscar todos los usuarios activos

      // Filtro por ciudad (busca en city, state, country)
      if (city) {
        const cityConditions = [
          { city: { [Op.like]: `%${city}%` } },
          { state: { [Op.like]: `%${city}%` } },
          { country: { [Op.like]: `%${city}%` } }
        ];
        
        // Si ya hay Op.or para query, usar Op.and para combinar
        if (where[Op.or]) {
          where[Op.and] = [
            { [Op.or]: where[Op.or] },
            { [Op.or]: cityConditions }
          ];
          delete where[Op.or];
        } else {
          where[Op.or] = cityConditions;
        }
      }

      const users = await User.findAndCountAll({
        where,
        attributes: [
          'id', 'username', 'fullName', 'avatar', 'bio',
          'city', 'state', 'country', 'isVerified', 'userType',
          'followersCount', 'postsCount', 'createdAt'
        ],
        order: [['followersCount', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        users: users.rows.map(user => ({
          ...user.toJSON(),
          isFollowing: false, // Se puede calcular si es necesario
          mutualFollowers: 0 // Se puede calcular si es necesario
        })),
        total: users.count
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método privado: Buscar posts
   */
  static async _searchPosts(query, city, page, limit) {
    try {
      const offset = (page - 1) * limit;
      const where = {
        isPublic: true,
        status: 'published'
      };

      // Filtro por texto de búsqueda (si hay query)
      if (query) {
        where[Op.or] = [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { tags: { [Op.overlap]: [query] } }
        ];
      }
      // Si no hay query, buscar todos los posts publicados

      // Configurar include del autor con filtro de ciudad si es necesario
      const includeAuthor = {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'city', 'state'],
        required: true
      };

      // Si hay filtro de ciudad, agregarlo al where del include
      if (city) {
        includeAuthor.where = {
          [Op.or]: [
            { city: { [Op.like]: `%${city}%` } },
            { state: { [Op.like]: `%${city}%` } }
          ]
        };
      }

      const posts = await Post.findAndCountAll({
        where,
        include: [includeAuthor],
        order: [
          [sequelize.literal('(likes_count * 2 + comments_count + saves_count)'), 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        posts: posts.rows.map(post => post.toJSON()),
        total: posts.count
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Método privado: Buscar boards
   */
  static async _searchBoards(query, city, page, limit) {
    try {
      const offset = (page - 1) * limit;
      const where = {
        isPublic: true
      };

      // Filtro por texto de búsqueda (si hay query)
      if (query) {
        where[Op.or] = [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { tags: { [Op.overlap]: [query] } }
        ];
      }
      // Si no hay query, buscar todos los boards públicos

      // Configurar include del owner con filtro de ciudad si es necesario
      const includeOwner = {
        model: User,
        as: 'owner',
        attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified'],
        required: true
      };

      // Si hay filtro de ciudad, agregarlo al where del include
      if (city) {
        includeOwner.where = {
          [Op.or]: [
            { city: { [Op.like]: `%${city}%` } },
            { state: { [Op.like]: `%${city}%` } }
          ]
        };
      }

      const boards = await Board.findAndCountAll({
        where,
        include: [includeOwner],
        order: [
          ['followersCount', 'DESC'],
          ['postsCount', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        boards: boards.rows.map(board => board.toJSON()),
        total: boards.count
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sugerencias de búsqueda inteligente
   */
  static async getSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const suggestions = [];

      // Sugerencias de estilos populares
      const styles = [
        'tradicional', 'realista', 'minimalista', 'geométrico',
        'acuarela', 'blackwork', 'dotwork', 'tribal', 'japonés'
      ];
      
      const queryLower = query.toLowerCase();
      for (let i = 0; i < styles.length; i++) {
        if (styles[i].toLowerCase().includes(queryLower)) {
          suggestions.push({
            type: 'style',
            text: styles[i],
            icon: '🎨'
          });
        }
      }

      // Sugerencias de artistas
      const artists = await User.findAll({
        where: {
          userType: 'artist',
          isActive: true,
          [Op.or]: [
            { username: { [Op.like]: `%${query}%` } },
            { fullName: { [Op.like]: `%${query}%` } }
          ]
        },
        limit: 5,
        attributes: ['id', 'username', 'fullName', 'avatar']
      });

      suggestions.push(...artists.map(artist => ({
        type: 'artist',
        text: artist.fullName || artist.username,
        subtitle: `@${artist.username}`,
        avatar: artist.avatar,
        icon: '👤',
        id: artist.id
      })));

      return suggestions.slice(0, 10);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Filtros populares para la interfaz
   */
  static getPopularFilters() {
    return {
      styles: [
        { id: 'tradicional', name: 'Tradicional', count: 0 },
        { id: 'realista', name: 'Realista', count: 0 },
        { id: 'minimalista', name: 'Minimalista', count: 0 },
        { id: 'geometrico', name: 'Geométrico', count: 0 },
        { id: 'acuarela', name: 'Acuarela', count: 0 },
        { id: 'blackwork', name: 'Blackwork', count: 0 }
      ],
      cities: [
        { id: 'bogota', name: 'Bogotá', count: 0 },
        { id: 'medellin', name: 'Medellín', count: 0 },
        { id: 'cali', name: 'Cali', count: 0 },
        { id: 'barranquilla', name: 'Barranquilla', count: 0 },
        { id: 'cartagena', name: 'Cartagena', count: 0 }
      ]
    };
  }
}

module.exports = SearchService;
