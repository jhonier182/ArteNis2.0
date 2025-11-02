import { useState, useCallback, useEffect, useRef } from 'react'
import { searchService } from '../services/searchService'
import { SearchPost } from '../types'

interface UseSearchPostsOptions {
  /** Si debe cargar posts al montar */
  autoLoad?: boolean
  /** Límite de posts a cargar */
  limit?: number
  /** Callback cuando se cargan posts */
  onPostsLoaded?: (posts: SearchPost[]) => void
  /** Callback cuando hay un error */
  onError?: (error: Error) => void
}

interface UseSearchPostsResult {
  /** Posts cargados */
  posts: SearchPost[]
  /** Si está cargando */
  isLoading: boolean
  /** Error si ocurrió alguno */
  error: Error | null
  /** Cargar posts públicos */
  loadPosts: () => Promise<void>
  /** Filtrar posts excluyendo usuarios seguidos y propios */
  loadFilteredPosts: (followingIds: string[], userId?: string) => Promise<SearchPost[]>
  /** Refrescar posts */
  refreshPosts: () => Promise<void>
}

// Caché global para evitar llamadas duplicadas
let globalPostsCache: SearchPost[] | null = null
let globalCacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 60 segundos
let isLoadingGlobally = false

/**
 * Hook para manejar posts de búsqueda con caché y filtrado
 * 
 * @example
 * ```tsx
 * const { posts, isLoading, loadFilteredPosts } = useSearchPosts({
 *   autoLoad: true,
 *   limit: 50
 * })
 * ```
 */
export function useSearchPosts(
  options: UseSearchPostsOptions = {}
): UseSearchPostsResult {
  const {
    autoLoad = false,
    limit = 50,
    onPostsLoaded,
    onError
  } = options

  const [posts, setPosts] = useState<SearchPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  /**
   * Cargar posts públicos para descubrir
   */
  const loadPosts = useCallback(async () => {
    const now = Date.now()

    // Verificar caché
    if (globalPostsCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
      if (mountedRef.current) {
        setPosts(globalPostsCache)
        setIsLoading(false)
      }
      return
    }

    // Evitar múltiples llamadas simultáneas
    if (isLoadingGlobally) {
      let attempts = 0
      while (isLoadingGlobally && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }

      if (globalPostsCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
        if (mountedRef.current) {
          setPosts(globalPostsCache)
          setIsLoading(false)
        }
        return
      }
    }

    try {
      isLoadingGlobally = true
      if (mountedRef.current) {
        setIsLoading(true)
        setError(null)
      }

      const loadedPosts = await searchService.getDiscoverPosts(limit)

      // Normalizar posts (asegurar estructura consistente)
      const normalizedPosts = loadedPosts.map((post: SearchPost & { author?: SearchPost['author']; User?: SearchPost['User'] }) => ({
        ...post,
        User: post.author || post.User,
        type: post.type || 'image'
      }))

      // Actualizar caché
      globalPostsCache = normalizedPosts
      globalCacheTimestamp = now

      if (mountedRef.current) {
        setPosts(normalizedPosts)
        setIsLoading(false)
        onPostsLoaded?.(normalizedPosts)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar posts')
      if (mountedRef.current) {
        setError(error)
        setIsLoading(false)
      }
      onError?.(error)
      console.error('Error cargando posts:', err)
    } finally {
      isLoadingGlobally = false
    }
  }, [limit, onPostsLoaded, onError])

  /**
   * Filtrar posts excluyendo usuarios seguidos y propios
   */
  const loadFilteredPosts = useCallback(
    async (followingIds: string[], userId?: string): Promise<SearchPost[]> => {
      try {
        // Cargar posts si no están en caché
        if (!globalPostsCache) {
          await loadPosts()
        }

        const allPosts = globalPostsCache || posts

        if (!allPosts.length) return []

        // Filtrar posts
        const filteredPosts = allPosts.filter((post) => {
          const postUserId = post.User?.id || post.author?.id
          const postUserIdStr = String(postUserId)
          const userIdStr = String(userId)

          // Excluir posts propios
          if (userId && postUserIdStr === userIdStr) {
            return false
          }

          // Excluir posts de usuarios seguidos
          const isFollowing = followingIds.some(
            (followingId) => String(followingId) === postUserIdStr
          )
          if (isFollowing) {
            return false
          }

          return true
        })

        // Agrupar por usuario y tomar solo las 2 más recientes de cada uno
        const userPostsMap = new Map<string, SearchPost[]>()
        filteredPosts.forEach((post) => {
          const userId = post.User?.id || post.author?.id
          if (userId) {
            if (!userPostsMap.has(userId)) {
              userPostsMap.set(userId, [])
            }
            userPostsMap.get(userId)!.push(post)
          }
        })

        // Tomar solo las 2 más recientes de cada usuario
        const finalFilteredPosts: SearchPost[] = []
        userPostsMap.forEach((userPosts) => {
          const sortedPosts = userPosts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          finalFilteredPosts.push(...sortedPosts.slice(0, 2))
        })

        // Ordenar por fecha (más recientes primero)
        finalFilteredPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        const finalPosts = finalFilteredPosts.slice(0, 20) // Limitar a 20 posts

        return finalPosts
      } catch (err) {
        console.error('Error filtrando posts:', err)
        return []
      }
    },
    [loadPosts, posts]
  )

  /**
   * Refrescar posts (forzar recarga)
   */
  const refreshPosts = useCallback(async () => {
    // Limpiar caché y cargar de nuevo
    globalPostsCache = null
    globalCacheTimestamp = 0
    await loadPosts()
  }, [loadPosts])

  // Auto-load si está habilitado
  useEffect(() => {
    if (autoLoad) {
      loadPosts()
    }

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad])

  return {
    posts,
    isLoading,
    error,
    loadPosts,
    loadFilteredPosts,
    refreshPosts
  }
}

/**
 * Función utilitaria para limpiar el caché
 */
export const clearSearchPostsCache = () => {
  globalPostsCache = null
  globalCacheTimestamp = 0
  isLoadingGlobally = false
  console.log('🧹 Caché de posts de búsqueda limpiado')
}

