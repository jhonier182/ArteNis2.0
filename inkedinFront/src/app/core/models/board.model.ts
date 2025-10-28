import { Post } from './post.model';

/**
 * Modelo para Boards/Colecciones
 */
export interface Board {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  coverImage?: string;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
  Posts?: Post[];
}

export interface CreateBoardDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface BoardResponse {
  success: boolean;
  data: {
    board: Board;
  };
  message?: string;
}

export interface BoardsResponse {
  success: boolean;
  data: {
    boards: Board[];
    total: number;
  };
  message?: string;
}
