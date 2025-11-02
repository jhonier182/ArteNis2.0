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
  userType?: 'user' | 'artist'
  fullName?: string
  city?: string
}

export interface UpdateProfileData {
  username?: string
  bio?: string
  avatar?: string
  userType?: 'user' | 'artist'
  fullName?: string
  city?: string
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
    const response = await apiClient.getClient().put<{ data: Profile }>('/profile/me', data)
    return response.data.data || response.data
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

  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<{ posts: UserPost[]; pagination: { hasNext: boolean } }> {
    const response = await apiClient.getClient().get<{ data: { posts: UserPost[]; pagination: any } }>(`/posts/user/${userId}`, {
      params: { page, limit }
    })
    const responseData = response.data.data || response.data
    return {
      posts: responseData.posts || responseData || [],
      pagination: responseData.pagination || { hasNext: (responseData.posts || []).length === limit }
    }
  },

  async getSavedPosts(): Promise<SavedPost[]> {
    // Usar el endpoint específico de posts guardados que devuelve posts completos
    const response = await apiClient.getClient().get<{ data: { posts: any[] } }>('/posts/saved', {
      params: { page: 1, limit: 100 } // Obtener todos los posts guardados
    })
    const responseData = response.data.data || response.data
    const posts = responseData.posts || []
    
    // Transformar los posts al formato SavedPost esperado
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      mediaUrl: post.mediaUrl || post.imageUrl, // El backend puede devolver imageUrl como alias
      thumbnailUrl: post.thumbnailUrl,
      type: post.type || (post.mediaUrl?.includes('.mp4') || post.imageUrl?.includes('.mp4') ? 'video' : 'image'),
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      isLiked: post.isLiked || false,
      createdAt: post.createdAt,
      Board: post.Board, // Si viene información del board
    }))
  },

  async followUser(userId: string): Promise<void> {
    await apiClient.getClient().post(`/profile/${userId}/follow`)
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiClient.getClient().delete(`/profile/${userId}/follow`)
  },
}

