import { api } from './apiClient';

// Tipos para posts
export interface Post {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    userType: string;
  };
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  description?: string;
  imageUrls?: string[];
  tags?: string[];
  boardId?: string;
}

export interface UpdatePostData {
  title?: string;
  description?: string;
  imageUrls?: string[];
  tags?: string[];
}

export interface PostFilters {
  search?: string;
  tags?: string[];
  userType?: string;
  sortBy?: 'newest' | 'oldest' | 'mostLiked' | 'mostCommented';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Servicio de posts
export const postService = {
  // Obtener feed de posts
  // NOTA: El endpoint correcto es /api/posts (no /api/posts/feed)
  async getFeed(page: number = 1, limit: number = 10, filters?: PostFilters): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.tags && { tags: filters.tags.join(',') }),
        ...(filters?.userType && { userType: filters.userType }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
        ...(filters?.dateRange && {
          startDate: filters.dateRange.start,
          endDate: filters.dateRange.end
        })
      });

      const response = await api.get<PostsResponse>(`/api/posts?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo feed:', error);
      throw error;
    }
  },

  // Obtener posts de usuarios seguidos
  async getFollowingPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<PostsResponse>(`/api/posts/following?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo posts de seguidos:', error);
      throw error;
    }
  },

  // Obtener post por ID
  async getPostById(id: string): Promise<{ success: boolean; data: { post: Post } }> {
    try {
      const response = await api.get<{ success: boolean; data: { post: Post } }>(`/api/posts/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo post:', error);
      throw error;
    }
  },

  // Crear nuevo post
  async createPost(postData: CreatePostData): Promise<{ success: boolean; message: string; data: { post: Post } }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { post: Post } }>('/api/posts', postData);
      return response;
    } catch (error: any) {
      console.error('Error creando post:', error);
      throw error;
    }
  },

  // Actualizar post
  async updatePost(id: string, postData: UpdatePostData): Promise<{ success: boolean; message: string; data: { post: Post } }> {
    try {
      const response = await api.put<{ success: boolean; message: string; data: { post: Post } }>(`/api/posts/${id}`, postData);
      return response;
    } catch (error: any) {
      console.error('Error actualizando post:', error);
      throw error;
    }
  },

  // Eliminar post
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/posts/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error eliminando post:', error);
      throw error;
    }
  },

  // Dar/quitar like a un post
  async toggleLike(postId: string): Promise<{ success: boolean; message: string; data: { liked: boolean; likesCount: number } }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { liked: boolean; likesCount: number } }>(`/api/posts/${postId}/like`);
      return response;
    } catch (error: any) {
      console.error('Error toggleando like:', error);
      throw error;
    }
  },

  // Obtener información de likes de un post
  async getLikeInfo(postId: string): Promise<{ success: boolean; data: { likesCount: number; isLiked: boolean; postId: string } }> {
    try {
      const response = await api.get<{ success: boolean; data: { likesCount: number; isLiked: boolean; postId: string } }>(`/api/posts/${postId}/likes`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo info de likes:', error);
      throw error;
    }
  },

  // Guardar/quitar post de guardados
  async toggleSave(postId: string): Promise<{ success: boolean; message: string; data: { saved: boolean; savesCount: number } }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { saved: boolean; savesCount: number } }>(`/api/posts/${postId}/save`);
      return response;
    } catch (error: any) {
      console.error('Error toggleando save:', error);
      throw error;
    }
  },

  // Obtener posts guardados
  async getSavedPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<PostsResponse>(`/api/posts/saved?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo posts guardados:', error);
      throw error;
    }
  },

  // Obtener posts de un usuario
  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<PostsResponse>(`/api/posts/user/${userId}?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo posts de usuario:', error);
      throw error;
    }
  },

  // Buscar posts
  // NOTA: El endpoint correcto es /api/search/posts (no /api/posts/search)
  async searchPosts(query: string, page: number = 1, limit: number = 10, filters?: PostFilters): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.tags && { tags: filters.tags.join(',') }),
        ...(filters?.userType && { userType: filters.userType }),
        ...(filters?.sortBy && { sortBy: filters.sortBy })
      });

      const response = await api.get<PostsResponse>(`/api/search/posts?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error buscando posts:', error);
      throw error;
    }
  },

  // Obtener posts populares
  // NOTA: Este endpoint no existe. Se recomienda usar /api/search/trending como alternativa.
  async getPopularPosts(page: number = 1, limit: number = 10, period: 'day' | 'week' | 'month' | 'all' = 'week'): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        period
      });

      // Usar trending como alternativa
      const response = await api.get<PostsResponse>(`/api/search/trending?${params}&type=posts`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo posts populares:', error);
      throw error;
    }
  },

  // Obtener posts por tags
  // NOTA: Este endpoint no existe. Se recomienda usar /api/search/posts con filtro de tags.
  async getPostsByTag(tag: string, page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams({
        q: tag,
        page: page.toString(),
        limit: limit.toString(),
        tags: tag
      });

      // Usar búsqueda con tag como alternativa
      const response = await api.get<PostsResponse>(`/api/search/posts?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo posts por tag:', error);
      throw error;
    }
  },

  // Obtener tags populares
  // NOTA: Este endpoint no existe en el backend. Se recomienda implementarlo.
  async getPopularTags(limit: number = 20): Promise<{ success: boolean; data: { tags: { name: string; count: number }[] } }> {
    try {
      // Endpoint no implementado - retornar estructura vacía por ahora
      return {
        success: true,
        data: {
          tags: []
        }
      };
    } catch (error: any) {
      console.error('Error obteniendo tags populares:', error);
      throw error;
    }
  }
};

export default postService;
