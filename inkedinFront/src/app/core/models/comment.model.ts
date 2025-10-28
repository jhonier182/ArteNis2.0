import { User } from './user.model';

/**
 * Modelo para Comentarios
 */
export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string; // Para respuestas anidadas
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export interface CommentResponse {
  success: boolean;
  data: {
    comment: Comment;
  };
  message?: string;
}

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
    total: number;
  };
  message?: string;
}
