/**
 * Hook reutilizable para manejar estados de carga con spinner
 * 
 * Este hook proporciona una forma fácil de mostrar spinners mientras
 * se cargan datos, con diferentes variantes y opciones de personalización.
 * 
 * @example
 * ```tsx
 * // Uso básico
 * const { SpinnerComponent, isLoading } = useLoadingSpinner(loading)
 * 
 * return (
 *   <>
 *     {isLoading && <SpinnerComponent />}
 *     {!isLoading && <Content />}
 *   </>
 * )
 * 
 * // Con texto personalizado
 * const { SpinnerComponent } = useLoadingSpinner(loading, {
 *   text: 'Cargando posts...',
 *   size: 'lg'
 * })
 * 
 * // Spinner inline
 * const { InlineSpinner } = useLoadingSpinner(loading, {
 *   inline: true,
 *   text: 'Cargando...'
 * })
 * ```
 */

import React, { useMemo, useEffect, useState } from 'react'
import { Spinner, FullScreenSpinner, InlineSpinner as InlineSpinnerComponent, SpinnerSize, SpinnerVariant } from '@/components/ui/Spinner'

interface UseLoadingSpinnerOptions {
  /** Tamaño del spinner */
  size?: SpinnerSize
  /** Variante de color */
  variant?: SpinnerVariant
  /** Texto a mostrar junto al spinner */
  text?: string
  /** Mostrar como spinner inline (con texto) */
  inline?: boolean
  /** Mostrar como spinner de pantalla completa */
  fullScreen?: boolean
  /** Clase CSS adicional */
  className?: string
  /** Delay antes de mostrar el spinner (en ms) - útil para evitar flickering en cargas rápidas */
  delay?: number
  /** Tamaño mínimo de contenido antes de mostrar spinner (útil para evitar mostrar spinner si ya hay contenido) */
  minContentLength?: number
}

interface UseLoadingSpinnerResult {
  /** Componente de spinner listo para usar */
  SpinnerComponent: React.ReactElement | null
  /** Spinner inline (con texto) */
  InlineSpinner: React.ReactElement | null
  /** Spinner de pantalla completa */
  FullScreenSpinner: React.ReactElement | null
  /** Estado de carga (puede incluir delay) */
  isLoading: boolean
  /** Estado de carga real (sin delay) */
  isLoadingImmediate: boolean
}

export function useLoadingSpinner(
  loading: boolean,
  options: UseLoadingSpinnerOptions = {}
): UseLoadingSpinnerResult {
  const {
    size = 'md',
    variant = 'primary',
    text,
    inline = false,
    fullScreen = false,
    className = '',
    delay = 0,
    minContentLength,
  } = options

  // Estado inmediato (sin delay)
  const isLoadingImmediate = loading

  // Estado con delay (para evitar flickering)
  const [isLoading, setIsLoading] = useState(loading)
  
  useEffect(() => {
    if (loading) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setIsLoading(true)
        }, delay)
        return () => clearTimeout(timer)
      } else {
        setIsLoading(true)
      }
    } else {
      // Si deja de cargar, resetear inmediatamente (sin delay)
      setIsLoading(false)
    }
  }, [loading, delay])

  // Memoizar componentes de spinner
  const spinnerComponents = useMemo(() => {
    if (!isLoading) {
      return {
        SpinnerComponent: null as React.ReactElement | null,
        InlineSpinner: null as React.ReactElement | null,
        FullScreenSpinner: null as React.ReactElement | null,
      }
    }

    if (fullScreen) {
      const fullScreenComponent = React.createElement(FullScreenSpinner, { text, variant })
      return {
        SpinnerComponent: fullScreenComponent,
        InlineSpinner: null as React.ReactElement | null,
        FullScreenSpinner: fullScreenComponent,
      }
    }

    if (inline) {
      const inlineComponent = React.createElement(InlineSpinnerComponent, { text, size, variant })
      return {
        SpinnerComponent: inlineComponent,
        InlineSpinner: inlineComponent,
        FullScreenSpinner: null as React.ReactElement | null,
      }
    }

    const spinnerComponent = React.createElement(Spinner, { 
      size, 
      variant, 
      className, 
      centered: true 
    })
    const inlineSpinnerComponent = React.createElement(InlineSpinnerComponent, { text, size, variant })
    
    return {
      SpinnerComponent: spinnerComponent,
      InlineSpinner: inlineSpinnerComponent,
      FullScreenSpinner: null as React.ReactElement | null,
    }
  }, [isLoading, size, variant, text, inline, fullScreen, className])

  return {
    ...spinnerComponents,
    isLoading,
    isLoadingImmediate,
  }
}


