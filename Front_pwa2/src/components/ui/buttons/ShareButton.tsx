'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

export interface ShareButtonProps {
  /** URL a compartir */
  url?: string
  /** Título del contenido a compartir */
  title?: string
  /** Texto descriptivo del contenido */
  text?: string
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg'
  /** Clase CSS adicional */
  className?: string
  /** Callback cuando se comparte exitosamente */
  onShare?: () => void
  /** Callback cuando hay error al compartir */
  onError?: (error: Error) => void
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'icon-only'
}

export function ShareButton({
  url,
  title = 'Compartir',
  text = '',
  size = 'md',
  className = '',
  onShare,
  onError,
  variant = 'default'
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  /**
   * Maneja la acción de compartir
   * 
   * Usa Web Share API si está disponible, sino copia al portapapeles
   */
  const handleShare = async () => {
    setIsSharing(true)

    try {
      const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
      const shareTitle = title || 'Compartir'

      // Intentar usar Web Share API (disponible en móviles y algunos navegadores)
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: text || '',
            url: shareUrl,
          })
          onShare?.()
        } catch (err) {
          // Usuario canceló o hubo error
          if ((err as Error).name !== 'AbortError') {
            throw err
          }
        }
      } else {
        // Fallback: copiar al portapapeles
        if (typeof window !== 'undefined' && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(shareUrl)
            // Mostrar feedback visual (opcional, se puede mejorar con toast)
            if (typeof window !== 'undefined') {
              // Puedes usar un toast aquí en el futuro
              console.log('Enlace copiado al portapapeles')
            }
            onShare?.()
          } catch (err) {
            throw new Error('No se pudo copiar el enlace al portapapeles')
          }
        } else {
          throw new Error('Compartir no está disponible en este navegador')
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al compartir')
      onError?.(error)
      console.error('Error al compartir:', err)
    } finally {
      setIsSharing(false)
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const iconSize = sizeClasses[size]

  // Variante minimal - solo icono pequeño
  if (variant === 'minimal') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleShare()
        }}
        disabled={isSharing}
        className={`flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="Compartir"
      >
        <Share2 className={`${iconSize} text-gray-400 hover:text-blue-500 transition-colors`} />
      </button>
    )
  }

  // Variante icon-only - solo icono sin texto
  if (variant === 'icon-only') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleShare()
        }}
        disabled={isSharing}
        className={`flex items-center justify-center p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        aria-label="Compartir"
      >
        <Share2 className={`${iconSize} text-gray-400 hover:text-blue-500 transition-colors`} />
      </button>
    )
  }

  // Variante default - icono con estilo completo
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleShare()
      }}
      disabled={isSharing}
      className={`flex items-center gap-1 p-1 rounded-full transition border focus:outline-none bg-transparent text-gray-400 border-transparent hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label="Compartir publicación"
      title="Compartir publicación"
    >
      <motion.div
        animate={isSharing ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Share2 className={`${iconSize} transition-colors`} />
      </motion.div>
    </button>
  )
}

