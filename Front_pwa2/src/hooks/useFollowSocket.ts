import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useFollowingContext } from '@/context/FollowingContext'
import { useAuth } from '@/context/AuthContext'

/**
 * Hook para manejar la conexión Socket.io y sincronización en tiempo real de follows
 * 
 * Características:
 * - Conecta automáticamente cuando hay un usuario autenticado
 * - Escucha eventos FOLLOW_UPDATED del servidor
 * - Actualiza el estado global del Context automáticamente
 * - Se desconecta cuando el usuario cierra sesión o el componente se desmonta
 * 
 * @example
 * ```tsx
 * function App() {
 *   useFollowSocket()
 *   return <YourApp />
 * }
 * ```
 */
export function useFollowSocket() {
  const { user, isAuthenticated } = useAuth()
  const { addFollowing, removeFollowing } = useFollowingContext()
  const socketRef = useRef<Socket | null>(null)
  const isConnectedRef = useRef(false)
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Solo conectar si hay usuario autenticado
    if (!isAuthenticated || !user?.id) {
      // Si ya hay una conexión, desconectarla
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
        currentUserIdRef.current = null
      }
      return
    }

    // IMPORTANTE: Si el userId cambió, desconectar el socket anterior primero
    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
      }
      currentUserIdRef.current = null
    }

    // Evitar múltiples conexiones para el mismo usuario
    if (isConnectedRef.current && socketRef.current?.connected && currentUserIdRef.current === user.id) {
      return
    }

    // Obtener URL del backend (debe coincidir con la configuración del backend)
    const getBackendUrl = () => {
      if (typeof window === 'undefined') return 'http://localhost:3000'
      
      // Intentar obtener desde variables de entorno
      const envUrl = process.env.NEXT_PUBLIC_API_URL
      if (envUrl) {
        // Remover /api del final si existe
        return envUrl.replace(/\/api$/, '')
      }

      // Fallback: detectar automáticamente
      const hostname = window.location.hostname
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
      
      if (isLocalhost) {
        return 'http://localhost:3000'
      } else {
        // En producción, usar el backend de Railway
        const protocol = window.location.protocol
        return `${protocol}//back-end-production-b33a.up.railway.app`
      }
    }

    const backendUrl = getBackendUrl()

    // Crear conexión Socket.io
    const socket = io(backendUrl, {
      auth: {
        userId: user.id
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000
    })

    socketRef.current = socket

    // Evento: Conexión exitosa
    socket.on('connect', () => {
      isConnectedRef.current = true
      currentUserIdRef.current = user.id
    })

    // Evento: Desconexión
    socket.on('disconnect', () => {
      isConnectedRef.current = false
    })

    // Evento: Error de conexión
    socket.on('connect_error', () => {
      isConnectedRef.current = false
    })

    // Evento: Reconexión exitosa
    socket.on('reconnect', () => {
      isConnectedRef.current = true
    })

    // Evento principal: Actualización de estado de seguimiento
    socket.on('FOLLOW_UPDATED', (data: {
      targetUserId: string
      isFollowing: boolean
      action: 'follow' | 'unfollow'
      timestamp: string
    }) => {
      // CRÍTICO: Validar que el evento es para el usuario actual
      if (currentUserIdRef.current !== user.id) {
        return
      }

      // Actualizar el estado global según la acción
      if (data.isFollowing) {
        // Usuario seguido - agregar al Context
        addFollowing(data.targetUserId)
      } else {
        // Usuario dejado de seguir - remover del Context
        removeFollowing(data.targetUserId)
      }

      // Opcional: Refrescar la lista completa desde el servidor para asegurar consistencia
      // (esto puede ser útil si hay datos adicionales que necesitan actualizarse)
      // refreshFollowing().catch(() => {
      //   // Si falla, el estado optimista ya está actualizado
      // })
    })

    // Cleanup al desmontar o cuando cambia el usuario
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
        currentUserIdRef.current = null
      }
    }
  }, [isAuthenticated, user?.id, addFollowing, removeFollowing])

  // Retornar el socket para uso avanzado si es necesario
  return socketRef.current
}

