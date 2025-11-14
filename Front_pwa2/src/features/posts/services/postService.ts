import { apiClient } from '@/services/apiClient'

export interface Post {
  id: string
  title?: string
  description?: string
  imageUrl?: string
  mediaUrl?: string // Compatibilidad con backend
  thumbnailUrl?: string
  type?: 'image' | 'video' | 'reel'
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
  title?: string
  description?: string
  imageUrl: string
  cloudinaryPublicId?: string
  type?: 'image' | 'video'
  hashtags?: string[]
  tags?: string[]
  visibility?: string
  thumbnailUrl?: string
}

export interface PostFilters {
  page?: number
  limit?: number
  tags?: string[]
  authorId?: string
  search?: string
}

export interface FeedResponse {
  posts: Post[]
  nextCursor: string | null
}

export interface PublicPostsOptions {
  cursor?: string | null
  limit?: number
  type?: 'all' | 'image' | 'video' | 'reel'
  style?: string
  bodyPart?: string
  location?: string
  featured?: boolean
  sortBy?: 'recent' | 'popular' | 'views'
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

  async uploadPostMedia(file: File): Promise<{ url: string; publicId: string; thumbnailUrl?: string; type: 'image' | 'video' }> {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await apiClient.getClient().post<{
      success: boolean
      message: string
      data: {
        url: string
        publicId: string
        thumbnailUrl?: string
        type: 'image' | 'video'
      }
    }>('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data.data
  },

  async createPost(data: CreatePostData): Promise<Post> {
    const response = await apiClient.getClient().post<{
      success: boolean
      message: string
      data: { post: Post }
    }>('/posts', data)
    return response.data.data.post
  },

  async updatePost(id: string, data: Partial<CreatePostData>): Promise<Post> {
    const response = await apiClient.getClient().put<{
      success: boolean
      message: string
      data: {
        post: Post
      }
    }>(`/posts/${id}`, {
      description: data.description,
      hashtags: data.hashtags
    })
    return response.data.data.post
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

  /**
   * Obtener feed de publicaciones (posts de usuarios seguidos)
   * @param cursor - Cursor para paginación
   * @param limit - Número de posts a obtener
   */
  async getFeed(cursor?: string | null, limit: number = 20): Promise<FeedResponse> {
    const params: Record<string, string | number> = { limit }
    if (cursor) {
      params.cursor = cursor
    }
    
    try {
      const response = await apiClient.getClient().get<{
        success: boolean
        message: string
        data: FeedResponse
      }>('/posts/feed', { params })
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al cargar el feed')
      }
      
      return response.data.data || { posts: [], nextCursor: null }
    } catch (error: any) {
      // Mejorar mensajes de error
      if (error.response?.status === 503) {
        throw new Error(error.response?.data?.message || 'El feed está temporalmente deshabilitado')
      }
      if (error.response?.status === 429) {
        throw new Error('Demasiadas solicitudes. Por favor, espera un momento.')
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  },

  /**
   * Obtener posts públicos para la sección Explorar
   * @param options - Opciones de filtrado y paginación
   */
  async getPublicPosts(options: PublicPostsOptions = {}): Promise<FeedResponse> {
    const params: Record<string, string | number | boolean> = {}
    
    if (options.cursor) params.cursor = options.cursor
    if (options.limit) params.limit = options.limit
    if (options.type && options.type !== 'all') params.type = options.type
    if (options.style) params.style = options.style
    if (options.bodyPart) params.bodyPart = options.bodyPart
    if (options.location) params.location = options.location
    if (options.featured !== undefined) params.featured = options.featured
    if (options.sortBy) params.sortBy = options.sortBy
    
    const response = await apiClient.getClient().get<{
      success: boolean
      message: string
      data: FeedResponse
    }>('/posts/public', { params })
    
    return response.data.data
  },
}

