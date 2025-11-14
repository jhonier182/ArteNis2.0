import { useState, useEffect, useCallback, useRef } from 'react'
import { postService, Post, FeedResponse } from '../services/postService'

interface UseFeedOptions {
  limit?: number
  autoLoad?: boolean
  onError?: (error: Error) => void
}

interface UseFeedResult {
  posts: Post[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  isLoadingMore: boolean
}

/**
 * Hook para manejar el feed de publicaciones con paginación por cursor
 * 
 * @example
 * ```tsx
 * const { posts, loading, loadMore, hasMore } = useFeed({ limit: 20 })
 * 
 * return (
 *   <div>
 *     {posts.map(post => <PostCard key={post.id} post={post} />)}
 *     {hasMore && <button onClick={loadMore}>Ver más</button>}
 *   </div>
 * )
 * ```
 */
export function useFeed(options: UseFeedOptions = {}): UseFeedResult {
  const { limit = 20, autoLoad = true, onError } = options

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(autoLoad) // Solo loading inicial si autoLoad es true
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const mountedRef = useRef(true)
  const loadingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Cargar posts del feed
   */
  const loadPosts = useCallback(async (cursor: string | null = null, append: boolean = false) => {
    // Evitar múltiples cargas simultáneas
    if (loadingRef.current) {
      console.log('[useFeed] Ya hay una carga en progreso, ignorando...')
      return
    }
    loadingRef.current = true

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Timeout de seguridad (30 segundos)
    timeoutRef.current = setTimeout(() => {
      if (loadingRef.current) {
        console.warn('[useFeed] Timeout en carga de feed')
        loadingRef.current = false
        if (mountedRef.current) {
          setLoading(false)
          setIsLoadingMore(false)
          setError(new Error('La carga está tardando demasiado. Por favor, intenta de nuevo.'))
        }
      }
    }, 30000)

    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log('[useFeed] Iniciando carga de feed', { cursor, append, limit })
      const result: FeedResponse = await postService.getFeed(cursor, limit)
      console.log('[useFeed] Feed cargado exitosamente', { postsCount: result.posts.length, hasMore: !!result.nextCursor })

      if (!mountedRef.current) {
        console.log('[useFeed] Componente desmontado, ignorando resultado')
        return
      }

      // Limpiar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (append) {
        // Agregar nuevos posts sin duplicados
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id))
          const newPosts = result.posts.filter(p => !existingIds.has(p.id))
          return [...prev, ...newPosts]
        })
      } else {
        // Reemplazar posts
        setPosts(result.posts)
      }

      setNextCursor(result.nextCursor)
      setHasMore(result.nextCursor !== null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar el feed')
      console.error('[useFeed] Error cargando feed:', err)
      
      if (!mountedRef.current) return
      
      // Limpiar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      setError(error)
      onError?.(error)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setIsLoadingMore(false)
        loadingRef.current = false
      }
    }
  }, [limit, onError])

  /**
   * Cargar más posts (paginación)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || loading || !nextCursor) return
    await loadPosts(nextCursor, true)
  }, [hasMore, isLoadingMore, loading, nextCursor, loadPosts])

  /**
   * Refrescar el feed (recargar desde el inicio)
   */
  const refresh = useCallback(async () => {
    setNextCursor(null)
    setHasMore(true)
    await loadPosts(null, false)
  }, [loadPosts])

  // Carga inicial - mejorado para manejar cambios en autoLoad
  useEffect(() => {
    mountedRef.current = true
    
    if (autoLoad) {
      console.log('[useFeed] autoLoad activado, iniciando carga...')
      // Pequeño delay para asegurar que el componente está montado
      const timer = setTimeout(() => {
        if (mountedRef.current && !loadingRef.current) {
          loadPosts(null, false).catch(err => {
            console.error('[useFeed] Error en carga inicial:', err)
          })
        }
      }, 100)
      
      return () => {
        clearTimeout(timer)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        mountedRef.current = false
      }
    } else {
      setLoading(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]) // Solo dependencia de autoLoad, loadPosts es estable

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isLoadingMore
  }
}

