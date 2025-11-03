import { apiClient } from '@/services/apiClient'

export interface Profile {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean
  createdAt: string
  userType?: 'user' | 'artist' | 'admin'
  fullName?: string
  city?: string
  phone?: string
  state?: string
  country?: string
  studioName?: string
  studioAddress?: string
  pricePerHour?: number
  experience?: number
  specialties?: string[]
}

export interface UpdateProfileData {
  fullName?: string
  bio?: string
  phone?: string
  city?: string
  state?: string
  country?: string
  studioName?: string
  studioAddress?: string
  pricePerHour?: number
  experience?: number
  specialties?: string[]
  userType?: 'user' | 'artist' | 'admin'
}

export interface UserPost {
  id: string
  title?: string
  description?: string
  mediaUrl: string
  thumbnailUrl?: string
  type: 'image' | 'video'
  likesCount: number
  commentsCount: number
  isLiked?: boolean
  createdAt: string
}

export interface SavedPost extends UserPost {
  Board?: {
    id: string
    name: string
  }
}

interface PaginationResponse {
  hasNext: boolean
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  currentPage?: number
  totalPages?: number
}

interface RawPostResponse {
  id: string
  title?: string
  description?: string
  mediaUrl?: string
  imageUrl?: string
  thumbnailUrl?: string
  type?: 'image' | 'video'
  likesCount?: number
  commentsCount?: number
  isLiked?: boolean
  createdAt: string
  Board?: {
    id: string
    name: string
  }
}

/**
 * Servicio para manejo de perfiles
 */
export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const response = await apiClient.getClient().get<{ 
      success: boolean
      message?: string
      data: { user: Profile } | Profile 
    }>(`/profile/${userId}`)
    
    // El backend puede devolver { data: { user: Profile } } o { data: Profile }
    const responseData = response.data.data
    if (responseData && 'user' in responseData) {
      // Si viene dentro de un objeto 'user', extraerlo
      return responseData.user as Profile
    }
    return responseData as Profile || response.data
  },

  async getCurrentProfile(): Promise<Profile> {
    const response = await apiClient.getClient().get<{ 
      success: boolean
      message?: string
      data: { user: Profile } | Profile 
    }>('/profile/me')
    
    // El backend puede devolver { data: { user: Profile } } o { data: Profile }
    const responseData = response.data.data
    if (responseData && 'user' in responseData) {
      // Si viene dentro de un objeto 'user', extraerlo
      return responseData.user as Profile
    }
    return responseData as Profile || response.data
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await apiClient.getClient().put<{ 
      success: boolean
      message?: string
      data: { user: Profile } | Profile 
    }>('/profile/me', data)
    
    // El backend devuelve: { success: true, message: string, data: { user: Profile, message: string } }
    const responseData = response.data.data
    
    // El backend devuelve data como { user: Profile, message: string }
    if (responseData && typeof responseData === 'object' && 'user' in responseData) {
      // Si viene dentro de un objeto 'user', extraerlo
      const userProfile = (responseData as { user: Profile }).user
      return userProfile
    }
    
    // Fallback: si responseData es directamente Profile
    const profile = responseData as Profile
    return profile
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.getClient().post<{ data: { avatarUrl?: string; user?: Profile } }>('/profile/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const responseData = response.data.data
    return { 
      avatarUrl: responseData?.avatarUrl || responseData?.user?.avatar || '' 
    }
  },

  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<{ posts: UserPost[]; pagination: { hasNext: boolean; totalItems?: number; currentPage?: number; totalPages?: number } }> {
    const response = await apiClient.getClient().get<{ data: { posts: UserPost[]; pagination: PaginationResponse & { totalItems?: number } } }>(`/posts/user/${userId}`, {
      params: { page, limit }
    })
    
    const responseData = response.data.data || response.data
    const posts = responseData.posts || responseData || []
    const pagination = responseData.pagination || {}
    
    // Calcular hasNext si no está presente en la respuesta
    let hasNext = false
    if (pagination.hasNext !== undefined) {
      hasNext = pagination.hasNext
    } else if (pagination.currentPage !== undefined && pagination.totalPages !== undefined) {
      // Calcular basándose en currentPage y totalPages
      hasNext = pagination.currentPage < pagination.totalPages
    } else {
      // Fallback: si hay posts y la cantidad es igual al límite, probablemente hay más
      hasNext = posts.length === limit
    }
    
    return {
      posts,
      pagination: { 
        hasNext,
        // Incluir información adicional para debugging
        totalItems: pagination.totalItems,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages
      }
    }
  },

  async getSavedPosts(): Promise<SavedPost[]> {
    // Usar el endpoint específico de posts guardados que devuelve posts completos
    const response = await apiClient.getClient().get<{ data: { posts: RawPostResponse[] } }>('/posts/saved', {
      params: { page: 1, limit: 100 } // Obtener todos los posts guardados
    })
    const responseData = response.data.data || response.data
    const posts = responseData.posts || []
    
    // Transformar los posts al formato SavedPost esperado
    return posts.map((post: RawPostResponse) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      mediaUrl: post.mediaUrl || post.imageUrl || '', // El backend puede devolver imageUrl como alias
      thumbnailUrl: post.thumbnailUrl,
      type: (post.type || (post.mediaUrl?.includes('.mp4') || post.imageUrl?.includes('.mp4') ? 'video' : 'image')) as 'image' | 'video',
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      isLiked: post.isLiked || false,
      createdAt: post.createdAt,
      Board: post.Board, // Si viene información del board
    }))
  }
}

