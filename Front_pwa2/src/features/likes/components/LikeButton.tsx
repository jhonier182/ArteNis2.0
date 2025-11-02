'use client'

import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLikePost } from '../hooks/useLikePost'

export interface LikeButtonProps {
  /** ID del post */
  postId: string
  /** Estado inicial de si está liked */
  initialLiked?: boolean
  /** Contador inicial de likes */
  initialLikesCount?: number
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg'
  /** Si mostrar el contador de likes */
  showCount?: boolean
  /** Clases CSS adicionales */
  className?: string
  /** Callback cuando el like cambia */
  onToggle?: (liked: boolean, likesCount: number) => void
  /** Si debe auto-fetchear la información */
  autoFetch?: boolean
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'icon-only'
}

/**
 * Componente de botón de like reutilizable con animación y estado optimista
 * 
 * @example
 * ```tsx
 * <LikeButton
 *   postId={post.id}
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
  autoFetch = false,
  variant = 'default'
}: LikeButtonProps) {
  const { isLiked, likesCount, isLoading, toggleLike } = useLikePost(
    postId,
    initialLiked,
    initialLikesCount,
    {
      autoFetch,
      onToggle: (result) => {
        onToggle?.(result.liked, result.likesCount)
      }
    }
  )

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
          toggleLike()
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
          toggleLike()
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
        toggleLike()
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

