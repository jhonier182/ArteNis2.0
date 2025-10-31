import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../context/UserContext'
import { useFollowing } from '../hooks/useFollowing'
import apiClient from '../services/apiClient'

interface FollowButtonProps {
  userId: string
  username?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  showText?: boolean
  className?: string
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({
  userId,
  username,
  size = 'md',
  variant = 'primary',
  showText = true,
  className = '',
  onFollowChange
}: FollowButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useUser()
  const { isFollowing: isFollowingUser, refreshFollowing } = useFollowing()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sincronizar el estado local con el hook global
  useEffect(() => {
    if (userId && isAuthenticated) {
      const isCurrentlyFollowing = isFollowingUser(userId)
      setIsFollowing(isCurrentlyFollowing)
    } else {
      setIsFollowing(false)
    }
  }, [userId, isAuthenticated, isFollowingUser])

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)
      
      if (isFollowing) {
        // Dejar de seguir
        console.log(`🔄 FollowButton: Intentando dejar de seguir usuario ${userId}`)
        await apiClient.delete(`/api/follow/${userId}`)
        console.log(`✅ FollowButton: Usuario dejado de seguir exitosamente`)
        setIsFollowing(false)
      } else {
        // Seguir
        console.log(`🔄 FollowButton: Intentando seguir usuario ${userId}`)
        await apiClient.post('/api/follow', { userId })
        console.log(`✅ FollowButton: Usuario seguido exitosamente`)
        setIsFollowing(true)
      }
      
      // Refrescar la lista global de usuarios seguidos
      await refreshFollowing()
      
      // Notificar al componente padre del cambio
      if (onFollowChange) {
        onFollowChange(isFollowing)
      }
      
    } catch (error: any) {
      console.error('❌ FollowButton: Error al cambiar seguimiento:', error)
      
      // Revertir el estado en caso de error
      setIsFollowing(!isFollowing)
      
      // Mostrar mensaje de error específico
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        console.error('❌ FollowButton: Error de conexión - el backend podría estar reiniciándose')
        // Podrías mostrar una notificación al usuario aquí
      } else if (error.response?.data?.message === 'No sigues a este usuario') {
        console.error('❌ FollowButton: Desincronización detectada - actualizando estado')
        // Si el backend dice que no sigues al usuario, actualizar el estado local
        setIsFollowing(false)
        // Refrescar el estado global para sincronizar
        await refreshFollowing()
      } else {
        console.error('❌ FollowButton: Error del servidor:', error.response?.data?.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Si no está autenticado, no mostrar el botón
  if (!isAuthenticated) {
    return null
  }

  // Si es el propio usuario, no mostrar el botón
  if (userId === 'current-user') {
    return null
  }

  // Configuración de estilos según el tamaño
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // Configuración de estilos según la variante
  const variantClasses = {
    primary: isFollowing 
      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
      : 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: isFollowing 
      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
      : 'bg-purple-100 hover:bg-purple-200 text-purple-800',
    outline: isFollowing 
      ? 'border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50' 
      : 'border border-purple-600 hover:border-purple-700 text-purple-600 hover:bg-purple-50'
  }

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          {showText && 'Cargando...'}
        </div>
      ) : (
        <div className="flex items-center">
          {isFollowing ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {showText && 'Siguiendo'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showText && 'Seguir'}
            </>
          )}
        </div>
      )}
    </button>
  )
}
