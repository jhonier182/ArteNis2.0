import { apiClient } from '@/services/apiClient'

export interface Post {
  id: string
  title?: string
  description?: string
  imageUrl?: string
  mediaUrl?: string // Compatibilidad con backend
  authorId: string
  author: {
    id: string
    username: string
    fullName?: string
    avatar?: string
    isVerified?: boolean
    userType?: string
  }
  likesCount: number
  commentsCount: number
  viewsCount?: number
  isLiked: boolean
  isSaved: boolean
  tags?: string[]
  hashtags?: string[] // Compatibilidad con backend
  createdAt: string
  updatedAt: string
}

export interface CreatePostData {
  title: string
  description?: string
  imageUrl: string
  tags?: string[]
}

export interface PostFilters {
  page?: number
  limit?: number
  tags?: string[]
  authorId?: string
  search?: string
}

/**
 * Servicio para manejo de posts
 */
export const postService = {
  async getPosts(filters?: PostFilters): Promise<{ posts: Post[]; total: number }> {
    const response = await apiClient
      .getClient()
      .get<{ posts: Post[]; total: number }>('/posts', { params: filters })
    return response.data
  },

  async getPostById(id: string): Promise<Post> {
    const response = await apiClient.getClient().get<{
      success: boolean
      data: { post: Post }
    }>(`/posts/${id}`)
    
    // Extraer el post de la estructura de respuesta del backend
    const responseData = response.data.data || response.data
    return responseData.post || responseData
  },

  async createPost(data: CreatePostData): Promise<Post> {
    const response = await apiClient.getClient().post<Post>('/posts', data)
    return response.data
  },

  async updatePost(id: string, data: Partial<CreatePostData>): Promise<Post> {
    const response = await apiClient.getClient().put<Post>(`/posts/${id}`, data)
    return response.data
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.getClient().delete(`/posts/${id}`)
  },

  async likePost(id: string): Promise<void> {
    await apiClient.getClient().post(`/posts/${id}/like`)
  },

  async unlikePost(id: string): Promise<void> {
    await apiClient.getClient().delete(`/posts/${id}/like`)
  },

  async savePost(id: string): Promise<void> {
    await apiClient.getClient().post(`/posts/${id}/save`)
  },

  async unsavePost(id: string): Promise<void> {
    await apiClient.getClient().delete(`/posts/${id}/save`)
  },
}

