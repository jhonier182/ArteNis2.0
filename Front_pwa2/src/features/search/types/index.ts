/**
 * Tipos e interfaces para el feature de búsqueda
 */

export type SearchType = 'all' | 'artists' | 'posts' | 'boards'

export interface SearchFilters {
  city?: string
  type?: SearchType
  page?: number
  limit?: number
}

export interface SearchUser {
  id: string
  username: string
  fullName?: string
  avatar?: string
  userType: 'artist' | 'user'
  city?: string
  country?: string
  isVerified?: boolean
  rating?: string
  reviewsCount?: number
}

export interface SearchPost {
  id: string
  title?: string
  description?: string
  mediaUrl?: string
  thumbnailUrl?: string
  type: 'image' | 'video' | 'reel'
  likesCount: number
  commentsCount: number
  isLiked?: boolean
  createdAt: string
  author?: {
    id: string
    username: string
    fullName?: string
    avatar?: string
    userType: 'artist' | 'user'
  }
  User?: {
    id: string
    username: string
    fullName?: string
    avatar?: string
    userType: 'artist' | 'user'
  }
}

export interface SearchBoard {
  id: string
  name: string
  description?: string
  coverImage?: string
  isPublic: boolean
  postsCount?: number
  owner?: {
    id: string
    username: string
    avatar?: string
  }
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchResponse {
  artists: SearchUser[]
  posts: SearchPost[]
  boards: SearchBoard[]
  pagination: PaginationInfo
}

export interface SearchSuggestions {
  suggestions: string[]
}

