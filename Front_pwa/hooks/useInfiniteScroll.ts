import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/utils/apiClient'

interface UseInfiniteScrollOptions {
  threshold?: number // Distancia desde el final para cargar más (en píxeles)
  rootMargin?: string // Margen del root para el intersection observer
  enabled?: boolean // Si el scroll infinito está habilitado
}

interface UseInfiniteScrollReturn<T> {
  data: T[]
  loading: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => Promise<void>
  reset: () => void
  setData: (data: T[]) => void
  appendData: (newData: T[]) => void
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const {
    threshold = 100,
    rootMargin = '0px',
    enabled = true
  } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchFunction(page, 10) // 10 items por página
      
      if (isInitialLoad) {
        setData(result.data)
        setIsInitialLoad(false)
      } else {
        setData(prev => [...prev, ...result.data])
      }
      
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (err: any) {
      setError(err.message || 'Error al cargar más datos')
      console.error('Error en scroll infinito:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, page, loading, hasMore, enabled, isInitialLoad])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
    setIsInitialLoad(true)
  }, [])

  const appendData = useCallback((newData: T[]) => {
    setData(prev => [...prev, ...newData])
  }, [])

  // Configurar intersection observer
  useEffect(() => {
    if (!enabled || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loading && hasMore) {
          loadMore()
        }
      },
      {
        rootMargin,
        threshold: 0.1
      }
    )

    observerRef.current = observer

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [enabled, hasMore, loading, loadMore, rootMargin])

  // Cargar datos iniciales
  useEffect(() => {
    if (enabled && isInitialLoad) {
      loadMore()
    }
  }, [enabled, isInitialLoad, loadMore])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    setData,
    appendData
  }
}

// Hook específico para posts
export function useInfinitePosts<T = any>(
  endpoint: string,
  params: Record<string, any> = {},
  options: UseInfiniteScrollOptions = {}
) {
  const fetchPosts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await apiClient.get(endpoint, {
        params: {
          page,
          limit,
          ...params
        }
      })

      const posts = response.data?.data?.posts || response.data?.data || []
      const hasMore = posts.length === limit

      return {
        data: posts as T[],
        hasMore
      }
    } catch (error) {
      throw new Error('Error al cargar publicaciones')
    }
  }, [endpoint, params])

  return useInfiniteScroll<T>(fetchPosts, options)
}
