/**
 * Tests para PostController
 * 
 * Ejecutar con: npm test -- postController.test.js
 */

const PostController = require('../src/controllers/postController');
const PostService = require('../src/services/postService');
const { generateMockPosts } = require('./mocks/posts.mock');

// Mock del servicio
jest.mock('../src/services/postService');

describe('PostController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'user-123' },
      query: {},
      id: 'trace-123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('debe retornar feed exitosamente', async () => {
      const mockResult = {
        posts: [{ id: 'post-1' }],
        nextCursor: 'cursor-123'
      };

      PostService.getFeed = jest.fn().mockResolvedValue(mockResult);
      PostService.buildFeedOptions = jest.fn().mockReturnValue({
        userId: 'user-123',
        limit: 20
      });

      await PostController.getFeed(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            posts: expect.any(Array),
            nextCursor: expect.any(String),
            executionTimeMs: expect.any(Number),
            traceId: expect.any(String)
          })
        })
      );
    });

    it('debe validar cursor inválido', async () => {
      req.query.cursor = 'a'.repeat(501); // Cursor muy largo

      await PostController.getFeed(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'INVALID_CURSOR'
        })
      );
    });

    it('debe validar límite fuera de rango', async () => {
      req.query.limit = '100'; // Límite excesivo

      await PostController.getFeed(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'INVALID_LIMIT'
        })
      );
    });

    it('debe respetar feature flag cuando está deshabilitado', async () => {
      const originalFlag = process.env.ENABLE_CURSOR_FEED;
      process.env.ENABLE_CURSOR_FEED = 'false';

      await PostController.getFeed(req, res, next);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'FEED_DISABLED',
          traceId: expect.any(String)
        })
      );

      process.env.ENABLE_CURSOR_FEED = originalFlag;
    });

    it('debe incluir executionTimeMs en la respuesta', async () => {
      const mockResult = {
        posts: generateMockPosts(3),
        nextCursor: null
      };

      PostService.getFeed = jest.fn().mockResolvedValue(mockResult);
      PostService.buildFeedOptions = jest.fn().mockReturnValue({
        userId: 'user-123',
        limit: 20
      });

      await PostController.getFeed(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            executionTimeMs: expect.any(Number),
            traceId: expect.any(String),
            posts: expect.any(Array)
          })
        })
      );
    });

    it('debe manejar errores correctamente', async () => {
      const error = new Error('Database error');
      PostService.getFeed = jest.fn().mockRejectedValue(error);
      PostService.buildFeedOptions = jest.fn().mockReturnValue({
        userId: 'user-123',
        limit: 20
      });

      await PostController.getFeed(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPublicPosts', () => {
    it('debe retornar posts públicos exitosamente', async () => {
      const mockResult = {
        posts: [{ id: 'post-1' }],
        nextCursor: null
      };

      PostService.getPublicPosts = jest.fn().mockResolvedValue(mockResult);

      await PostController.getPublicPosts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            posts: expect.any(Array)
          })
        })
      );
    });

    it('debe sanitizar filtros de texto', async () => {
      req.query.style = '  realismo  ';
      req.query.bodyPart = 'brazo';
      
      PostService.getPublicPosts = jest.fn().mockResolvedValue({
        posts: [],
        nextCursor: null
      });

      await PostController.getPublicPosts(req, res, next);

      expect(PostService.getPublicPosts).toHaveBeenCalledWith(
        expect.objectContaining({
          style: 'realismo', // Debe estar trimado
          bodyPart: 'brazo'
        })
      );
    });
  });
});

