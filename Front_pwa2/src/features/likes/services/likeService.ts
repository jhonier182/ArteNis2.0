import { apiClient } from '@/services/apiClient'
import { LikeInfo, ToggleLikeResponse } from '../types'

/**
 * Servicio para manejo de likes
 */
export const likeService = {
  /**
   * Toggle like en un post (agregar o quitar)
   * @param postId ID del post
   * @returns Respuesta con el nuevo estado de like y contador
   */
  async toggleLike(postId: string): Promise<ToggleLikeResponse> {
    const response = await apiClient.getClient().post<{
      success: boolean
      message?: string
      data: {
        liked: boolean
        likesCount: number
        message?: string
      }
    }>(`/posts/${postId}/like`)

    const responseData = response.data.data || response.data

    return {
      liked: responseData.liked ?? true,
      likesCount: responseData.likesCount ?? 0,
      message: responseData.message
    }
  },

  /**
   * Obtener información de likes de un post
   * @param postId ID del post
   * @returns Información de likes incluyendo contador y si el usuario actual dio like
   */
  async getLikeInfo(postId: string): Promise<LikeInfo> {
    const response = await apiClient.getClient().get<{
      success: boolean
      data: LikeInfo
    }>(`/posts/${postId}/likes`)

    const responseData = response.data.data || response.data

    return {
      likesCount: responseData.likesCount ?? 0,
      isLiked: responseData.isLiked ?? false,
      postId: responseData.postId ?? postId
    }
  },

  /**
   * Quitar like de un post (método alternativo para compatibilidad)
   * @param postId ID del post
   */
  async unlikePost(postId: string): Promise<void> {
    await apiClient.getClient().delete(`/posts/${postId}/like`)
  }
}

