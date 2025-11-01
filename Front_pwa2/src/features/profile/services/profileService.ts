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
    const response = await apiClient.getClient().get<{ data: Profile }>(`/profile/${userId}`)
    return response.data.data || response.data
  },

  async getCurrentProfile(): Promise<Profile> {
    const response = await apiClient.getClient().get<{ data: Profile }>('/profile/me')
    return response.data.data || response.data
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
    const response = await apiClient.getClient().get<{ data: { boards: Array<{ Posts: SavedPost[] }> } }>('/boards/me/boards')
    const boards = response.data.data?.boards || []
    return boards.flatMap(board => board.Posts || [])
  },

  async followUser(userId: string): Promise<void> {
    await apiClient.getClient().post(`/profile/${userId}/follow`)
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiClient.getClient().delete(`/profile/${userId}/follow`)
  },
}

