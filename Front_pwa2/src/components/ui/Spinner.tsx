/**
 * Spinner simple y reutilizable para estados de carga
 * 
 * @example
 * ```tsx
 * // Para pantallas
 * {loading && <Spinner />}
 * 
 * // Para contenido inline
 * {loading && <Spinner size="sm" />}
 * 
 * // Pantalla completa
 * {loading && <FullScreenSpinner />}
 * ```
 */

import React from 'react'

interface SpinnerProps {
  /** Tamaño del spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Clase CSS adicional */
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${sizeStyles[size]}`}
        role="status"
        aria-label="Cargando"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  )
}

/**
 * Spinner de pantalla completa (para cargar páginas)
 */
export function FullScreenSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <Spinner size="lg" />
    </div>
  )
}
