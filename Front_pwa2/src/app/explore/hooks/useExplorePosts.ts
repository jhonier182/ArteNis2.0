import { useState, useCallback, useEffect, useRef } from 'react'
import { apiClient } from '@/services/apiClient'
import { SearchPost } from '@/features/search/types'

interface UseExplorePostsOptions {
  /** Si debe cargar posts al montar */
  autoLoad?: boolean
  /** Límite de posts por página */
  limit?: number
  /** IDs de usuarios seguidos para excluir */
  followingIds?: string[]
  /** ID del usuario actual para excluir sus propios posts */
  userId?: string
}

interface UseExplorePostsResult {
  /** Posts cargados */
  posts: SearchPost[]
  /** Si está cargando */
  isLoading: boolean
  /** Si hay más posts para cargar */
  hasMore: boolean
  /** Error si ocurrió alguno */
  error: Error | null
  /** Cargar más posts (scroll infinito) */
  loadMore: () => Promise<void>
  /** Refrescar posts (recargar desde el inicio) */
  refresh: () => Promise<void>
}

/**
 * Hook para cargar posts públicos excluyendo usuarios seguidos
 * 
 * @example
 * ```tsx
 * const { posts, isLoading, loadMore, hasMore } = useExplorePosts({
 *   autoLoad: true,
 *   followingIds: followingUsers.map(u => u.id),
 *   userId: user?.id
 * })
 * ```
 */
export function useExplorePosts(
  options: UseExplorePostsOptions = {}
): UseExplorePostsResult {
  const {
    autoLoad = true,
    limit = 20,
    followingIds = [],
    userId
  } = options

  const [posts, setPosts] = useState<SearchPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const isLoadingRef = useRef(false)

  /**
   * Cargar posts públicos desde el backend
   */
  const loadPosts = useCallback(
    async (cursor: string | null = null, append = false) => {
      if (isLoadingRef.current) return

      try {
        isLoadingRef.current = true
        if (mountedRef.current) {
          setIsLoading(true)
          setError(null)
        }

        const params = new URLSearchParams({
          limit: limit.toString(),
          ...(cursor && { cursor })
        })

        const response = await apiClient.getClient().get<{
          success: boolean
          message?: string
          data: {
            posts: SearchPost[]
            nextCursor: string | null
          }
        }>(`/posts/public?${params}`)

        const responseData = response.data.data || response.data
        const loadedPosts = responseData.posts || []
        const newNextCursor = responseData.nextCursor || null

        // Normalizar posts (asegurar estructura consistente)
        const normalizedPosts = loadedPosts.map(
          (post: SearchPost & { author?: SearchPost['author']; User?: SearchPost['User'] }) => ({
            ...post,
            User: post.author || post.User,
            type: post.type || 'image'
          })
        )

        // Filtrar posts de usuarios seguidos y propios
        const filteredPosts = normalizedPosts.filter((post) => {
          const postUserId = post.User?.id || post.author?.id
          if (!postUserId) return false

          const postUserIdStr = String(postUserId)
          const userIdStr = String(userId)

          // Excluir posts propios
          if (userId && postUserIdStr === userIdStr) {
            return false
          }

          // Excluir posts de usuarios seguidos
          if (followingIds.length > 0) {
            const isFollowing = followingIds.some(
              (followingId) => String(followingId) === postUserIdStr
            )
            if (isFollowing) {
              return false
            }
          }

          return true
        })

        if (mountedRef.current) {
          if (append) {
            setPosts((prev) => [...prev, ...filteredPosts])
          } else {
            setPosts(filteredPosts)
          }
          setNextCursor(newNextCursor)
          setHasMore(!!newNextCursor)
          setIsLoading(false)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error al cargar posts')
        if (mountedRef.current) {
          setError(error)
          setIsLoading(false)
        }
        console.error('Error cargando posts de explorar:', err)
      } finally {
        isLoadingRef.current = false
      }
    },
    [limit, followingIds, userId]
  )

  /**
   * Cargar más posts (scroll infinito)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !nextCursor) return
    await loadPosts(nextCursor, true)
  }, [hasMore, isLoading, nextCursor, loadPosts])

  /**
   * Refrescar posts (recargar desde el inicio)
   */
  const refresh = useCallback(async () => {
    setNextCursor(null)
    setHasMore(true)
    await loadPosts(null, false)
  }, [loadPosts])

  // Ref para evitar múltiples cargas iniciales
  const hasLoadedRef = useRef(false)
  const lastFollowingIdsRef = useRef<string>('')
  const lastUserIdRef = useRef<string | undefined>(undefined)

  // Auto-load si está habilitado (solo una vez al montar o cuando cambia autoLoad)
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadPosts(null, false)
    }

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad])

  // Recargar cuando cambian los usuarios seguidos o el userId (solo si ya se cargó inicialmente)
  useEffect(() => {
    const followingIdsStr = followingIds.join(',')
    const hasFollowingChanged = lastFollowingIdsRef.current !== followingIdsStr
    const hasUserIdChanged = lastUserIdRef.current !== userId

    if (autoLoad && hasLoadedRef.current && (hasFollowingChanged || hasUserIdChanged)) {
      lastFollowingIdsRef.current = followingIdsStr
      lastUserIdRef.current = userId
      refresh()
    } else if (!hasLoadedRef.current) {
      // Si aún no se ha cargado, guardar los valores para la primera carga
      lastFollowingIdsRef.current = followingIdsStr
      lastUserIdRef.current = userId
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followingIds, userId, autoLoad])

  return {
    posts,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh
  }
}

