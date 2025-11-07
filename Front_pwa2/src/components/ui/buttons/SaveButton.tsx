'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { postService } from '@/features/posts/services/postService'
import { useAuth } from '@/context/AuthContext'

export interface SaveButtonProps {
  /** ID del post */
  postId: string
  /** Estado inicial de si está guardado (fallback si aún no está cargado) */
  initialSaved?: boolean
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg'
  /** Clase CSS adicional */
  className?: string
  /** Callback cuando el estado de guardado cambia */
  onToggle?: (saved: boolean) => void
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'icon-only'
}

export function SaveButton({
  postId,
  initialSaved = false,
  size = 'md',
  className = '',
  onToggle,
  variant = 'default'
}: SaveButtonProps) {
  const { isAuthenticated } = useAuth()
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  // Sincronizar con estado inicial cuando cambia
  useEffect(() => {
    setIsSaved(initialSaved)
  }, [initialSaved])

  /**
   * Maneja el toggle de guardar (guardar / quitar de guardados)
   * 
   * Implementa patrón de actualización optimista:
   * 1. Actualiza UI inmediatamente
   * 2. Realiza petición al servidor
   * 3. Si falla, revierte el cambio
   */
  const handleToggleSave = async () => {
    if (!isAuthenticated || isLoading) return

    setIsLoading(true)
    const previousSaved = isSaved

    try {
      // ACTUALIZACIÓN OPTIMISTA: Actualizar UI inmediatamente
      setIsSaved(!isSaved)

      // Realizar petición al servidor
      if (previousSaved) {
        await postService.unsavePost(postId)
      } else {
        await postService.savePost(postId)
      }

      // Notificar cambio exitoso
      onToggle?.(!previousSaved)
    } catch (err: unknown) {
      // REVERTIR: Deshacer actualización optimista en caso de error
      setIsSaved(previousSaved)
      onToggle?.(previousSaved)
      console.error('Error al guardar/quitar post:', err)
    } finally {
      setIsLoading(false)
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
          handleToggleSave()
        }}
        disabled={isLoading || !isAuthenticated}
        className={`flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={isSaved ? 'Quitar de guardados' : 'Guardar publicación'}
      >
        <motion.div
          animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            className={`${iconSize} transition-colors ${
              isSaved
                ? 'fill-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-blue-500'
            }`}
            strokeWidth={isSaved ? 2 : 1.8}
          />
        </motion.div>
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
          handleToggleSave()
        }}
        disabled={isLoading || !isAuthenticated}
        className={`flex items-center justify-center p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isSaved
            ? 'bg-blue-500/10 hover:bg-blue-500/20'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        } ${className}`}
        aria-label={isSaved ? 'Quitar de guardados' : 'Guardar publicación'}
      >
        <motion.div
          animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            className={`${iconSize} transition-colors ${
              isSaved
                ? 'fill-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-blue-500'
            }`}
            strokeWidth={isSaved ? 2 : 1.8}
          />
        </motion.div>
      </button>
    )
  }

  // Variante default - icono con estilo completo
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleToggleSave()
      }}
      disabled={isLoading || !isAuthenticated}
      className={`flex items-center gap-1 p-1 rounded-full transition border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        isSaved
          ? 'bg-blue-900 text-blue-400 border-blue-700'
          : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-800'
      } ${className}`}
      aria-label={isSaved ? 'Quitar de guardados' : 'Guardar publicación'}
      title={isSaved ? 'Quitar de guardados' : 'Guardar publicación'}
    >
      <motion.div
        animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          className={`${iconSize} transition-colors ${
            isSaved ? 'fill-blue-400' : 'fill-none'
          }`}
          strokeWidth={isSaved ? 2 : 1.8}
        />
      </motion.div>
    </button>
  )
}

