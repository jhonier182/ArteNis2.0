/**
 * Hook para navegación de retorno inteligente
 * 
 * Usa router.back() para mantener el estado de la página anterior.
 * Si no hay historial disponible, redirige a una ruta fallback.
 * 
 * @param fallbackRoute - Ruta a la que redirigir si no hay historial (ej: "/", "/explore")
 * 
 * @returns Función goBack() para navegar hacia atrás
 * 
 * @example
 * ```tsx
 * function PostDetailPage() {
 *   const goBack = useSmartBack("/explore")
 *   
 *   return (
 *     <button onClick={goBack}>Volver</button>
 *   )
 * }
 * ```
 */

import { useRouter } from 'next/router'
import { useCallback } from 'react'

interface UseSmartBackOptions {
  /** Ruta fallback si no hay historial disponible */
  fallbackRoute?: string
}

export function useSmartBack({ fallbackRoute = '/' }: UseSmartBackOptions = {}) {
  const router = useRouter()

  const goBack = useCallback(() => {
    // Verificar si hay historial disponible
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Si no hay historial, redirigir a la ruta fallback
      router.push(fallbackRoute)
    }
  }, [router, fallbackRoute])

  return goBack
}

