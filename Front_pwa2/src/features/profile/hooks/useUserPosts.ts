import { useState, useEffect, useCallback, useRef } from 'react'
import { profileService, UserPost } from '../services/profileService'

interface UseUserPostsResult {
  posts: UserPost[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => Promise<void>
  reset: () => void
}

/**
 * Hook para obtener posts de un usuario con scroll infinito
 * Versión simplificada estilo Instagram - sin auto-load, sin timeouts
 */
export function useUserPosts(userId: string | undefined): UseUserPostsResult {
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Control de páginas cargando para evitar llamadas duplicadas
  const loadingPages = useRef<Set<number>>(new Set())
  const lastUserIdRef = useRef<string | undefined>(undefined)
  const hasPostsRef = useRef<boolean>(false)

  /**
   * Función interna para cargar una página específica
   */
  const fetchPage = useCallback(async (pageNum: number) => {
    if (!userId) {
      return
    }

    // Verificar que el userId no cambió durante la carga
    if (lastUserIdRef.current !== userId) {
      return
    }

    // Verificar si esta página ya está siendo cargada
    if (loadingPages.current.has(pageNum)) {
      return
    }

    // Marcar página como cargando INMEDIATAMENTE
    loadingPages.current.add(pageNum)

    try {
      // Solo mostrar loading si es la primera carga o no hay posts cargados
      const shouldShowLoading = pageNum === 1 || !hasPostsRef.current
      if (shouldShowLoading) {
        setLoading(true)
      }
      setError(null)

      const limit = 6
      const result = await profileService.getUserPosts(userId, pageNum, limit)

      // Verificar nuevamente que el userId no cambió
      if (lastUserIdRef.current !== userId) {
        return
      }

      const actuallyHasMore = result.pagination.hasNext
      setHasMore(actuallyHasMore)

      if (pageNum === 1) {
        // Primera página: reemplazar posts de forma atómica (sin flickering)
        setPosts(result.posts)
        hasPostsRef.current = result.posts.length > 0
      } else {
        // Páginas siguientes: agregar posts sin duplicados
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id))
          const newPosts = result.posts.filter(p => !existingIds.has(p.id))
          const updated = [...prev, ...newPosts]
          hasPostsRef.current = updated.length > 0
          return updated
        })
      }
    } catch (err) {
      // Solo actualizar error si el userId no cambió
      if (lastUserIdRef.current === userId) {
        setError(err instanceof Error ? err : new Error('Error al cargar posts'))
        setHasMore(false)
      }
    } finally {
      // Limpiar página del set de cargando
      loadingPages.current.delete(pageNum)
      setLoading(false)
    }
  }, [userId])

  /**
   * Cargar más posts (scroll infinito)
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !userId) {
      return
    }

    const nextPage = currentPage + 1

    // Verificar que la página siguiente no esté ya siendo cargada
    if (loadingPages.current.has(nextPage)) {
      return
    }

    setCurrentPage(nextPage)
    await fetchPage(nextPage)
  }, [currentPage, loading, hasMore, userId, fetchPage])

  /**
   * Resetear y recargar desde el inicio
   */
  const reset = useCallback(() => {
    loadingPages.current.clear()
    setPosts([])
    hasPostsRef.current = false
    setCurrentPage(1)
    setHasMore(true)
    setError(null)
    setLoading(false)

    if (userId) {
      fetchPage(1)
    }
  }, [userId, fetchPage])

  /**
   * Effect: Cargar página 1 cuando cambia el userId
   */
  useEffect(() => {
    // Si el userId cambia, preparar para nueva carga
    if (lastUserIdRef.current !== userId && lastUserIdRef.current !== undefined) {
      // Limpiar control de páginas
      loadingPages.current.clear()
      hasPostsRef.current = false
      setCurrentPage(1)
      setHasMore(true)
      setError(null)
    }

    // Cargar página 1 si tenemos userId y no está ya cargando
    if (userId && lastUserIdRef.current !== userId && !loadingPages.current.has(1)) {
      lastUserIdRef.current = userId
      loadingPages.current.add(1)
      setCurrentPage(1)
      // Limpiar posts ANTES de iniciar la carga (pero solo si hay posts)
      if (hasPostsRef.current) {
        setPosts([])
        hasPostsRef.current = false
      }
      fetchPage(1)
    }

    // Cleanup: limpiar cuando el componente se desmonte
    return () => {
      loadingPages.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  }
}
