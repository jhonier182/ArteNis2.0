import { User } from './user.model';

/**
 * Modelo para Posts/Publicaciones
 */
export interface Post {
  id: string;
  title?: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'reel';
  author: User;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface CreatePostDto {
  title?: string;
  description?: string;
  mediaUrl: string;
  type: 'image' | 'video' | 'reel';
}

export interface UpdatePostDto {
  title?: string;
  description?: string;
}

export interface PostResponse {
  success: boolean;
  data: {
    post: Post;
  };
  message?: string;
}
