/**
 * Hook para manejar el scroll persistente entre navegaciones
 * 
 * Guarda la posición del scroll en sessionStorage y la restaura cuando
 * el componente se vuelve a montar.
 * 
 * @param pageId - Identificador único de la página (ej: "profile-page", "user-profile-123")
 * @param enabled - Si está habilitado (por defecto: true)
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   usePersistentScroll("profile-page")
 *   // ... resto del componente
 * }
 * ```
 */

import { useEffect, useRef } from 'react'

interface UsePersistentScrollOptions {
  /** Identificador único de la página */
  pageId: string
  /** Si el hook está habilitado */
  enabled?: boolean
  /** Delay en ms antes de restaurar el scroll (por defecto: 100) */
  restoreDelay?: number
}

/**
 * Hook para manejar el scroll persistente entre navegaciones
 * 
 * Guarda la posición del scroll en sessionStorage y la restaura cuando
 * el componente se vuelve a montar.
 * 
 * @param options - Opciones de configuración del hook
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   usePersistentScroll({ pageId: "profile-page" })
 *   // ... resto del componente
 * }
 * ```
 */
export function usePersistentScroll({
  pageId,
  enabled = true,
  restoreDelay = 100
}: UsePersistentScrollOptions): void {
  const storageKey = `scroll:${pageId}`
  const hasRestoredRef = useRef(false)
  const isRestoringRef = useRef(false)

  // Restaurar scroll al montar
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    if (hasRestoredRef.current) return

    const savedScroll = sessionStorage.getItem(storageKey)
    if (savedScroll) {
      const scrollY = Number(savedScroll)
      if (!isNaN(scrollY) && scrollY > 0) {
        isRestoringRef.current = true
        
        // Usar requestAnimationFrame para asegurar que el DOM esté listo
        const restoreScroll = () => {
          window.scrollTo({
            top: scrollY,
            behavior: 'auto'
          })
          hasRestoredRef.current = true
          
          // Permitir guardar scroll después de un breve delay
          setTimeout(() => {
            isRestoringRef.current = false
          }, restoreDelay + 200)
        }

        // Pequeño delay para asegurar que el contenido esté renderizado
        setTimeout(restoreScroll, restoreDelay)
      }
    } else {
      hasRestoredRef.current = true
    }
  }, [pageId, enabled, storageKey, restoreDelay])

  // Guardar scroll antes de desmontar y durante el scroll
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let scrollTimeout: NodeJS.Timeout | null = null

    const saveScroll = () => {
      // No guardar si estamos restaurando
      if (isRestoringRef.current) return

      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      if (scrollY > 0) {
        try {
          sessionStorage.setItem(storageKey, String(scrollY))
        } catch (e) {
          // Silenciar errores de storage (puede estar lleno)
        }
      }
    }

    // Throttle: guardar cada 300ms durante el scroll
    const handleScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        saveScroll()
        scrollTimeout = null
      }, 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Guardar antes de desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
      saveScroll()
    }
  }, [pageId, enabled, storageKey])
}

