import { api } from './apiClient';

// Tipos para boards
export interface Board {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  isPinned: boolean;
  style?: string;
  category?: string;
  postsCount: number;
  followersCount: number;
  collaboratorsCount: number;
  tags?: string[];
  Posts?: Array<{
    id: string;
    [key: string]: unknown;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BoardResponse {
  success: boolean;
  data: {
    board: Board;
  };
}

export interface BoardsResponse {
  success: boolean;
  data: {
    boards: Board[];
  };
}

export interface CreateBoardData {
  name: string;
  description?: string;
  isPublic?: boolean;
  style?: string;
  category?: string;
  tags?: string[];
}

// Servicio de boards
export const boardService = {
  // Obtener todos los boards del usuario autenticado
  async getMyBoards(): Promise<BoardsResponse> {
    try {
      const response = await api.get<BoardsResponse>('/api/boards/me/boards');
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error obteniendo boards:', errorMessage);
      throw error;
    }
  },

  // Crear un nuevo board
  async createBoard(boardData: CreateBoardData): Promise<BoardResponse> {
    try {
      const response = await api.post<BoardResponse>('/api/boards', boardData);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error creando board:', errorMessage);
      throw error;
    }
  },

  // Obtener o crear board por defecto
  async getOrCreateDefaultBoard(): Promise<Board> {
    try {
      const boardsResponse = await this.getMyBoards();
      const boards = boardsResponse.data?.boards || [];

      if (boards.length === 0) {
        // Crear board por defecto
        const createResponse = await this.createBoard({
          name: 'Mis Favoritos',
          description: 'Publicaciones que me gustan'
        });
        return createResponse.data.board;
      }

      // Usar el primer board disponible
      return boards[0];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error obteniendo o creando board por defecto:', errorMessage);
      throw error;
    }
  },

  // Agregar post a un board
  async addPostToBoard(boardId: string, postId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `/api/boards/${boardId}/posts`,
        { postId }
      );
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error agregando post a board:', errorMessage);
      throw error;
    }
  },

  // Remover post de un board
  async removePostFromBoard(boardId: string, postId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(
        `/api/boards/${boardId}/posts/${postId}`
      );
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error removiendo post de board:', errorMessage);
      throw error;
    }
  },

  // Verificar si un post está guardado en algún board
  async isPostSaved(postId: string): Promise<{ isSaved: boolean; boardId?: string }> {
    try {
      const boardsResponse = await this.getMyBoards();
      const boards = boardsResponse.data?.boards || [];

      for (const board of boards) {
        const hasPost = board.Posts?.some((post) => post.id === postId);
        if (hasPost) {
          return { isSaved: true, boardId: board.id };
        }
      }

      return { isSaved: false };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error verificando si post está guardado:', errorMessage);
      // En caso de error, retornar false para no bloquear la UI
      return { isSaved: false };
    }
  },

  // Obtener IDs de todos los posts guardados
  async getSavedPostIds(): Promise<Set<string>> {
    try {
      const boardsResponse = await this.getMyBoards();
      const boards = boardsResponse.data?.boards || [];
      const savedPostIds = new Set<string>();

      boards.forEach((board) => {
        board.Posts?.forEach((post) => {
          savedPostIds.add(post.id.toString());
        });
      });

      return savedPostIds;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error obteniendo IDs de posts guardados:', errorMessage);
      // En caso de error, retornar Set vacío
      return new Set<string>();
    }
  }
};

export default boardService;

