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
}

export interface UpdateProfileData {
  username?: string
  bio?: string
  avatar?: string
}

/**
 * Servicio para manejo de perfiles
 */
export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const response = await apiClient.getClient().get<Profile>(`/profile/${userId}`)
    return response.data
  },

  async getCurrentProfile(): Promise<Profile> {
    const response = await apiClient.getClient().get<Profile>('/profile/me')
    return response.data
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await apiClient.getClient().put<Profile>('/profile/me', data)
    return response.data
  },

  async followUser(userId: string): Promise<void> {
    await apiClient.getClient().post(`/profile/${userId}/follow`)
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiClient.getClient().delete(`/profile/${userId}/follow`)
  },
}

