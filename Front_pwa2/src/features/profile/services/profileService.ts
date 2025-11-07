import { apiClient } from '@/services/apiClient'
import { AxiosResponse } from 'axios'

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

interface ProfileResponse {
  success: boolean
  message?: string
  data: { user: Profile } | Profile
}

interface GetUserPostsParams {
  limit: number
  cursor?: string
}

function extractProfileFromResponse(
  response: AxiosResponse<ProfileResponse>
): Profile {
  const responseData = response.data.data
  if (
    responseData &&
    typeof responseData === 'object' &&
    'user' in responseData
  ) {
    return (responseData as { user: Profile }).user
  }
  return (responseData as Profile) || response.data
}

function extractResponseData<T>(
  response: AxiosResponse<{ data: T } | T>
): T {
  return (response.data as { data: T }).data || (response.data as T)
}

function detectPostType(post: RawPostResponse): 'image' | 'video' {
  if (post.type) {
    return post.type
  }
  const url = post.mediaUrl || post.imageUrl || ''
  return url.includes('.mp4') ? 'video' : 'image'
}

function transformRawPostToSavedPost(post: RawPostResponse): SavedPost {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    mediaUrl: post.mediaUrl || post.imageUrl || '',
    thumbnailUrl: post.thumbnailUrl,
    type: detectPostType(post),
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    isLiked: post.isLiked || false,
    createdAt: post.createdAt,
    Board: post.Board,
  }
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const response = await apiClient
      .getClient()
      .get<ProfileResponse>(`/profile/${userId}`)
    return extractProfileFromResponse(response)
  },

  async getCurrentProfile(): Promise<Profile> {
    const response = await apiClient
      .getClient()
      .get<ProfileResponse>('/profile/me')
    return extractProfileFromResponse(response)
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await apiClient
      .getClient()
      .put<ProfileResponse>('/profile/me', data)
    return extractProfileFromResponse(response)
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.getClient().post<{
      data: { avatarUrl?: string; user?: Profile }
    }>('/profile/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const responseData = extractResponseData(response)
    return {
      avatarUrl: responseData?.avatarUrl || responseData?.user?.avatar || '',
    }
  },

  async getUserPosts(
    userId: string,
    cursor: string | null = null,
    limit: number = 10
  ): Promise<{ posts: UserPost[]; nextCursor: string | null }> {
    const params: GetUserPostsParams = { limit }
    if (cursor) {
      params.cursor = cursor
    }

    const response = await apiClient.getClient().get<{
      data: { posts: UserPost[]; nextCursor: string | null }
    }>(`/posts/user/${userId}`, { params })

    const responseData = extractResponseData(response)
    return {
      posts: responseData.posts || [],
      nextCursor: responseData.nextCursor || null,
    }
  },

  async getSavedPosts(): Promise<SavedPost[]> {
    const response = await apiClient.getClient().get<{
      data: { posts: RawPostResponse[] }
    }>('/posts/saved', {
      params: { page: 1, limit: 100 },
    })

    const responseData = extractResponseData(response)
    const posts = responseData.posts || []

    return posts.map(transformRawPostToSavedPost)
  },
}