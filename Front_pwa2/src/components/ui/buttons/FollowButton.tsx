import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, UserPlus, UserCheck, AlertCircle } from 'lucide-react'
import { apiClient } from '@/services/apiClient'
import { useFollowingContext } from '@/context/FollowingContext'

export interface FollowButtonProps {
  /** ID del usuario objetivo a seguir/dejar de seguir */
  targetUserId: string
  /** Datos opcionales del usuario (para actualización optimista) */
  userData?: {
    username?: string
    fullName?: string
    avatar?: string
    isVerified?: boolean
  }
  /** Estado inicial de seguimiento (fallback si el Context aún no está cargado) */
  initialFollowState?: boolean
  /** Callback opcional que se ejecuta cuando cambia el estado de seguimiento */
  onFollowChange?: (isFollowing: boolean) => void
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg'
  /** Clase CSS adicional */
  className?: string
  /** Mostrar texto en el botón */
  showText?: boolean
}


export function FollowButton({
  targetUserId,
  userData,
  initialFollowState = false,
  onFollowChange,
  size = 'md',
  className = '',
  showText = true
}: FollowButtonProps) {
  // Context global de usuarios seguidos (sincronización automática)
  const { isFollowing: isFollowingGlobal, addFollowing, removeFollowing, isLoading: contextLoading } = useFollowingContext()
  
  // Estado de carga local durante la petición API
  const [isLoading, setIsLoading] = useState(false)
  // Estado de error para mostrar feedback
  const [error, setError] = useState<string | null>(null)

  // Obtener estado de seguimiento desde el Context (fuente de verdad)
  // Si el Context aún está cargando, usar el estado inicial como fallback
  const isFollowing = useMemo(() => {
    if (!contextLoading) {
      return isFollowingGlobal(targetUserId)
    }
    return initialFollowState
  }, [isFollowingGlobal, targetUserId, contextLoading, initialFollowState])

  // Actualizar callback cuando cambia el estado
  useEffect(() => {
    if (!contextLoading) {
      onFollowChange?.(isFollowing)
    }
  }, [isFollowing, contextLoading, onFollowChange])

  /**
   * Maneja el toggle de seguimiento (seguir/dejar de seguir)
   * 
   * Implementa patrón de actualización optimista:
   * 1. Actualiza UI inmediatamente (Context global)
   * 2. Realiza petición al servidor
   * 3. Si falla, revierte el cambio
   * 
   * Lógica de manejo de errores:
   * - 409 Conflict → No es error fatal, sincroniza estado como "Siguiendo"
   * - 404 Not Found → Muestra mensaje leve "Usuario no encontrado"
   * - Otros errores → Muestra mensaje genérico "Error al conectar con el servidor"
   */
  const handleFollowToggle = async () => {
    // Evitar múltiples clics mientras está cargando
    if (isLoading) return

    // Limpiar error previo al iniciar nueva acción
    setError(null)
    setIsLoading(true)

    // Guardar estado anterior para posible reversión
    const previousState = isFollowing

    try {
      const client = apiClient.getClient()

      if (isFollowing) {
        // ACTUALIZACIÓN OPTIMISTA: Remover del Context inmediatamente
        removeFollowing(targetUserId)
      

        // Acción: Dejar de seguir
        // Endpoint: DELETE /api/follow/:userId
        await client.delete(`/follow/${targetUserId}`)
          
        
        // El estado ya fue actualizado optimistamente, solo notificar
        onFollowChange?.(false)
      } else {
        // ACTUALIZACIÓN OPTIMISTA: Agregar al Context inmediatamente
        if (userData) {
          addFollowing(targetUserId, {
            id: targetUserId,
            username: userData.username || '',
            fullName: userData.fullName || userData.username || '',
            avatar: userData.avatar,
            isVerified: userData.isVerified
          })
        } else {
          // Si no tenemos datos completos, solo agregar el ID
          addFollowing(targetUserId)
        }

        // Acción: Seguir usuario
        // Endpoint: POST /api/follow con body: { userId: targetUserId }
        await client.post('/follow', { userId: targetUserId })
        
        
        // El estado ya fue actualizado optimistamente, solo notificar
        onFollowChange?.(true)
      }
    } catch (err: unknown) {
    
      
      const error = err as { response?: { status?: number; data?: { message?: string } }; code?: string }
      
      // CASO ESPECIAL: 409 Conflict - Usuario ya seguido
      // No es un error fatal, solo sincronizamos el estado
      if (error.response?.status === 409) {

        
        // Asegurar que esté en el Context como "Siguiendo"
        if (!previousState) {
          if (userData) {
            addFollowing(targetUserId, {
              id: targetUserId,
              username: userData.username || '',
              fullName: userData.fullName || userData.username || '',
              avatar: userData.avatar,
              isVerified: userData.isVerified
            })
          } else {
            addFollowing(targetUserId)
          }
        }
        
        onFollowChange?.(true)
        setIsLoading(false)
       
      }
      
      // CASO ESPECIAL: 404 Not Found - Al intentar dejar de seguir significa que no lo estás siguiendo
      // Simplemente establecer el estado a "no seguido" (false)
      if (error.response?.status === 404 && previousState) {
       
        
        // Asegurar que NO esté en el Context
        removeFollowing(targetUserId)
        
        onFollowChange?.(false)
        setIsLoading(false)
        
      }
      
      // REVERTIR: Deshacer actualización optimista en caso de otros errores
      if (previousState) {
        // Si estaba siguiendo y falló al dejar de seguir, volver a agregar
        if (userData) {
          addFollowing(targetUserId, {
            id: targetUserId,
            username: userData.username || '',
            fullName: userData.fullName || userData.username || '',
            avatar: userData.avatar,
            isVerified: userData.isVerified
          })
        } else {
          addFollowing(targetUserId)
        }
      } else {
        // Si no estaba siguiendo y falló al seguir, remover
        removeFollowing(targetUserId)
      }
      
      // Manejo de otros errores
      let errorMessage = 'Error al conectar con el servidor'
      
      if (error.response?.status === 404) {
        // 404: Usuario no encontrado (mensaje leve)
        errorMessage = 'Usuario no encontrado'
      } else if (error.response?.status === 401) {
        // 401: No autenticado
        errorMessage = 'Debes iniciar sesión para seguir usuarios'
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        // Errores de red
        errorMessage = 'Error al conectar con el servidor'
      } else if (error.response?.data?.message) {
        // Mensaje personalizado del backend
        errorMessage = error.response.data.message
      }

      setError(errorMessage)
      onFollowChange?.(previousState)
      
      // Auto-ocultar error después de 3 segundos
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-xs',
      icon: 'w-3.5 h-3.5'
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  }

  const currentSize = sizeConfig[size]

  // Estilos según el estado
  const getButtonStyles = () => {
    if (isFollowing) {
      // Estado: Siguiendo → Botón gris oscuro (tipo X/Instagram)
      return 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
    } else {
      // Estado: Seguir → Botón azul (tipo Instagram)
      return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`
          ${currentSize.padding}
          ${currentSize.text}
          ${getButtonStyles()}
          rounded-2xl
          font-medium
          transition-all
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:ring-offset-2
          focus:ring-offset-[#0f1419]
          ${isLoading ? 'opacity-70 cursor-wait' : 'opacity-100 cursor-pointer'}
          disabled:cursor-wait
          ${!isLoading ? 'hover:scale-105' : 'hover:scale-100'}
          active:scale-95
          flex
          items-center
          justify-center
          gap-2
          ${className}
        `}
        whileHover={isLoading ? {} : { scale: 1.05 }}
        whileTap={isLoading ? {} : { scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {/* Contenido del botón con animación */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            // Estado: Cargando → Mostrar spinner
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className={`${currentSize.icon} animate-spin`} />
              {showText && <span>Cargando...</span>}
            </motion.div>
          ) : isFollowing ? (
            // Estado: Siguiendo → Ícono de check
            <motion.div
              key="following"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <UserCheck className={currentSize.icon} />
              {showText && <span>Siguiendo</span>}
            </motion.div>
          ) : (
            // Estado: Seguir → Ícono de plus
            <motion.div
              key="follow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <UserPlus className={currentSize.icon} />
              {showText && <span>Seguir</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mensaje de error leve (aparece bajo el botón, no como tooltip rojo) */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-center"
          >
            <div className="text-red-400 text-xs flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

