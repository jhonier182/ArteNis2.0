/**
 * Hook reutilizable para guardar y restaurar la posición de scroll
 * 
 * Este hook maneja automáticamente:
 * - Guardar la posición de scroll antes de navegar a otra ruta
 * - Restaurar la posición de scroll al volver a la ruta
 * - Persistir el estado entre re-montajes usando sessionStorage
 * 
 * @example
 * ```tsx
 * const { handlePostClick } = useScrollRestoration({
 *   routePath: '/profile',
 *   identifier: user?.id,
 *   posts: userPosts
 * })
 * ```
 */

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { saveScroll, getScroll, clearScroll, getFirstLoadFlag, setFirstLoadFlag } from '@/utils/scrollStorage'
import { logger } from '@/utils/logger'

interface UseScrollRestorationOptions {
  /**
   * Ruta base para detectar si estamos en esta página
   * Ejemplo: '/profile', '/userProfile'
   */
  routePath: string
  
  /**
   * Identificador único para esta instancia (userId, etc.)
   * Se usa como clave para guardar/restaurar el scroll
   */
  identifier: string | null | undefined
  
  /**
   * Lista de posts o elementos que se renderizan
   * Se usa para verificar que el contenido esté listo antes de restaurar
   */
  posts: unknown[]
  
  /**
   * Atributo data-* para identificar elementos en el DOM
   * Por defecto: 'data-post-item'
   */
  itemSelector?: string
  
  /**
   * Callback opcional cuando se hace click en un post
   * Si se proporciona, se guardará el scroll antes de navegar
   */
  onPostClick?: (postId: string) => void
}

