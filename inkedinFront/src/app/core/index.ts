/**
 * Archivo de índices para exportaciones centralizadas del módulo core
 */

// Services
export * from './services/auth.service';
export * from './services/post.service';
export * from './services/user.service';
export * from './services/search.service';
export * from './services/board.service';

// Interceptors
export * from './interceptors/auth.interceptor';
export * from './interceptors/error.interceptor';

// Guards
export * from './guards/auth.guard';

// Models
export type { User, CreateUserDto, LoginDto, AuthResponse } from './models/user.model';
export * from './models/api-response.model';
export type { Post, CreatePostDto, UpdatePostDto, PostResponse } from './models/post.model';
export type { Comment, CreateCommentDto, CommentResponse, CommentsResponse } from './models/comment.model';
export type { Board, CreateBoardDto, UpdateBoardDto, BoardResponse, BoardsResponse } from './models/board.model';
export * from './models/notification.model';
