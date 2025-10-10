const { Op } = require('sequelize');
const { User, Post, Board } = require('../models');
const { sequelize } = require('../config/db');

class SearchService {
  // Búsqueda global inteligente
  static async globalSearch(searchParams) {
    try {
      const {
        q = '',
        type = 'all', // all, artists, posts, boards
        style,
        location,
        priceRange,
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = searchParams;

      const offset = (page - 1) * limit;
      const results = {
        artists: [],
        posts: [],
        boards: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit)
        }
      };

      // Si no hay término de búsqueda, devolver resultados trending
      if (!q && type === 'all') {
        return await this.getTrendingContent(searchParams);
      }

      // Buscar artistas
      if (type === 'all' || type === 'artists') {
        results.artists = await this.searchArtists(q, {
          style,
          location,
          priceRange,
          sortBy,
          page,
          limit: type === 'artists' ? limit : Math.min(limit, 10)
        });
      }

      // Buscar publicaciones
      if (type === 'all' || type === 'posts') {
        results.posts = await this.searchPosts(q, {
          style,
          location,
          sortBy,
          page,
          limit: type === 'posts' ? limit : Math.min(limit, 15)
        });
      }

      // Buscar tableros
      if (type === 'all' || type === 'boards') {
        results.boards = await this.searchBoards(q, {
          style,
          sortBy,
          page,
          limit: type === 'boards' ? limit : Math.min(limit, 10)
        });
      }

      // Calcular totales para paginación
      if (type !== 'all') {
        const totalItems = results[type + 's']?.length || 0;
        results.pagination.totalPages = Math.ceil(totalItems / limit);
        results.pagination.totalItems = totalItems;
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  // Búsqueda específica de artistas
  static async searchArtists(query = '', options = {}) {
    try {
      const {
        style,
        location,
        priceRange,
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        isVerified,
        rating
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        userType: 'artist',
        isActive: true
      };

      // Filtro por texto de búsqueda
      if (query) {
        where[Op.or] = [
          { username: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } },
          { bio: { [Op.like]: `%${query}%` } },
          { specialties: { [Op.overlap]: [query] } }
        ];
      }

      // Filtros específicos
      if (style) {
        where.specialties = { [Op.overlap]: [style] };
      }

      if (location) {
        where[Op.or] = [
          ...(where[Op.or] || []),
          { city: { [Op.like]: `%${location}%` } },
          { state: { [Op.like]: `%${location}%` } },
          { country: { [Op.like]: `%${location}%` } }
        ];
      }

      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }

      if (rating && rating > 0) {
        where.rating = { [Op.gte]: rating };
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (min) where.pricePerHour = { [Op.gte]: min };
        if (max) where.pricePerHour = { ...where.pricePerHour, [Op.lte]: max };
      }

      // Ordenamiento
      let order = [];
      switch (sortBy) {
        case 'followers':
          order = [['followersCount', 'DESC']];
          break;
        case 'rating':
          order = [['rating', 'DESC'], ['reviewsCount', 'DESC']];
          break;
        case 'recent':
          order = [['createdAt', 'DESC']];
          break;
        case 'price_low':
          order = [['pricePerHour', 'ASC']];
          break;
        case 'price_high':
          order = [['pricePerHour', 'DESC']];
          break;
        case 'nearby':
          // Para implementar después con geolocalización
          order = [['followersCount', 'DESC']];
          break;
        default:
          // Relevancia: combina varios factores
          order = [
            ['isVerified', 'DESC'],
            ['rating', 'DESC'],
            ['followersCount', 'DESC']
          ];
      }

      const artists = await User.findAndCountAll({
        where,
        attributes: [
          'id', 'username', 'fullName', 'avatar', 'bio',
          'city', 'state', 'country', 'isVerified', 'userType',
          'followersCount', 'postsCount', 'rating', 'reviewsCount',
          'pricePerHour', 'specialties', 'portfolioImages',
          'socialLinks', 'businessHours', 'createdAt'
        ],
        order,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        artists: artists.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(artists.count / limit),
          totalItems: artists.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Búsqueda específica de publicaciones
  static async searchPosts(query = '', options = {}) {
    try {
      const {
        style,
        location,
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        bodyPart,
        size,
        color,
        dateRange
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        isPublic: true,
        status: 'published'
      };

      // Filtro por texto de búsqueda
      if (query) {
        where[Op.or] = [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { tags: { [Op.overlap]: [query] } }
        ];
      }

      // Filtros específicos de tatuajes
      if (style) {
        where.style = { [Op.like]: `%${style}%` };
      }

      if (bodyPart) {
        where.bodyPart = { [Op.like]: `%${bodyPart}%` };
      }

      if (size) {
        where.size = size;
      }

      if (color) {
        where.isColorTattoo = color === 'color';
      }

      if (dateRange) {
        const [startDate, endDate] = dateRange.split(',');
        if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
        if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };
      }

      // Ordenamiento
      let order = [];
      switch (sortBy) {
        case 'popular':
          order = [['likesCount', 'DESC'], ['commentsCount', 'DESC']];
          break;
        case 'recent':
          order = [['createdAt', 'DESC']];
          break;
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'trending':
          // Posts con más interacción en los últimos 7 días
          order = [
            [sequelize.literal('(likes_count + comments_count + saves_count)'), 'DESC'],
            ['createdAt', 'DESC']
          ];
          break;
        default:
          // Relevancia
          order = [
            [sequelize.literal('(likes_count * 2 + comments_count + saves_count)'), 'DESC'],
            ['createdAt', 'DESC']
          ];
      }

      const posts = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified', 'city', 'state'],
            where: location ? {
              [Op.or]: [
                { city: { [Op.like]: `%${location}%` } },
                { state: { [Op.like]: `%${location}%` } }
              ]
            } : undefined
          }
        ],
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

  // Búsqueda específica de tableros
  static async searchBoards(query = '', options = {}) {
    try {
      const {
        style,
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        category
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        isPublic: true
      };

      // Filtro por texto de búsqueda
      if (query) {
        where[Op.or] = [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { tags: { [Op.overlap]: [query] } }
        ];
      }

      // Filtros específicos
      if (style) {
        where.style = { [Op.like]: `%${style}%` };
      }

      if (category) {
        where.category = category;
      }

      // Ordenamiento
      let order = [];
      switch (sortBy) {
        case 'followers':
          order = [['followersCount', 'DESC']];
          break;
        case 'posts':
          order = [['postsCount', 'DESC']];
          break;
        case 'recent':
          order = [['createdAt', 'DESC']];
          break;
        default:
          order = [
            ['followersCount', 'DESC'],
            ['postsCount', 'DESC']
          ];
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
        order,
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

  // Contenido trending para página de inicio
  static async getTrendingContent(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;

      // Artistas trending (más seguidores recientes)
      const trendingArtists = await User.findAll({
        where: {
          userType: 'artist',
          isActive: true
        },
        order: [
          ['followersCount', 'DESC'],
          ['postsCount', 'DESC']
        ],
        limit: 10,
        attributes: [
          'id', 'username', 'fullName', 'avatar', 'bio',
          'city', 'state', 'isVerified', 'followersCount',
          'specialties', 'rating'
        ]
      });

      // Posts trending (más interacción en últimos 7 días)
      const trendingPosts = await Post.findAll({
        where: {
          isPublic: true,
          status: 'published',
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
          }
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: [
          [sequelize.literal('(likes_count * 2 + comments_count + saves_count)'), 'DESC']
        ],
        limit: 15
      });

      // Tableros populares
      const popularBoards = await Board.findAll({
        where: {
          isPublic: true
        },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'fullName', 'avatar', 'isVerified']
          }
        ],
        order: [
          ['followersCount', 'DESC'],
          ['postsCount', 'DESC']
        ],
        limit: 8
      });

      return {
        artists: trendingArtists,
        posts: trendingPosts,
        boards: popularBoards,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          totalItems: trendingArtists.length + trendingPosts.length + popularBoards.length,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Búsqueda de artistas cercanos por geolocalización
  static async findNearbyArtists(lat, lng, radiusKm = 50, options = {}) {
    try {
      const {
        style,
        priceRange,
        rating,
        limit = 20
      } = options;

      // Usando fórmula de Haversine para calcular distancia
      const earthRadiusKm = 6371;
      const whereConditions = {
        userType: 'artist',
        isActive: true,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null }
      };

      // Filtros adicionales
      if (style) {
        whereConditions.specialties = { [Op.overlap]: [style] };
      }

      if (rating && rating > 0) {
        whereConditions.rating = { [Op.gte]: rating };
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (min) whereConditions.pricePerHour = { [Op.gte]: min };
        if (max) whereConditions.pricePerHour = { ...whereConditions.pricePerHour, [Op.lte]: max };
      }

      const artists = await User.findAll({
        where: whereConditions,
        attributes: {
          include: [
            [
              sequelize.literal(`
                (${earthRadiusKm} * acos(cos(radians(${lat})) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * 
                sin(radians(latitude))))
              `),
              'distance'
            ]
          ]
        },
        having: sequelize.literal(`distance <= ${radiusKm}`),
        order: [['distance', 'ASC']],
        limit: parseInt(limit)
      });

      return artists;
    } catch (error) {
      throw error;
    }
  }

  // Sugerencias de búsqueda inteligente
  static async getSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const suggestions = [];

      // Sugerencias de estilos populares
      // OPTIMIZACIÓN: Usar for loop en lugar de filter para mejor rendimiento
      const styles = [
        'tradicional', 'realista', 'minimalista', 'geométrico',
        'acuarela', 'blackwork', 'dotwork', 'tribal', 'japonés'
      ];
      
      const styleMatches = [];
      const queryLower = query.toLowerCase();
      for (let i = 0; i < styles.length; i++) {
        if (styles[i].toLowerCase().includes(queryLower)) {
          styleMatches.push(styles[i]);
        }
      }

      // OPTIMIZACIÓN: Usar for loop para mapeo también
      for (let i = 0; i < styleMatches.length; i++) {
        suggestions.push({
          type: 'style',
          text: styleMatches[i],
          icon: '🎨'
        });
      }

      // Sugerencias de artistas
      const artists = await User.findAll({
        where: {
          userType: 'artist',
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

  // Filtros populares para la interfaz
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
      bodyParts: [
        { id: 'brazo', name: 'Brazo', count: 0 },
        { id: 'pierna', name: 'Pierna', count: 0 },
        { id: 'espalda', name: 'Espalda', count: 0 },
        { id: 'pecho', name: 'Pecho', count: 0 },
        { id: 'mano', name: 'Mano', count: 0 },
        { id: 'cuello', name: 'Cuello', count: 0 }
      ],
      sizes: [
        { id: 'pequeño', name: 'Pequeño (< 5cm)', count: 0 },
        { id: 'mediano', name: 'Mediano (5-15cm)', count: 0 },
        { id: 'grande', name: 'Grande (> 15cm)', count: 0 }
      ],
      priceRanges: [
        { id: '0-100', name: 'Menos de $100k', count: 0 },
        { id: '100-300', name: '$100k - $300k', count: 0 },
        { id: '300-500', name: '$300k - $500k', count: 0 },
        { id: '500-1000', name: '$500k - $1M', count: 0 },
        { id: '1000+', name: 'Más de $1M', count: 0 }
      ]
    };
  }

  // Buscar usuarios
  static async searchUsers(searchParams) {
    try {
      const {
        q = '',
        type = 'all',
        location,
        verified,
        premium,
        sortBy = 'followers',
        order = 'desc',
        page = 1,
        limit = 20
      } = searchParams;

      const offset = (page - 1) * limit;
      const where = {};

      // Filtro por texto de búsqueda
      if (q) {
        where[Op.or] = [
          { username: { [Op.like]: `%${q}%` } },
          { fullName: { [Op.like]: `%${q}%` } },
          { bio: { [Op.like]: `%${q}%` } }
        ];
      }

      // Filtro por tipo de usuario
      if (type !== 'all') {
        where.userType = type;
      }

      // Filtro por ubicación
      if (location) {
        where.location = { [Op.like]: `%${location}%` };
      }

      // Filtro por verificación
      if (verified !== undefined) {
        where.isVerified = verified;
      }

      // Filtro por premium
      if (premium !== undefined) {
        where.isPremium = premium;
      }

      // Solo usuarios activos
      where.isActive = true;

      // Ordenamiento
      const orderBy = [];
      switch (sortBy) {
        case 'followers':
          orderBy.push(['followersCount', order.toUpperCase()]);
          break;
        case 'posts':
          orderBy.push(['postsCount', order.toUpperCase()]);
          break;
        case 'created':
          orderBy.push(['createdAt', order.toUpperCase()]);
          break;
        case 'username':
          orderBy.push(['username', order.toUpperCase()]);
          break;
        default:
          orderBy.push(['followersCount', 'DESC']);
      }

      const users = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: orderBy,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        users: users.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SearchService;
