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
  refresh: () => Promise<void>
  isInitialLoading: boolean
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
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef<boolean>(false)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled || isLoadingRef.current) return

    try {
      isLoadingRef.current = true
      if (isInitialLoad) {
        setIsInitialLoading(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const result = await fetchFunction(page, 10) // 10 items por página
      
      if (isInitialLoad) {
        setData(result.data)
        setIsInitialLoad(false)
        setIsInitialLoading(false)
      } else {
        setData(prev => [...prev, ...result.data])
        setLoading(false)
      }
      
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (err: any) {
      setError(err.message || 'Error al cargar más datos')
      console.error('Error en scroll infinito:', err)
      setIsInitialLoading(false)
      setLoading(false)
    } finally {
      isLoadingRef.current = false
    }
  }, [fetchFunction, page, hasMore, enabled, isInitialLoad, loading]) // Agregado loading para evitar renders excesivos

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
    setIsInitialLoad(true)
    setIsInitialLoading(false)
    isLoadingRef.current = false
  }, [])

  const appendData = useCallback((newData: T[]) => {
    setData(prev => [...prev, ...newData])
  }, [])

  const refresh = useCallback(async () => {
    setPage(1)
    setHasMore(true)
    setError(null)
    setIsInitialLoad(true)
    setIsInitialLoading(false)
    isLoadingRef.current = false
    await loadMore()
  }, [loadMore])

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

  // Cargar datos iniciales (OPTIMIZADO)
  useEffect(() => {
    if (enabled && isInitialLoad && !loading && !isLoadingRef.current) {
      console.log('🔄 Cargando datos iniciales...')
      loadMore()
    }
  }, [enabled, isInitialLoad, loading]) // Removido loadMore de las dependencias

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    setData,
    appendData,
    refresh,
    isInitialLoading
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
      
      // Normalizar la estructura de datos (el backend devuelve 'author' en lugar de 'User')
      const normalizedPosts = posts.map((post: any) => ({
        ...post,
        User: post.author || post.User
      }))
      
      const hasMore = normalizedPosts.length === limit

      return {
        data: normalizedPosts as T[],
        hasMore
      }
    } catch (error) {
      throw new Error('Error al cargar publicaciones')
    }
  }, [endpoint, JSON.stringify(params)]) // Usar JSON.stringify para comparar objetos

  return useInfiniteScroll<T>(fetchPosts, options)
}
