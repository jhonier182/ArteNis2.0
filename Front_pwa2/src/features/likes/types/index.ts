/**
 * Tipos e interfaces para el feature de likes
 */

export interface LikeInfo {
  likesCount: number
  isLiked: boolean
  postId: string
}

export interface ToggleLikeResponse {
  liked: boolean
  likesCount: number
  message?: string
}

