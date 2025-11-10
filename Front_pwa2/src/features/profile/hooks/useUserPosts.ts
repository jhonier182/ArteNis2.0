import { useState, useEffect, useCallback, useRef } from 'react'
import { profileService, UserPost } from '../services/profileService'
import { logger } from '@/utils/logger'
import { USER_POSTS_LIMIT } from '@/utils/constants'
import { 
  getCachedUserPosts, 
  cacheUserPosts, 
  clearUserPostsCache 
} from '@/utils/cache'

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
  const fetchPostsRef = useRef<((cursor: string | null, forceRefresh?: boolean) => Promise<void>) | null>(null)
  // Ref para trackear el userId de los posts actuales mostrados
  const postsUserIdRef = useRef<string | undefined>(undefined)

  /**
   * Función interna para cargar posts con cursor
   * Almacenada en ref para evitar recreaciones innecesarias
   */
  const fetchPosts = useCallback(async (cursor: string | null = null, forceRefresh: boolean = false) => {
    const currentUserId = userId
    logger.debug(`[useUserPosts] fetchPosts llamado - cursor: ${cursor}, userId: ${currentUserId}, forceRefresh: ${forceRefresh}`)
    
    if (!currentUserId) {
      logger.debug('[useUserPosts] fetchPosts: No hay userId, abortando')
      return
    }

    // Verificar que el userId no cambió durante la carga
    if (lastUserIdRef.current !== currentUserId) {
      logger.debug(`[useUserPosts] fetchPosts: userId cambió (${lastUserIdRef.current} -> ${currentUserId}), abortando`)
      return
    }

    // Verificar si ya está cargando (solo si NO es la primera carga desde useEffect)
    // Permitir la carga si es la primera vez (cursor === null y forceRefresh === false)
    if (isFetchingRef.current && cursor === null && !forceRefresh) {
      // Verificar si realmente hay una carga en progreso o si es solo un flag residual
      // Si no hay posts y no hay caché, permitir la carga
      const cached = getCachedUserPosts(currentUserId)
      if (!cached || cached.posts.length === 0) {
        // Si no hay caché, permitir la carga incluso si isFetchingRef está en true
        logger.debug('[useUserPosts] fetchPosts: isFetchingRef está en true pero no hay caché, permitiendo carga')
        isFetchingRef.current = false // Resetear para permitir la carga
      } else {
        logger.debug('[useUserPosts] fetchPosts: Ya está cargando (cursor=null), ignorando')
        return
      }
    }

    // Si es la primera carga (cursor === null) y no es forzada, intentar cargar desde caché
    if (cursor === null && !forceRefresh) {
      const cached = getCachedUserPosts(currentUserId)
      if (cached && cached.posts.length > 0) {
        logger.debug(`[useUserPosts] Cargando desde caché - posts: ${cached.posts.length}, nextCursor: ${cached.nextCursor || 'null'}`)
        setPosts(cached.posts)
        setNextCursor(cached.nextCursor)
        hasPostsRef.current = cached.posts.length > 0
        hasLoadedRef.current = true
        postsUserIdRef.current = currentUserId
        // No marcar como cargando si usamos caché
        setLoading(false)
        isFetchingRef.current = false
        return
      }
    }

    // Marcar como cargando INMEDIATAMENTE (si no está ya marcado)
    if (!isFetchingRef.current) {
      isFetchingRef.current = true
      logger.debug(`[useUserPosts] fetchPosts: Marcado como cargando - cursor: ${cursor}, posts actuales: ${hasPostsRef.current ? 'SÍ' : 'NO'}`)
    } else {
      logger.debug(`[useUserPosts] fetchPosts: Ya estaba marcado como cargando - cursor: ${cursor}`)
    }

    try {
      // Solo mostrar loading si es la primera carga o no hay posts cargados
      const shouldShowLoading = cursor === null || !hasPostsRef.current
      if (shouldShowLoading) {
        logger.debug('[useUserPosts] setLoading(true) - mostrando spinner')
      setLoading(true)
      } else {
        logger.debug('[useUserPosts] Omitiendo setLoading(true) - carga silenciosa')
      }
      setError(null)
      
      const limit = USER_POSTS_LIMIT
      logger.debug(`[useUserPosts] Llamando API - userId: ${currentUserId}, cursor: ${cursor}, limit: ${limit}`)
      const result = await profileService.getUserPosts(currentUserId, cursor, limit)
      logger.debug(`[useUserPosts] API respondió - posts recibidos: ${result.posts.length}, nextCursor: ${result.nextCursor || 'null'}`)

      // Verificar nuevamente que el userId no cambió
      if (lastUserIdRef.current !== currentUserId) {
        logger.debug(`[useUserPosts] fetchPosts: userId cambió durante la carga, descartando resultado`)
        return
      }

      // ACTUALIZACIÓN ATÓMICA: Agrupar todas las actualizaciones de estado juntas
      // React 18 hace batching automático, pero necesitamos asegurar que se ejecuten juntas
      // Usar una función que actualice ambos estados de forma síncrona
      if (cursor === null) {
        // Primera carga: reemplazar posts y cursor de forma atómica (sin flickering)
        // Actualizar ambos estados en el mismo tick para evitar parpadeo doble
        logger.debug(`[useUserPosts] PRIMERA CARGA - Actualizando setNextCursor y setPosts`)
        logger.debug(`[useUserPosts] Antes: hasPostsRef=${hasPostsRef.current}`)
        setNextCursor(result.nextCursor)
        setPosts(result.posts)
        logger.debug(`[useUserPosts] Después: posts.length=${result.posts.length}, nextCursor=${result.nextCursor || 'null'}`)
        
        // Guardar en caché
        cacheUserPosts(currentUserId, result.posts, result.nextCursor)
        
        // Actualizar refs después para no bloquear el render
        hasPostsRef.current = result.posts.length > 0
        hasLoadedRef.current = true
        postsUserIdRef.current = currentUserId
        // Los posts antiguos se reemplazan aquí, no antes en el useEffect
      } else {
        // Cargas siguientes: agregar posts sin duplicados y actualizar cursor atómicamente
        // Primero actualizar cursor, luego posts en el mismo batch
        logger.debug(`[useUserPosts] CARGA SIGUIENTE - Actualizando setNextCursor y setPosts`)
        setNextCursor(result.nextCursor)
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id))
          const newPosts = result.posts.filter(p => !existingIds.has(p.id))
          const updated = [...prev, ...newPosts]
          logger.debug(`[useUserPosts] Posts agregados: ${newPosts.length}, total ahora: ${updated.length}`)
          hasPostsRef.current = updated.length > 0
          
          // Actualizar caché con todos los posts acumulados
          cacheUserPosts(currentUserId, updated, result.nextCursor)
          
          return updated
        })
      }
    } catch (err) {
      logger.error('[useUserPosts] Error en fetchPosts', err)
      // Solo actualizar error si el userId no cambió
      if (lastUserIdRef.current === currentUserId) {
      setError(err instanceof Error ? err : new Error('Error al cargar posts'))
        setNextCursor(null)
      }
    } finally {
      isFetchingRef.current = false
      // Actualizar loading después de las actualizaciones de posts
      // React 18 agrupa automáticamente estas actualizaciones si están en el mismo tick
      logger.debug('[useUserPosts] fetchPosts completado - setLoading(false)')
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

    // Limpiar caché al resetear
    if (userId) {
      clearUserPostsCache(userId)
    }

    if (userId && fetchPostsRef.current) {
      // Forzar refresh desde servidor
      fetchPostsRef.current(null, true)
    }
  }, [userId])

  /**
   * Effect: Cargar posts iniciales cuando cambia el userId
   * Optimizado para ejecutarse solo una vez por userId
   */
  useEffect(() => {
    logger.debug(`[useUserPosts] useEffect ejecutado - userId: ${userId}, lastUserId: ${lastUserIdRef.current}`)
    logger.debug(`[useUserPosts] Estado actual: hasLoaded=${hasLoadedRef.current}, isFetching=${isFetchingRef.current}, posts.length=${posts.length}`)
    
    // Si no hay userId, limpiar estado
    if (!userId) {
      if (lastUserIdRef.current !== undefined) {
        logger.debug('[useUserPosts] Limpiando estado (sin userId)')
        lastUserIdRef.current = undefined
        if (hasPostsRef.current) {
          logger.debug('[useUserPosts] setPosts([]) - limpiando posts')
          setPosts([])
          hasPostsRef.current = false
        }
        hasLoadedRef.current = false
        setNextCursor(null)
        setError(null)
      }
      return
    }

    // Verificar caché PRIMERO para determinar si es un re-mount del mismo userId
    const cached = getCachedUserPosts(userId)
    const hasCachedPosts = cached && cached.posts.length > 0
    
    // Si hay caché, probablemente es un re-mount del mismo userId
    // Verificar si el userId realmente cambió o es solo un re-mount
    const userIdChanged = lastUserIdRef.current !== userId && lastUserIdRef.current !== undefined
    
    // Si hay caché y el userId no cambió realmente (solo es undefined por re-mount), restaurar desde caché
    if (!userIdChanged && hasCachedPosts && (lastUserIdRef.current === undefined || lastUserIdRef.current === userId)) {
      logger.debug(`[useUserPosts] Re-mount detectado con caché - posts: ${cached.posts.length}, restaurando desde caché`)
      setPosts(cached.posts)
      setNextCursor(cached.nextCursor)
      hasPostsRef.current = true
      hasLoadedRef.current = true
      postsUserIdRef.current = userId
      lastUserIdRef.current = userId
      setLoading(false)
      isFetchingRef.current = false
      return
    }

    // Si el userId realmente cambió (no es undefined), resetear flags
    if (userIdChanged) {
      logger.debug(`[useUserPosts] userId cambió: ${lastUserIdRef.current} -> ${userId}`)
      isFetchingRef.current = false
      hasLoadedRef.current = false
      setNextCursor(null)
      setError(null)
      lastUserIdRef.current = userId
    } else if (lastUserIdRef.current === undefined) {
      // Primera vez que se monta con este userId
      lastUserIdRef.current = userId
    }

    // Si el userId NO cambió y ya hay posts cargados, NO hacer nada
    // Esto evita re-cargas innecesarias al volver del detalle de post
    // IMPORTANTE: Si hay caché, restaurar desde caché en lugar de hacer fetch
    if (!userIdChanged && hasLoadedRef.current && posts.length > 0 && postsUserIdRef.current === userId) {
      logger.debug(`[useUserPosts] userId no cambió y ya hay ${posts.length} posts cargados, omitiendo recarga`)
      return
    }

    // Si hay caché y no hay posts en estado (remount), restaurar desde caché sin fetch
    if (hasCachedPosts && posts.length === 0 && !userIdChanged) {
      logger.debug(`[useUserPosts] Remount detectado con caché - restaurando ${cached.posts.length} posts sin fetch`)
      setPosts(cached.posts)
      setNextCursor(cached.nextCursor)
      hasPostsRef.current = true
      hasLoadedRef.current = true
      postsUserIdRef.current = userId
      setLoading(false)
      isFetchingRef.current = false
      lastUserIdRef.current = userId
      return
    }

    // Si ya está cargando, no hacer nada
    if (isFetchingRef.current) {
      logger.debug('[useUserPosts] Ya está cargando, omitiendo')
      return
    }

    // Intentar cargar desde caché si no se restauró antes
    if (hasCachedPosts) {
      logger.debug(`[useUserPosts] Caché encontrado - posts: ${cached.posts.length}, cargando directamente`)
      setPosts(cached.posts)
      setNextCursor(cached.nextCursor)
      hasPostsRef.current = true
      hasLoadedRef.current = true
      postsUserIdRef.current = userId
      setLoading(false)
      isFetchingRef.current = false
      return
    }

    // Si no hay caché y no se ha cargado, hacer fetch
    // NO marcar isFetchingRef aquí - fetchPosts lo hará internamente
    if (!hasLoadedRef.current && fetchPostsRef.current) {
      logger.debug('[useUserPosts] No hay caché, iniciando fetch desde API')
      // NO marcar isFetchingRef aquí - fetchPosts lo manejará
      fetchPostsRef.current(null, false)
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
