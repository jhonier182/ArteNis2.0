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
 */
export function useUserPosts(userId: string | undefined): UseUserPostsResult {
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const isLoadingRef = useRef(false) // Ref para evitar dependencias circulares
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([]) // Refs para guardar timeouts y poder limpiarlos

  const fetchPosts = useCallback(async (pageNum: number, autoLoadNext = false) => {
    if (!userId || isLoadingRef.current) {
      console.log(`🚫 Fetch cancelado: userId=${!!userId}, isLoading=${isLoadingRef.current}`)
      return
    }

    try {
      isLoadingRef.current = true
      setLoading(true)
      setError(null)
      
      // Carga incremental fluida: 6 posts por página para efecto "flux"
      const limit = 6
      const result = await profileService.getUserPosts(userId, pageNum, limit)
      
      const paginationInfo = result.pagination as { totalItems?: number }
      const totalItems = paginationInfo?.totalItems
      
      console.log(`📄 Página ${pageNum}: ${result.posts.length} posts | hasNext: ${result.pagination.hasNext} | Total backend: ${totalItems || 'N/A'}`)
      
      // ACTUALIZAR hasMore basado en la respuesta real
      const actuallyHasMore = result.pagination.hasNext
      setHasMore(actuallyHasMore)
      
      if (pageNum === 1) {
        // Primera carga: mostrar inmediatamente
        setPosts(result.posts)
        console.log(`✅ Posts iniciales cargados: ${result.posts.length}`)
        // Iniciar auto-carga desde la primera página si hay más
        if (actuallyHasMore) {
          const timeoutId = setTimeout(() => {
            console.log(`🔄 [FLUX] Iniciando auto-carga desde página 1...`)
            setPage(2)
            fetchPosts(2, true).catch(err => {
              console.error('Error iniciando auto-carga:', err)
            })
          }, 800)
          timeoutRefsRef.current.push(timeoutId)
          // No continuar con la lógica de auto-carga abajo para página 1
          return
        }
      } else {
        // Páginas siguientes: agregar progresivamente
        setPosts(prev => {
          const newPosts = [...prev, ...result.posts]
          console.log(`✅ Total acumulado: ${newPosts.length} posts${totalItems ? ` / ${totalItems} total` : ''}`)
          return newPosts
        })
      }
      
      // AUTO-CARGA CONTINUA tipo "flux": seguir cargando mientras haya más
      // Continuar el flujo automático para páginas siguientes
      if (autoLoadNext && actuallyHasMore) {
        // Usar delay progresivo: más rápido al inicio, más lento después
        const delay = pageNum === 1 ? 600 : Math.min(800 + (pageNum - 2) * 100, 1500)
        
        const timeoutId = setTimeout(() => {
          // Verificar estado actual en lugar de valores capturados
          setHasMore(currentHasMore => {
            if (currentHasMore && !isLoadingRef.current && userId) {
              const nextPage = pageNum + 1
              console.log(`🔄 [FLUX] Auto-cargando página ${nextPage}... (delay: ${delay}ms)`)
              setPage(nextPage)
              
              // Continuar el flujo automáticamente
              fetchPosts(nextPage, true).catch(err => {
                console.error('Error en auto-carga:', err)
              })
              
              return currentHasMore // Mantener el estado
            } else {
              console.log(`🏁 [FLUX] Detenido: hasMore=${currentHasMore}, isLoading=${isLoadingRef.current}`)
              return false
            }
          })
        }, delay)
        
        timeoutRefsRef.current.push(timeoutId)
      } else if (!actuallyHasMore) {
        console.log(`🏁 [FLUX] Fin de carga: No hay más posts${totalItems ? ` (Total: ${totalItems})` : ''}`)
      }
      
    } catch (err) {
      console.error('❌ Error al cargar posts:', err)
      setError(err instanceof Error ? err : new Error('Error al cargar posts'))
      setHasMore(false)
    } finally {
      setLoading(false)
      // No resetear isLoadingRef inmediatamente para permitir que el timeout verifique
      setTimeout(() => {
        isLoadingRef.current = false
      }, 200)
    }
  }, [userId])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      console.log(`🚫 No se puede cargar más: loading=${loading}, hasMore=${hasMore}`)
      return
    }
    const nextPage = page + 1
    console.log(`⬇️ Cargando manualmente página ${nextPage}...`)
    setPage(nextPage)
    await fetchPosts(nextPage)
  }, [page, loading, hasMore, fetchPosts])

  const reset = useCallback(() => {
    // Limpiar todos los timeouts pendientes
    timeoutRefsRef.current.forEach(timeoutId => clearTimeout(timeoutId))
    timeoutRefsRef.current = []
    isLoadingRef.current = false
    
    setPosts([])
    setPage(1)
    setHasMore(true)
    setError(null)
    if (userId) {
      fetchPosts(1)
    }
  }, [userId, fetchPosts])

  // Optimizado: usar fetchPosts directamente en lugar de reset para evitar dependencias circulares
  useEffect(() => {
    if (userId) {
      // Limpiar timeouts anteriores al cambiar de usuario
      timeoutRefsRef.current.forEach(timeoutId => clearTimeout(timeoutId))
      timeoutRefsRef.current = []
      isLoadingRef.current = false
      
      setPosts([])
      setPage(1)
      setHasMore(true)
      setError(null)
      fetchPosts(1)
    }
    
    // Cleanup: limpiar timeouts cuando el componente se desmonte o cambie el userId
    return () => {
      timeoutRefsRef.current.forEach(timeoutId => clearTimeout(timeoutId))
      timeoutRefsRef.current = []
      isLoadingRef.current = false
    }
  }, [userId, fetchPosts])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  }
}

