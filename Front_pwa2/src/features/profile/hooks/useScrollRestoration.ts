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
import { saveScrollPosition, getScrollPosition } from '@/utils/cache'
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
  const isInitialMountRef = useRef<boolean>(true)
  
  // Función para verificar si es la primera carga (usando sessionStorage para persistir)
  const getIsFirstLoad = useCallback((id: string) => {
    if (typeof window === 'undefined') return true
    const key = `scroll_first_load_${routePath}_${id}`
    const stored = sessionStorage.getItem(key)
    return stored === null
  }, [routePath])
  
  // Función para marcar que ya no es la primera carga
  const markNotFirstLoad = useCallback((id: string) => {
    if (typeof window === 'undefined') return
    const key = `scroll_first_load_${routePath}_${id}`
    sessionStorage.setItem(key, 'false')
  }, [routePath])

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
          logger.debug(`[useScrollRestoration] Guardando scroll: ${currentScroll}px antes de navegar a ${url} (routePath: ${routePath})`)
          saveScrollPosition(identifier, currentScroll)
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
  }, [router, identifier, routePath])

  // Restaurar posición de scroll al volver a la ruta
  // Usamos useLayoutEffect para ejecutar antes del paint
  useLayoutEffect(() => {
    // Verificar si estamos en la ruta correcta
    // Para rutas con query params como /userProfile?userId=xxx, usar startsWith
    // Para rutas exactas como /profile, verificar que no tenga sub-rutas
    const pathWithoutQuery = router.asPath.split('?')[0]
    const isOnRoute = pathWithoutQuery === routePath || 
                      (routePath === '/userProfile' && pathWithoutQuery.startsWith('/userProfile') && !pathWithoutQuery.includes('/userProfile/'))
    
    if (!identifier || !isOnRoute) {
      if (!isOnRoute) {
        scrollRestoredRef.current = false
        targetScrollRef.current = null
      }
      return
    }

    // Verificar si hay scroll guardado
    const savedScroll = getScrollPosition(identifier)
    
    // Determinar si estamos volviendo de otra ruta
    const previousPath = previousPathRef.current?.split('?')[0] || null
    
    // Verificar si es la primera carga usando sessionStorage
    const isFirstLoad = getIsFirstLoad(identifier)
    
    // Marcar que ya no es el montaje inicial después de la primera carga completa
    if (isFirstLoad && posts.length > 0) {
      logger.debug(`[useScrollRestoration] Marcando que ya no es primera carga (posts.length: ${posts.length}, routePath: ${routePath})`)
      markNotFirstLoad(identifier)
      isInitialMountRef.current = false
    } else if (!isFirstLoad) {
      isInitialMountRef.current = false
    }
    
    // Restaurar si:
    // 1. Hay scroll guardado
    // 2. Posts ya están cargados (para evitar restaurar antes de que el contenido esté listo)
    // 3. Aún no se ha restaurado
    // 4. No es la primera carga (verificado con sessionStorage)
    const hasValidPreviousPath = previousPath !== null && previousPath !== routePath
    const isNotFirstLoad = !isFirstLoad || hasValidPreviousPath
    
    const shouldRestore = savedScroll !== null && 
                          savedScroll > 0 && 
                          !scrollRestoredRef.current &&
                          posts.length > 0 &&
                          isNotFirstLoad
    
    logger.debug(`[useScrollRestoration] shouldRestore: ${shouldRestore} (routePath: ${routePath}, savedScroll: ${savedScroll}, hasValidPreviousPath: ${hasValidPreviousPath}, isNotFirstLoad: ${isNotFirstLoad}, isInitialMount: ${isInitialMountRef.current}, posts.length: ${posts.length}, previousPath: ${previousPath})`)
    
    if (shouldRestore && typeof window !== 'undefined') {
      logger.debug(`[useScrollRestoration] Restaurando scroll a: ${savedScroll}px (routePath: ${routePath})`)
      targetScrollRef.current = savedScroll
      scrollRestoredRef.current = true

      // Función para verificar que el contenido esté renderizado
      const isContentReady = () => {
        // Verificar que haya posts en el estado
        if (posts.length === 0) return false
        
        // Verificar que el DOM tenga contenido (al menos un elemento renderizado)
        const elements = document.querySelectorAll(`[${itemSelector}]`)
        return elements.length > 0 || document.body.scrollHeight > window.innerHeight
      }

      // Función para restaurar scroll de forma agresiva
      const restoreScroll = () => {
        if (targetScrollRef.current === null) return
        
        // Si el contenido no está listo, esperar un poco más
        if (!isContentReady()) {
          return
        }
        
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        const target = targetScrollRef.current
        
        // Si no estamos en la posición correcta, forzar restauración
        if (Math.abs(currentScroll - target) > 10) {
          // Múltiples métodos para asegurar que funcione
          window.scrollTo({ top: target, behavior: 'auto' })
          document.documentElement.scrollTop = target
          if (document.body) {
            document.body.scrollTop = target
          }
          logger.debug(`[useScrollRestoration] Scroll restaurado a ${target}px (actual: ${currentScroll}px, routePath: ${routePath})`)
        } else {
          // Si ya estamos en la posición correcta, limpiar después de un momento
          logger.debug(`[useScrollRestoration] Scroll ya está en la posición correcta (${currentScroll}px, routePath: ${routePath})`)
          setTimeout(() => {
            targetScrollRef.current = null
          }, 500)
        }
      }

      // Restaurar inmediatamente (useLayoutEffect se ejecuta antes del paint)
      restoreScroll()
      
      const timeouts: NodeJS.Timeout[] = []
      const rafIds: number[] = []
      
      // Intentos múltiples en diferentes momentos (más agresivo)
      // Empezar después de un pequeño delay para dar tiempo al render
      for (let i = 1; i <= 50; i++) {
        timeouts.push(setTimeout(restoreScroll, i * 10)) // Cada 10ms hasta 500ms
      }
      
      // También con requestAnimationFrame (múltiples frames)
      for (let i = 0; i < 15; i++) {
        const rafId = requestAnimationFrame(() => {
          restoreScroll()
          requestAnimationFrame(() => {
            restoreScroll()
            requestAnimationFrame(restoreScroll)
          })
        })
        rafIds.push(rafId)
      }

      // Listener para prevenir que se resetee el scroll (más agresivo)
      let lastScrollTime = Date.now()
      const preventScrollReset = () => {
        if (targetScrollRef.current === null) return
        
        const now = Date.now()
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        const target = targetScrollRef.current
        
        // Si el scroll está cerca de 0 pero debería estar más abajo, restaurarlo
        if (currentScroll < 100 && target > 100 && (now - lastScrollTime) > 50) {
          logger.debug(`[useScrollRestoration] Preveniendo reset de scroll: ${currentScroll}px -> ${target}px (routePath: ${routePath})`)
          restoreScroll()
          lastScrollTime = now
        }
      }

      window.addEventListener('scroll', preventScrollReset, { passive: true })
      
      // Limpiar después de un tiempo más largo
      const cleanupTimeout = setTimeout(() => {
        targetScrollRef.current = null
        window.removeEventListener('scroll', preventScrollReset)
      }, 3000)

      return () => {
        timeouts.forEach(clearTimeout)
        rafIds.forEach(cancelAnimationFrame)
        clearTimeout(cleanupTimeout)
        window.removeEventListener('scroll', preventScrollReset)
      }
    }
  }, [identifier, router.asPath, router.pathname, posts.length, routePath, itemSelector, getIsFirstLoad, markNotFirstLoad])

  // Guardar scroll periódicamente mientras el usuario está en la página
  useEffect(() => {
    if (!identifier) return

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        saveScrollPosition(identifier, window.scrollY)
      }
    }

    // Throttle para no guardar en cada pixel de scroll
    let scrollTimeout: NodeJS.Timeout | null = null
    const throttledScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        handleScroll()
        scrollTimeout = null
      }, 500) // Guardar cada 500ms
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [identifier])

  // Función para manejar click en post (guardar scroll antes de navegar)
  const handlePostClick = useCallback((postId: string) => {
    // Guardar scroll antes de navegar
    if (identifier && typeof window !== 'undefined') {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      if (currentScroll > 0) {
        logger.debug(`[useScrollRestoration] Guardando scroll antes de click en post: ${currentScroll}px (routePath: ${routePath})`)
        saveScrollPosition(identifier, currentScroll)
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
  }, [identifier, router, routePath, onPostClick])

  return {
    handlePostClick
  }
}

