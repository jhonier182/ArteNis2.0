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
 * Hook para obtener posts de un usuario con scroll infinito usando cursor-based pagination
 * Versión optimizada estilo Instagram con paginación por cursor
 * Optimizado para evitar re-renders múltiples
 */
export function useUserPosts(userId: string | undefined): UseUserPostsResult {
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const hasMore = nextCursor !== null

  // Control para evitar llamadas duplicadas y re-renders
  const isFetchingRef = useRef<boolean>(false)
  const lastUserIdRef = useRef<string | undefined>(undefined)
  const hasPostsRef = useRef<boolean>(false)
  const hasLoadedRef = useRef<boolean>(false)
  const fetchPostsRef = useRef<((cursor: string | null) => Promise<void>) | null>(null)
  // Ref para trackear el userId de los posts actuales mostrados
  const postsUserIdRef = useRef<string | undefined>(undefined)

  /**
   * Función interna para cargar posts con cursor
   * Almacenada en ref para evitar recreaciones innecesarias
   */
  const fetchPosts = useCallback(async (cursor: string | null = null) => {
    const currentUserId = userId
    console.log(`[useUserPosts] 🔵 fetchPosts llamado - cursor: ${cursor}, userId: ${currentUserId}`)
    
    if (!currentUserId) {
      console.log('[useUserPosts] ⚠️ fetchPosts: No hay userId, abortando')
      return
    }

    // Verificar que el userId no cambió durante la carga
    if (lastUserIdRef.current !== currentUserId) {
      console.log(`[useUserPosts] ⚠️ fetchPosts: userId cambió (${lastUserIdRef.current} -> ${currentUserId}), abortando`)
      return
    }

    // Verificar si ya está cargando (ya debería estar marcado desde el useEffect, pero verificamos por seguridad)
    if (isFetchingRef.current && cursor === null) {
      console.log('[useUserPosts] ⚠️ fetchPosts: Ya está cargando (cursor=null), ignorando')
      return
    }

    // Marcar como cargando INMEDIATAMENTE (si no está ya marcado)
    if (!isFetchingRef.current) {
      isFetchingRef.current = true
      console.log(`[useUserPosts] ✅ fetchPosts: Marcado como cargando - cursor: ${cursor}, posts actuales: ${hasPostsRef.current ? 'SÍ' : 'NO'}`)
    } else {
      console.log(`[useUserPosts] ✅ fetchPosts: Ya estaba marcado como cargando - cursor: ${cursor}`)
    }

    try {
      // Solo mostrar loading si es la primera carga o no hay posts cargados
      const shouldShowLoading = cursor === null || !hasPostsRef.current
      if (shouldShowLoading) {
        console.log('[useUserPosts] 🔄 setLoading(true) - mostrando spinner')
      setLoading(true)
      } else {
        console.log('[useUserPosts] ⏭️ Omitiendo setLoading(true) - carga silenciosa')
      }
      setError(null)
      
      const limit = 6
      console.log(`[useUserPosts] 📡 Llamando API - userId: ${currentUserId}, cursor: ${cursor}, limit: ${limit}`)
      const result = await profileService.getUserPosts(currentUserId, cursor, limit)
      console.log(`[useUserPosts] 📥 API respondió - posts recibidos: ${result.posts.length}, nextCursor: ${result.nextCursor || 'null'}`)

      // Verificar nuevamente que el userId no cambió
      if (lastUserIdRef.current !== currentUserId) {
        console.log(`[useUserPosts] ⚠️ fetchPosts: userId cambió durante la carga, descartando resultado`)
        return
      }

      // ACTUALIZACIÓN ATÓMICA: Agrupar todas las actualizaciones de estado juntas
      // React 18 hace batching automático, pero necesitamos asegurar que se ejecuten juntas
      // Usar una función que actualice ambos estados de forma síncrona
      if (cursor === null) {
        // Primera carga: reemplazar posts y cursor de forma atómica (sin flickering)
        // Actualizar ambos estados en el mismo tick para evitar parpadeo doble
        console.log(`[useUserPosts] 🔄 PRIMERA CARGA - Actualizando setNextCursor y setPosts`)
        console.log(`[useUserPosts] 📊 Antes: hasPostsRef=${hasPostsRef.current}`)
        setNextCursor(result.nextCursor)
        setPosts(result.posts)
        console.log(`[useUserPosts] 📊 Después: posts.length=${result.posts.length}, nextCursor=${result.nextCursor || 'null'}`)
        
        // Actualizar refs después para no bloquear el render
        hasPostsRef.current = result.posts.length > 0
        hasLoadedRef.current = true
        postsUserIdRef.current = currentUserId
        // Los posts antiguos se reemplazan aquí, no antes en el useEffect
      } else {
        // Cargas siguientes: agregar posts sin duplicados y actualizar cursor atómicamente
        // Primero actualizar cursor, luego posts en el mismo batch
        console.log(`[useUserPosts] 🔄 CARGA SIGUIENTE - Actualizando setNextCursor y setPosts`)
        setNextCursor(result.nextCursor)
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id))
          const newPosts = result.posts.filter(p => !existingIds.has(p.id))
          const updated = [...prev, ...newPosts]
          console.log(`[useUserPosts] 📊 Posts agregados: ${newPosts.length}, total ahora: ${updated.length}`)
          hasPostsRef.current = updated.length > 0
          return updated
        })
      }
    } catch (err) {
      console.error('[useUserPosts] ❌ Error en fetchPosts:', err)
      // Solo actualizar error si el userId no cambió
      if (lastUserIdRef.current === currentUserId) {
      setError(err instanceof Error ? err : new Error('Error al cargar posts'))
        setNextCursor(null)
      }
    } finally {
      isFetchingRef.current = false
      // Actualizar loading después de las actualizaciones de posts
      // React 18 agrupa automáticamente estas actualizaciones si están en el mismo tick
      console.log('[useUserPosts] ✅ fetchPosts completado - setLoading(false)')
      setLoading(false)
    }
  }, [userId])

  // Guardar fetchPosts en ref para evitar cambios en dependencias
  fetchPostsRef.current = fetchPosts

  /**
   * Cargar más posts (scroll infinito)
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !userId || isFetchingRef.current) {
      return
    }

    const currentNextCursor = nextCursor
    if (currentNextCursor && fetchPostsRef.current) {
      await fetchPostsRef.current(currentNextCursor)
    }
  }, [loading, hasMore, userId, nextCursor])

  /**
   * Resetear y recargar desde el inicio
   */
  const reset = useCallback(() => {
    isFetchingRef.current = false
    setPosts([])
    hasPostsRef.current = false
    hasLoadedRef.current = false
    setNextCursor(null)
    setError(null)
    setLoading(false)

    if (userId && fetchPostsRef.current) {
      fetchPostsRef.current(null)
    }
  }, [userId])

  /**
   * Effect: Cargar posts iniciales cuando cambia el userId
   * Optimizado para ejecutarse solo una vez por userId
   */
  useEffect(() => {
    console.log(`[useUserPosts] 🔄 useEffect ejecutado - userId: ${userId}, lastUserId: ${lastUserIdRef.current}`)
    console.log(`[useUserPosts] 📊 Estado actual: hasLoaded=${hasLoadedRef.current}, isFetching=${isFetchingRef.current}, posts.length=${posts.length}`)
    
    // Si no hay userId, limpiar estado
    if (!userId) {
      if (lastUserIdRef.current !== undefined) {
        console.log('[useUserPosts] 🧹 Limpiando estado (sin userId)')
        lastUserIdRef.current = undefined
        // Solo limpiar posts cuando realmente hay posts previos
        if (hasPostsRef.current) {
          console.log('[useUserPosts] 🗑️ setPosts([]) - limpiando posts')
          setPosts([])
          hasPostsRef.current = false
        }
        hasLoadedRef.current = false
        setNextCursor(null)
        setError(null)
      }
      return
    }

    // Si el userId cambió, preparar para nueva carga
    // IMPORTANTE: NO limpiar posts aquí para evitar flickering
    // Los posts se limpiarán cuando lleguen los nuevos datos en fetchPosts
    if (lastUserIdRef.current !== userId) {
      console.log(`[useUserPosts] 🔀 userId cambió: ${lastUserIdRef.current} -> ${userId}`)
      // Cancelar cualquier carga en progreso
      isFetchingRef.current = false
      
      // NO limpiar posts aquí - se reemplazarán cuando lleguen los nuevos
      // Esto evita que los posts desaparezcan y reaparezcan (flickering)
      console.log('[useUserPosts] ⚠️ NO limpiando posts aquí (evita flickering)')
      
      hasLoadedRef.current = false
      setNextCursor(null)
      setError(null)
      // No cambiar loading aquí - se manejará en fetchPosts
      
      // Actualizar referencia INMEDIATAMENTE
      lastUserIdRef.current = userId
    }

    // Cargar posts iniciales solo si no se han cargado aún para este userId
    // IMPORTANTE: Marcar flags ANTES de llamar para evitar condición de carrera
    if (userId && !hasLoadedRef.current && !isFetchingRef.current && fetchPostsRef.current) {
      // MARCAR INMEDIATAMENTE para prevenir ejecuciones duplicadas
      // Esto debe hacerse ANTES de llamar a fetchPosts para evitar condición de carrera
      isFetchingRef.current = true
      // NO marcar hasLoadedRef aquí - se marcará cuando la carga se complete exitosamente
      
      console.log('[useUserPosts] 🚀 Iniciando carga inicial de posts (isFetching marcado)')
      
      // Llamar a fetchPosts después de marcar el flag
      fetchPostsRef.current(null)
    } else {
      console.log(`[useUserPosts] ⏭️ Omitiendo carga: hasLoaded=${hasLoadedRef.current}, isFetching=${isFetchingRef.current}`)
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
