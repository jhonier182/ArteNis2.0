import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, UserPlus, UserCheck, AlertCircle } from 'lucide-react'
import { apiClient } from '@/services/apiClient'

interface FollowButtonProps {
  /** ID del usuario objetivo a seguir/dejar de seguir */
  targetUserId: string
  /** Estado inicial de seguimiento (si el usuario actual ya sigue al objetivo) */
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

/**
 * Componente de botón "Seguir / Dejar de seguir" profesional con animaciones
 * 
 * Características:
 * - Animaciones suaves con framer-motion
 * - Estados de carga con spinner
 * - Manejo de errores con feedback visual
 * - Estilos tipo Instagram/X
 * - Integración completa con API backend
 * 
 * @example
 * ```tsx
 * <FollowButton
 *   targetUserId="user-123"
 *   initialFollowState={false}
 *   onFollowChange={(isFollowing) => console.log(isFollowing)}
 * />
 * ```
 */
export function FollowButton({
  targetUserId,
  initialFollowState = false,
  onFollowChange,
  size = 'md',
  className = '',
  showText = true
}: FollowButtonProps) {
  // Estado local del seguimiento
  const [isFollowing, setIsFollowing] = useState(initialFollowState)
  // Estado de carga durante la petición API
  const [isLoading, setIsLoading] = useState(false)
  // Estado de error para mostrar feedback
  const [error, setError] = useState<string | null>(null)

  // Sincronizar el estado local con el prop inicial cuando cambia
  useEffect(() => {
    setIsFollowing(initialFollowState)
  }, [initialFollowState])

  /**
   * Maneja el toggle de seguimiento (seguir/dejar de seguir)
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

    try {
      const client = apiClient.getClient()

      if (isFollowing) {
        // Acción: Dejar de seguir
        // Endpoint: DELETE /api/follow/:userId
        await client.delete(`/follow/${targetUserId}`)
        console.log('✅ Usuario dejado de seguir exitosamente')
        
        // Actualizar estado local
        const newState = false
        setIsFollowing(newState)
        
        // Notificar al componente padre
        onFollowChange?.(newState)
      } else {
        // Acción: Seguir usuario
        // Endpoint: POST /api/follow con body: { userId: targetUserId }
        await client.post('/follow', { userId: targetUserId })
        console.log('✅ Usuario seguido exitosamente')
        
        // Actualizar estado local
        const newState = true
        setIsFollowing(newState)
        
        // Notificar al componente padre
        onFollowChange?.(newState)
      }
    } catch (err: any) {
      console.error('❌ Error al cambiar estado de seguimiento:', err)
      
      // CASO ESPECIAL: 409 Conflict - Usuario ya seguido
      // No es un error fatal, solo sincronizamos el estado
      if (err.response?.status === 409) {
        console.log('🔄 409 Conflict: Usuario ya seguido, sincronizando estado...')
        
        // Sincronizar estado como "Siguiendo" sin mostrar error
        const newState = true
        setIsFollowing(newState)
        onFollowChange?.(newState)
        
        // No mostramos error, solo sincronizamos el estado
        setIsLoading(false)
        return
      }
      
      // Manejo de otros errores
      let errorMessage = 'Error al conectar con el servidor'
      
      if (err.response?.status === 404) {
        // 404: Usuario no encontrado (mensaje leve)
        errorMessage = 'Usuario no encontrado'
      } else if (err.response?.status === 401) {
        // 401: No autenticado
        errorMessage = 'Debes iniciar sesión para seguir usuarios'
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
        // Errores de red
        errorMessage = 'Error al conectar con el servidor'
      } else if (err.response?.data?.message) {
        // Mensaje personalizado del backend
        errorMessage = err.response.data.message
      }

      // Solo mostrar error si no es 409 (ya manejado arriba)
      setError(errorMessage)
      
      // Revertir estado local en caso de error (excepto 409 que ya está sincronizado)
      setIsFollowing(isFollowing)
      
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