export function useScrollRestoration({
  routePath,
  identifier,
  posts,
  itemSelector = 'data-post-item',
  onPostClick
}: UseScrollRestorationOptions) {
  const router = useRouter()
  const previousPathRef = useRef<string | null>(null)
  const scrollRestoredRef = useRef<boolean>(false)
  const targetScrollRef = useRef<number | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)
  const isInitialMountRef = useRef<boolean>(true)

  // Guardar scroll con snapshot completo (incluye postIds para validación)
  const saveCurrentScroll = useCallback((postId?: string) => {
    if (!identifier || typeof window === 'undefined') return
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    const snapshot = {
      scrollY,
      ts: Date.now(),
      routePath,
      postIds: Array.from(document.querySelectorAll(`[${itemSelector}]`))
        .map(el => (el as HTMLElement).getAttribute('data-post-id') || '')
        .filter(Boolean),
      lastVisitedPostId: postId || undefined
    }
    saveScroll(identifier, snapshot)
    logger.debug(`[useScrollRestoration] Guardando scroll snapshot: ${scrollY}px con ${snapshot.postIds.length} postIds (routePath: ${routePath})`)
  }, [identifier, routePath, itemSelector])

  // Guardar posición de scroll antes de navegar
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Guardar scroll cuando salimos de esta ruta
      const currentPathWithoutQuery = router.asPath.split('?')[0]
      const urlPathWithoutQuery = url.split('?')[0]
      const isCurrentlyOnRoute = currentPathWithoutQuery === routePath || 
                                  (routePath === '/userProfile' && currentPathWithoutQuery.startsWith('/userProfile') && !currentPathWithoutQuery.includes('/userProfile/'))
      const isNavigatingAway = !urlPathWithoutQuery.startsWith(routePath) || 
                               (routePath === '/userProfile' && urlPathWithoutQuery.includes('/userProfile/'))
      
      if (identifier && typeof window !== 'undefined' && isCurrentlyOnRoute && isNavigatingAway) {
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        if (currentScroll > 0) {
          logger.debug(`[useScrollRestoration] Guardando scroll antes de navegar a ${url} (routePath: ${routePath})`)
          saveCurrentScroll()
          // Guardar la ruta a la que vamos para detectar el retorno
          previousPathRef.current = url
        }
      }
      // Resetear flag cuando salimos
      scrollRestoredRef.current = false
    }

    const handleRouteChangeComplete = () => {
      // Marcar que no es el montaje inicial después de la primera navegación
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false
      }
    }

    router.events?.on('routeChangeStart', handleRouteChangeStart)
    router.events?.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events?.off('routeChangeStart', handleRouteChangeStart)
      router.events?.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router, identifier, routePath, saveCurrentScroll])

  // Función determinista: verificar si el contenido está listo
  const isContentReady = useCallback(() => {
    if (!posts || posts.length === 0) return false
    const elements = document.querySelectorAll(`[${itemSelector}]`)
    if (elements.length === 0) return false
    // No hay skeletons visibles
    if (document.querySelectorAll('.skeleton, .shimmer, [class*="skeleton"], [class*="shimmer"]').length > 0) return false
    return document.body.scrollHeight > window.innerHeight || elements.length > 0
  }, [posts, itemSelector])

  // Función para restaurar scroll de forma atómica
  const attemptRestore = useCallback((target: number) => {
    if (target == null || typeof window === 'undefined') return
    const current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    if (Math.abs(current - target) > 5) {
      window.scrollTo({ top: target, behavior: 'auto' })
      document.documentElement.scrollTop = target
      if (document.body) {
        document.body.scrollTop = target
      }
      logger.debug(`[useScrollRestoration] Scroll restaurado a ${target}px (actual: ${current}px, routePath: ${routePath})`)
    }
  }, [routePath])

  // Restaurar posición de scroll al volver a la ruta
  // Usamos useLayoutEffect para ejecutar antes del paint
  useLayoutEffect(() => {
    if (!identifier || typeof window === 'undefined') return

    // Verificar si estamos en la ruta correcta
    const pathWithoutQuery = router.asPath.split('?')[0]
    const isOnRoute = pathWithoutQuery === routePath || 
                      (routePath === '/userProfile' && pathWithoutQuery.startsWith('/userProfile') && !pathWithoutQuery.includes('/userProfile/'))
    
    if (!isOnRoute) {
      scrollRestoredRef.current = false
      targetScrollRef.current = null
      return
    }

    // Obtener snapshot guardado
    const snapshot = getScroll(identifier)
    const previousPath = previousPathRef.current?.split('?')[0] || null
    const isFirstLoad = getFirstLoadFlag(identifier)

    // Marcar que ya no es primera carga si posts cargan
    if (isFirstLoad && posts.length > 0) {
      logger.debug(`[useScrollRestoration] Marcando que ya no es primera carga (posts.length: ${posts.length}, routePath: ${routePath})`)
      setFirstLoadFlag(identifier, false)
      isInitialMountRef.current = false
    } else if (!isFirstLoad) {
      isInitialMountRef.current = false
    }

    // Considerar restaurar si:
    // - existe snapshot
    // - no se ha restaurado aún
    // - posts ya cargados (pero esperamos al DOM ready)
    // - no es primera carga OR venimos desde postDetail
    const hasValidPreviousPath = previousPath !== null && previousPath !== routePath
    const isNotFirstLoad = !isFirstLoad || hasValidPreviousPath
    const shouldRestore = snapshot && 
                          !scrollRestoredRef.current && 
                          posts.length > 0 && 
                          isNotFirstLoad &&
                          snapshot.scrollY > 0

    logger.debug(`[useScrollRestoration] shouldRestore: ${shouldRestore} (routePath: ${routePath}, snapshot: ${snapshot ? `${snapshot.scrollY}px` : 'null'}, hasValidPreviousPath: ${hasValidPreviousPath}, isNotFirstLoad: ${isNotFirstLoad}, posts.length: ${posts.length}, previousPath: ${previousPath})`)

    if (!shouldRestore) return

    targetScrollRef.current = snapshot!.scrollY
    
    // Esperar que el DOM esté listo usando MutationObserver con timeout de seguridad
    let restored = false
    const maxWait = 3000
    const start = Date.now()

    const tryRestoreWhenReady = () => {
      if (restored) return
      if (isContentReady()) {
        attemptRestore(targetScrollRef.current!)
        restored = true
        scrollRestoredRef.current = true
        // Cleanup observer
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect()
          mutationObserverRef.current = null
        }
        // Limpiar el target después de un tiempo
        setTimeout(() => {
          targetScrollRef.current = null
        }, 500)
        logger.debug(`[useScrollRestoration] Restauración completada exitosamente a ${snapshot!.scrollY}px (routePath: ${routePath})`)
      } else if (Date.now() - start > maxWait) {
        // Fallback: intentar restaurar de todos modos una vez
        logger.debug(`[useScrollRestoration] Timeout alcanzado, restaurando de todos modos (routePath: ${routePath})`)
        attemptRestore(targetScrollRef.current!)
        restored = true
        scrollRestoredRef.current = true
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect()
          mutationObserverRef.current = null
        }
      }
    }

    // Intento inicial inmediato
    tryRestoreWhenReady()

    // Observer para cambios del DOM
    const mo = new MutationObserver(() => {
      tryRestoreWhenReady()
    })
    mutationObserverRef.current = mo
    mo.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['class', 'style'] // Solo observar cambios en clases y estilos que puedan afectar el layout
    })

    // Cleanup
    return () => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect()
        mutationObserverRef.current = null
      }
    }
  }, [identifier, router.asPath, router.pathname, posts.length, routePath, isContentReady, attemptRestore])

  // Guardar scroll periódicamente mientras el usuario está en la página
  useEffect(() => {
    if (!identifier) return

    // Throttle para no guardar en cada pixel de scroll
    let scrollTimeout: NodeJS.Timeout | null = null
    const throttledScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        if (typeof window !== 'undefined') {
          saveCurrentScroll()
        }
        scrollTimeout = null
      }, 500) // Guardar cada 500ms
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [identifier, saveCurrentScroll])

  // Función para manejar click en post (guardar scroll antes de navegar)
  const handlePostClick = useCallback((postId: string) => {
    // Guardar scroll antes de navegar
    if (identifier && typeof window !== 'undefined') {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      if (currentScroll > 0) {
        logger.debug(`[useScrollRestoration] Guardando scroll antes de click en post: ${currentScroll}px (routePath: ${routePath})`)
        saveCurrentScroll(postId)
        // Guardar la ruta a la que vamos para detectar el retorno
        previousPathRef.current = `/postDetail?postId=${postId}`
        logger.debug(`[useScrollRestoration] previousPathRef actualizado a: ${previousPathRef.current}`)
      }
    }
    // Llamar al callback si existe
    if (onPostClick) {
      onPostClick(postId)
    } else {
      // Navegar al post por defecto
      router.push(`/postDetail?postId=${postId}`)
    }
  }, [identifier, router, routePath, onPostClick, saveCurrentScroll])

  return {
    handlePostClick,
    clearSavedScroll: () => {
      if (identifier) {
        clearScroll(identifier)
        logger.debug(`[useScrollRestoration] Scroll guardado limpiado (routePath: ${routePath})`)
      }
    }
  }
}

