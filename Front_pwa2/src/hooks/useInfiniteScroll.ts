import { useEffect, useRef, useState, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  threshold?: number
}

/**
 * Hook para implementar scroll infinito con soporte para scroll del mouse
 */
export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLoadTimeRef = useRef<number>(0)
  const isLoadingRef = useRef<boolean>(false)

  // Función para verificar si debemos cargar más
  const checkShouldLoad = useCallback(() => {
    if (isLoadingRef.current || loading || !hasMore || !element) return false
    
    const now = Date.now()
    // Throttle: no cargar más de una vez cada 500ms
    if (now - lastLoadTimeRef.current < 500) return false

    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    
    // Verificar si el elemento está cerca del viewport (dentro del threshold)
    const isNearViewport = rect.top <= windowHeight + threshold && rect.bottom >= -threshold
    
    if (isNearViewport) {
      lastLoadTimeRef.current = now
      isLoadingRef.current = true
      return true
    }
    
    return false
  }, [element, hasMore, loading, threshold])

  // Listener de scroll manual (para scroll del mouse)
  useEffect(() => {
    if (!hasMore || loading) return

    const handleScroll = () => {
      if (checkShouldLoad()) {
        isLoadingRef.current = true
        onLoadMore()
        // Reset el flag después de un tiempo
        setTimeout(() => {
          isLoadingRef.current = false
        }, 1000)
      }
    }

    // Throttle del scroll para mejor rendimiento
    let scrollTimeout: NodeJS.Timeout | null = null
    const throttledScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        handleScroll()
        scrollTimeout = null
      }, 150)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    // También escuchar scroll en el contenedor si existe
    const container = element?.closest('.scrollable-container') || document.documentElement
    container.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      container.removeEventListener('scroll', throttledScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [element, hasMore, loading, checkShouldLoad, onLoadMore])

  // IntersectionObserver como método principal
  useEffect(() => {
    if (!element || !hasMore || loading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting && hasMore && !loading && !isLoadingRef.current) {
          const now = Date.now()
          if (now - lastLoadTimeRef.current >= 500) {
            lastLoadTimeRef.current = now
            isLoadingRef.current = true
            onLoadMore()
            setTimeout(() => {
              isLoadingRef.current = false
            }, 1000)
          }
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [element, hasMore, loading, onLoadMore, threshold])

  return { setElement }
}

