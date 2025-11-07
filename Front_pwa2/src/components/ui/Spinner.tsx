/**
 * Componente de Spinner reutilizable
 * 
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" />
 * <Spinner size="lg" variant="secondary" withText text="Cargando..." />
 * ```
 */

import React from 'react'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'gray'

interface SpinnerProps {
  /** Tamaño del spinner */
  size?: SpinnerSize
  /** Variante de color */
  variant?: SpinnerVariant
  /** Mostrar texto junto al spinner */
  withText?: boolean
  /** Texto a mostrar (requerido si withText es true) */
  text?: string
  /** Clase CSS adicional */
  className?: string
  /** Centrar el spinner */
  centered?: boolean
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'border-blue-600',
  secondary: 'border-purple-600',
  white: 'border-white',
  gray: 'border-gray-400',
}

export function Spinner({
  size = 'md',
  variant = 'primary',
  withText = false,
  text = 'Cargando...',
  className = '',
  centered = false,
}: SpinnerProps) {
  const spinnerElement = (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  )

  if (withText) {
    const textSizeStyles: Record<SpinnerSize, string> = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    }

    return (
      <div className={`flex items-center gap-2 ${centered ? 'justify-center' : ''} ${className}`}>
        {spinnerElement}
        <span className={`text-gray-400 ${textSizeStyles[size]}`}>{text}</span>
      </div>
    )
  }

  return centered ? (
    <div className={`flex items-center justify-center ${className}`}>{spinnerElement}</div>
  ) : (
    spinnerElement
  )
}

/**
 * Spinner de página completa (full screen)
 */
export function FullScreenSpinner({
  text,
  variant = 'primary',
}: {
  text?: string
  variant?: SpinnerVariant
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant={variant} />
        {text && <p className="text-white text-sm">{text}</p>}
      </div>
    </div>
  )
}

/**
 * Spinner inline para contenido
 */
export function InlineSpinner({
  text,
  size = 'sm',
  variant = 'primary',
}: {
  text?: string
  size?: SpinnerSize
  variant?: SpinnerVariant
}) {
  return <Spinner size={size} variant={variant} withText={!!text} text={text} />
}

