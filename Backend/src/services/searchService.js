const { Op } = require('sequelize');
const { User, Post, Board } = require('../models');
const { sequelize } = require('../config/db');
const { BadRequestError } = require('../utils/errors');

class SearchService {
  // Búsqueda global inteligente (COMPLETAMENTE NO BLOQUEANTE)
  static async globalSearch(searchParams) {
    return new Promise((resolve) => {
      // Usar setImmediate para evitar bloquear el event loop
      setImmediate(async () => {
        try {
          const {
            q = '',
            type = 'all', // all, artists, posts, boards
            style,
            location,
            priceRange,
            sortBy = 'relevance',
            page = 1,
            limit = 15 // Reducir límite para mejor rendimiento
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

          // Procesar búsquedas de forma no bloqueante
          const processSearches = async () => {
            try {
              const searchPromises = [];

              // Búsqueda de usuarios/artistas
              if (type === 'all' || type === 'artists') {
                searchPromises.push(
                  this.searchUsers({
                    q,
                    location,
                    page: 1,
                    limit: Math.min(limit, 10) // Limitar resultados
                  })
                );
              } else {
                searchPromises.push(Promise.resolve({ users: [], total: 0 }));
              }

              // Búsqueda de posts
              if (type === 'all' || type === 'posts') {
                searchPromises.push(
                  this.searchPosts({
                    q,
                    style,
                    location,
                    sortBy,
                    page: 1,
                    limit: Math.min(limit, 10) // Limitar resultados
                  })
                );
              } else {
                searchPromises.push(Promise.resolve({ posts: [], total: 0 }));
              }

              // Búsqueda de boards
              if (type === 'all' || type === 'boards') {
                searchPromises.push(
                  this.searchBoards({
                    q,
                    location,
                    page: 1,
                    limit: Math.min(limit, 10) // Limitar resultados
                  })
                );
              } else {
                searchPromises.push(Promise.resolve({ boards: [], total: 0 }));
              }

              // Ejecutar búsquedas en paralelo
              const [usersResult, postsResult, boardsResult] = await Promise.all(searchPromises);

              results.artists = usersResult.users || [];
              results.posts = postsResult.posts || [];
              results.boards = boardsResult.boards || [];

              // Calcular paginación total
              const totalItems = (usersResult.total || 0) + (postsResult.total || 0) + (boardsResult.total || 0);
              results.pagination.totalItems = totalItems;
              results.pagination.totalPages = Math.ceil(totalItems / limit);

              // Usar setImmediate para la respuesta final
              setImmediate(() => {
                resolve(results);
              });
            } catch (error) {
              // Error silencioso - devolver resultados vacíos
              setImmediate(() => {
                resolve(results);
              });
            }
          };

          // Procesar búsquedas de forma asíncrona
          processSearches();
        } catch (error) {
          // Error silencioso - devolver resultados vacíos
          setImmediate(() => {
            resolve({
              artists: [],
              posts: [],
              boards: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: parseInt(limit)
              }
            });
          });
        }
      });
    });
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
      // Validar coordenadas
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        throw new BadRequestError('Las coordenadas de latitud y longitud son requeridas', 'MISSING_REQUIRED_FIELDS');
      }

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
  // Búsqueda de usuarios (COMPLETAMENTE NO BLOQUEANTE)
  static async searchUsers(searchParams) {
    return new Promise((resolve) => {
      // Usar setImmediate para evitar bloquear el event loop
      setImmediate(async () => {
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
            limit = 15 // Reducir límite para mejor rendimiento
          } = searchParams;

          const offset = (page - 1) * limit;
          const where = {};

          // Filtro por texto de búsqueda optimizado
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

          // Ordenamiento optimizado
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
            default:
              orderBy.push(['followersCount', 'DESC']);
          }

          // Consulta optimizada con límites estrictos
          const users = await User.findAndCountAll({
            where,
            attributes: [
              'id', 'username', 'fullName', 'avatar', 'bio', 'location',
              'isVerified', 'isPremium', 'userType', 'followersCount',
              'postsCount', 'createdAt'
            ],
            order: orderBy,
            limit: parseInt(limit),
            offset: parseInt(offset)
          });

          // Procesar resultados de forma no bloqueante
          const processResults = () => {
            try {
              const transformedUsers = users.rows.map(user => ({
                ...user.toJSON(),
                // Campos calculados
                isFollowing: false, // Se puede calcular si es necesario
                mutualFollowers: 0 // Se puede calcular si es necesario
              }));

              const result = {
                users: transformedUsers,
                total: users.count,
                pagination: {
                  currentPage: parseInt(page),
                  totalPages: Math.ceil(users.count / limit),
                  totalItems: users.count,
                  itemsPerPage: parseInt(limit)
                }
              };

              // Usar setImmediate para la respuesta final
              setImmediate(() => {
                resolve(result);
              });
            } catch (error) {
              // Error silencioso - devolver resultados vacíos
              setImmediate(() => {
                resolve({
                  users: [],
                  total: 0,
                  pagination: {
                    currentPage: parseInt(page),
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: parseInt(limit)
                  }
                });
              });
            }
          };

          // Procesar resultados de forma asíncrona
          processResults();
        } catch (error) {
          // Error silencioso - devolver resultados vacíos
          setImmediate(() => {
            resolve({
              users: [],
              total: 0,
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: parseInt(limit)
              }
            });
          });
        }
      });
    });
  }

  // Procesar consulta de voz para extraer intención
  static async processVoiceQuery(transcription) {
    try {
      const query = transcription.toLowerCase();
      const params = { q: query };

      // Detectar tipo de búsqueda
      if (query.includes('artista') || query.includes('tatuador')) {
        params.type = 'artists';
      } else if (query.includes('tablero') || query.includes('colección')) {
        params.type = 'boards';
      } else if (query.includes('tatuaje') || query.includes('diseño')) {
        params.type = 'posts';
      }

      // Detectar estilo
      const styles = {
        'tradicional': ['tradicional', 'old school', 'clásico'],
        'realista': ['realista', 'fotorrealista', 'realismo'],
        'minimalista': ['minimalista', 'simple', 'fino'],
        'geométrico': ['geométrico', 'geometría', 'formas'],
        'acuarela': ['acuarela', 'watercolor', 'colores'],
        'blackwork': ['negro', 'blackwork', 'black work'],
        'tribal': ['tribal', 'étnico']
      };

      for (const [style, keywords] of Object.entries(styles)) {
        if (keywords.some(keyword => query.includes(keyword))) {
          params.style = style;
          break;
        }
      }

      // Detectar ubicación
      const locationKeywords = ['cerca', 'cercano', 'en', 'de'];
      if (locationKeywords.some(keyword => query.includes(keyword))) {
        const words = query.split(' ');
        const locationIndex = words.findIndex(word => locationKeywords.includes(word));
        if (locationIndex !== -1 && words[locationIndex + 1]) {
          params.location = words[locationIndex + 1];
        }
      }

      // Detectar orden
      if (query.includes('popular') || query.includes('famoso')) {
        params.sortBy = 'followers';
      } else if (query.includes('nuevo') || query.includes('reciente')) {
        params.sortBy = 'recent';
      } else if (query.includes('mejor calificado') || query.includes('mejor rated')) {
        params.sortBy = 'rating';
      }

      return params;
    } catch (error) {
      return { q: transcription };
    }
  }

  // Búsqueda avanzada con múltiples filtros
  static async advancedSearch(searchParams) {
    try {
      const {
        q,
        type = 'all',
        styles = [],
        bodyParts = [],
        sizes = [],
        colors = [],
        priceRange,
        location,
        radius,
        lat,
        lng,
        rating,
        isVerified,
        dateRange,
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = searchParams;

      let results;

      // Si hay coordenadas, incluir búsqueda geográfica
      if (lat && lng && (type === 'all' || type === 'artists')) {
        const nearbyArtists = await this.findNearbyArtists(
          parseFloat(lat),
          parseFloat(lng),
          parseInt(radius) || 50,
          {
            style: styles[0],
            priceRange,
            rating: parseFloat(rating),
            limit: type === 'artists' ? limit : 10
          }
        );

        if (type === 'artists') {
          results = {
            artists: nearbyArtists,
            pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(nearbyArtists.length / limit),
              totalItems: nearbyArtists.length,
              itemsPerPage: parseInt(limit)
            }
          };
        } else {
          results = await this.globalSearch({
            q,
            type,
            style: styles[0],
            location,
            priceRange,
            sortBy,
            page,
            limit
          });
          results.nearbyArtists = nearbyArtists.slice(0, 5);
        }
      } else {
        // Búsqueda estándar
        const processedParams = {
          q,
          type,
          style: styles[0],
          location,
          priceRange,
          sortBy,
          page,
          limit,
          bodyPart: bodyParts[0],
          size: sizes[0],
          color: colors.includes('color') ? 'color' : colors.includes('black') ? 'black' : undefined,
          isVerified: isVerified === 'true',
          rating: parseFloat(rating),
          dateRange
        };

        // Remover parámetros undefined
        Object.keys(processedParams).forEach(key => {
          if (processedParams[key] === undefined || processedParams[key] === '') {
            delete processedParams[key];
          }
        });

        results = await this.globalSearch(processedParams);
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SearchService;
