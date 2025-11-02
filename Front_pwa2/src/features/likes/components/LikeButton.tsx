'use client'

import { useState, useEffect, useMemo } from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiClient } from '@/services/apiClient'
import { useLikesContext } from '@/context/LikesContext'

export interface LikeButtonProps {
  /** ID del post */
  postId: string
  /** Estado inicial de si está liked (fallback si el Context aún no está cargado) */
  initialLiked?: boolean
  /** Contador inicial de likes (fallback si el Context aún no está cargado) */
  initialLikesCount?: number
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg'
  /** Si mostrar el contador de likes */
  showCount?: boolean
  /** Clases CSS adicionales */
  className?: string
  /** Callback cuando el like cambia */
  onToggle?: (liked: boolean, likesCount: number) => void
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'icon-only'
}

/**
 * Componente de botón de like totalmente sincronizado globalmente
 * 
 * Características:
 * - Estado sincronizado en toda la aplicación (Context API)
 * - Actualizaciones optimistas (UI inmediata)
 * - Sincronización en tiempo real con Socket.io
 * - Animaciones suaves con framer-motion
 * - Estados de carga con feedback visual
 * - Persistencia entre navegaciones
 * 
 * El estado se mantiene sincronizado automáticamente:
 * - Si das like en el feed, aparece como "Liked" en el detalle del post
 * - Si quitas like en el detalle, se actualiza en el feed
 * - El estado persiste al navegar entre páginas
 * 
 * @example
 * ```tsx
 * <LikeButton
 *   postId="post-123"
 *   initialLiked={post.isLiked}
 *   initialLikesCount={post.likesCount}
 *   onToggle={(liked, count) => console.log('Like:', liked, count)}
 * />
 * ```
 */
export function LikeButton({
  postId,
  initialLiked = false,
  initialLikesCount = 0,
  size = 'md',
  showCount = true,
  className = '',
  onToggle,
  variant = 'default'
}: LikeButtonProps) {
  // Context global de likes (sincronización automática)
  const { getLikeInfo, addLike, removeLike, isLoading: contextLoading } = useLikesContext()
  
  // Estado de carga local durante la petición API
  const [isLoading, setIsLoading] = useState(false)

  // Obtener estado de like desde el Context (fuente de verdad)
  // Si el Context aún está cargando, usar el estado inicial como fallback
  const likeInfo = useMemo(() => {
    if (!contextLoading) {
      const info = getLikeInfo(postId)
      if (info) {
        return { isLiked: info.isLiked, likesCount: info.likesCount }
      }
    }
    return { isLiked: initialLiked, likesCount: initialLikesCount }
  }, [getLikeInfo, postId, contextLoading, initialLiked, initialLikesCount])

  const isLiked = likeInfo.isLiked
  const likesCount = likeInfo.likesCount

  // Actualizar callback cuando cambia el estado
  useEffect(() => {
    if (!contextLoading) {
      onToggle?.(isLiked, likesCount)
    }
  }, [isLiked, likesCount, contextLoading, onToggle])

  /**
   * Maneja el toggle de like (dar like / quitar like)
   * 
   * Implementa patrón de actualización optimista:
   * 1. Actualiza UI inmediatamente (Context global)
   * 2. Realiza petición al servidor
   * 3. Si falla, revierte el cambio
   */
  const handleToggleLike = async () => {
    // Evitar múltiples clics mientras está cargando
    if (isLoading) return

    setIsLoading(true)

    // Guardar estado anterior para posible reversión
    const previousLiked = isLiked
    const previousLikesCount = likesCount

    try {
      const client = apiClient.getClient()

      if (isLiked) {
        // ACTUALIZACIÓN OPTIMISTA: Remover like inmediatamente
        removeLike(postId, Math.max(0, likesCount - 1))
        console.log('🔄 Actualización optimista: Removiendo like')

        // Acción: Quitar like
        await client.post(`/posts/${postId}/like`)
        console.log('✅ Like removido exitosamente')
        
        // El estado ya fue actualizado optimistamente, solo notificar
        onToggle?.(false, Math.max(0, likesCount - 1))
      } else {
        // ACTUALIZACIÓN OPTIMISTA: Agregar like inmediatamente
        addLike(postId, likesCount + 1)
        console.log('🔄 Actualización optimista: Agregando like')

        // Acción: Dar like
        await client.post(`/posts/${postId}/like`)
        console.log('✅ Like agregado exitosamente')
        
        // El estado ya fue actualizado optimistamente, solo notificar
        onToggle?.(true, likesCount + 1)
      }
    } catch (err: unknown) {
      console.error('❌ Error al cambiar estado de like:', err)
      
      // REVERTIR: Deshacer actualización optimista en caso de error
      if (previousLiked) {
        // Si estaba liked y falló al quitar, volver a agregar
        addLike(postId, previousLikesCount)
      } else {
        // Si no estaba liked y falló al agregar, remover
        removeLike(postId, previousLikesCount)
      }

      onToggle?.(previousLiked, previousLikesCount)
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
          handleToggleLike()
        }}
        disabled={isLoading}
        className={`flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={isLiked ? 'Quitar like' : 'Dar like'}
      >
        <motion.div
          animate={isLiked ? { scale: [1, 1.2, 1] } : {}} 
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`${iconSize} transition-colors ${
              isLiked
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-500'
            }`}
          />
        </motion.div>
      </button>
    )
  }

  // Variante icon-only - solo icono sin contador
  if (variant === 'icon-only') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggleLike()
        }}
        disabled={isLoading}
        className={`flex items-center justify-center p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isLiked
            ? 'bg-red-500/10 hover:bg-red-500/20'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        } ${className}`}
        aria-label={isLiked ? 'Quitar like' : 'Dar like'}
      >
        <motion.div
          animate={isLiked ? { scale: [1, 1.3, 1] } : {}} 
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`${iconSize} transition-colors ${
              isLiked
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-500'
            }`}
          />
        </motion.div>
      </button>
    )
  }

  // Variante default - icono con contador
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleToggleLike()
      }}
      disabled={isLoading}
      className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      } ${className}`}
      aria-label={isLiked ? 'Quitar like' : 'Dar like'}
    >
      <motion.div
        animate={isLiked ? { scale: [1, 1.3, 1] } : {}} 
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`${iconSize} transition-colors ${
            isLiked
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      </motion.div>
      {showCount && (
        <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
          {likesCount > 0 ? likesCount.toLocaleString() : 'Me gusta'}
        </span>
      )}
    </button>
  )
}

