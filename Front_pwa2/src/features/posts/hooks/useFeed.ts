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
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  /**
   * Cargar posts del feed
   */
  const loadPosts = useCallback(async (cursor: string | null = null, append: boolean = false) => {
    // Evitar múltiples cargas simultáneas
    if (loadingRef.current) return
    loadingRef.current = true

    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const result: FeedResponse = await postService.getFeed(cursor, limit)

      if (!mountedRef.current) return

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
      if (!mountedRef.current) return
      
      setError(error)
      onError?.(error)
      console.error('Error cargando feed:', err)
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

  // Carga inicial
  useEffect(() => {
    if (autoLoad) {
      loadPosts(null, false)
    }

    return () => {
      mountedRef.current = false
    }
  }, [autoLoad, loadPosts])

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

