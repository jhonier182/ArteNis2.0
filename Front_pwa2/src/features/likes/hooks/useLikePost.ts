import { useState, useCallback, useEffect } from 'react'
import { likeService } from '../services/likeService'
import { ToggleLikeResponse } from '../types'

interface UseLikePostOptions {
  /** Si debe cargar la información inicial del post */
  autoFetch?: boolean
  /** Callback cuando el like cambia exitosamente */
  onToggle?: (result: ToggleLikeResponse) => void
  /** Callback cuando hay un error */
  onError?: (error: Error) => void
}

interface UseLikePostResult {
  /** Si el post está marcado como liked */
  isLiked: boolean
  /** Cantidad total de likes */
  likesCount: number
  /** Si está cargando */
  isLoading: boolean
  /** Error si ocurrió alguno */
  error: Error | null
  /** Función para toggle del like */
  toggleLike: () => Promise<void>
  /** Función para refrescar la información de likes */
  refresh: () => Promise<void>
}

/**
 * Hook para manejar likes de posts con actualización optimista
 * 
 * @param postId ID del post
 * @param initialLiked Estado inicial de si está liked
 * @param initialLikesCount Contador inicial de likes
 * @param options Opciones adicionales
 * 
 * @example
 * ```tsx
 * const { isLiked, likesCount, toggleLike, isLoading } = useLikePost(
 *   post.id,
 *   post.isLiked,
 *   post.likesCount
 * )
 * ```
 */
export function useLikePost(
  postId: string,
  initialLiked: boolean = false,
  initialLikesCount: number = 0,
  options: UseLikePostOptions = {}
): UseLikePostResult {
  const { autoFetch = false, onToggle, onError } = options

  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Refrescar información de likes desde el servidor
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const info = await likeService.getLikeInfo(postId)
      setIsLiked(info.isLiked)
      setLikesCount(info.likesCount)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al obtener información de likes')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [postId, onError])

  /**
   * Toggle del like con actualización optimista
   */
  const toggleLike = useCallback(async () => {
    // Guardar estado anterior para rollback si falla
    const previousLiked = isLiked
    const previousLikesCount = likesCount

    // Actualización optimista - actualizar UI inmediatamente
    const optimisticLiked = !previousLiked
    const optimisticLikesCount = optimisticLiked
      ? previousLikesCount + 1
      : Math.max(0, previousLikesCount - 1)

    // Actualizar estado inmediatamente
    setIsLiked(optimisticLiked)
    setLikesCount(optimisticLikesCount)
    setIsLoading(true)
    setError(null)

    try {
      // Hacer la petición al servidor
      const result = await likeService.toggleLike(postId)

      // Actualizar con la respuesta real del servidor
      setIsLiked(result.liked)
      setLikesCount(result.likesCount)

      // Llamar callback si existe
      onToggle?.(result)
    } catch (err) {
      // Revertir a los valores anteriores si falla
      setIsLiked(previousLiked)
      setLikesCount(previousLikesCount)

      const error = err instanceof Error ? err : new Error('Error al actualizar el like')
      setError(error)
      onError?.(error)
      console.error('Error al hacer toggle del like:', err)
    } finally {
      setIsLoading(false)
    }
  }, [postId, isLiked, likesCount, onToggle, onError])

  // Auto-fetch si está habilitado
  useEffect(() => {
    if (autoFetch && postId) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, postId])

  // Sincronizar con valores iniciales cuando cambian
  useEffect(() => {
    setIsLiked(initialLiked)
    setLikesCount(initialLikesCount)
  }, [initialLiked, initialLikesCount])

  return {
    isLiked,
    likesCount,
    isLoading,
    error,
    toggleLike,
    refresh
  }
}

