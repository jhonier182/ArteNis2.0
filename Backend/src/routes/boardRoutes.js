const express = require('express');
const BoardController = require('../controllers/boardController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { handleValidationErrors, sanitizeQuery } = require('../middlewares/validation');
const {
  validateCreateBoard,
  validateUpdateBoard,
  validateAddPostToBoard,
  validateSearchBoards,
  validateGetBoardPosts
} = require('../middlewares/boardValidation');

const router = express.Router();

// Rutas públicas o con autenticación opcional

// GET /api/boards/search - Buscar tableros públicos
router.get('/search',
  optionalAuth,
  sanitizeQuery,
  validateSearchBoards,
  handleValidationErrors,
  BoardController.searchBoards
);

// GET /api/boards/categories - Obtener categorías disponibles
router.get('/categories',
  BoardController.getCategories
);

// GET /api/boards/:id - Obtener tablero por ID
router.get('/:id',
  optionalAuth,
  BoardController.getBoardById
);

// GET /api/boards/:id/posts - Obtener posts de un tablero
router.get('/:id/posts',
  optionalAuth,
  sanitizeQuery,
  validateGetBoardPosts,
  handleValidationErrors,
  BoardController.getBoardPosts
);

// GET /api/boards/user/:userId - Obtener tableros de un usuario
router.get('/user/:userId',
  optionalAuth,
  sanitizeQuery,
  BoardController.getUserBoards
);

// Rutas protegidas (requieren autenticación)

// GET /api/boards/me/boards - Obtener tableros del usuario autenticado
router.get('/me/boards',
  verifyToken,
  sanitizeQuery,
  BoardController.getMyBoards
);

// POST /api/boards - Crear nuevo tablero
router.post('/',
  verifyToken,
  validateCreateBoard,
  handleValidationErrors,
  BoardController.createBoard
);

// PUT /api/boards/:id - Actualizar tablero
router.put('/:id',
  verifyToken,
  validateUpdateBoard,
  handleValidationErrors,
  BoardController.updateBoard
);

// DELETE /api/boards/:id - Eliminar tablero
router.delete('/:id',
  verifyToken,
  BoardController.deleteBoard
);

// POST /api/boards/:id/posts - Agregar post a tablero
router.post('/:id/posts',
  verifyToken,
  validateAddPostToBoard,
  handleValidationErrors,
  BoardController.addPostToBoard
);

// DELETE /api/boards/:id/posts/:postId - Remover post de tablero
router.delete('/:id/posts/:postId',
  verifyToken,
  BoardController.removePostFromBoard
);

// POST /api/boards/:id/follow - Seguir tablero
router.post('/:id/follow',
  verifyToken,
  BoardController.followBoard
);

// DELETE /api/boards/:id/follow - Dejar de seguir tablero
router.delete('/:id/follow',
  verifyToken,
  BoardController.unfollowBoard
);

module.exports = router;
