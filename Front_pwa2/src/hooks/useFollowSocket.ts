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
  const { addFollowing, removeFollowing, refreshFollowing } = useFollowingContext()
  const socketRef = useRef<Socket | null>(null)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    // Solo conectar si hay usuario autenticado
    if (!isAuthenticated || !user?.id) {
      // Si ya hay una conexión, desconectarla
      if (socketRef.current?.connected) {
        console.log('🔌 Desconectando socket: Usuario no autenticado')
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
      }
      return
    }

    // Evitar múltiples conexiones
    if (isConnectedRef.current && socketRef.current?.connected) {
      return
    }

    // Obtener URL del backend (debe coincidir con la configuración del backend)
    const getBackendUrl = () => {
      if (typeof window === 'undefined') return 'http://localhost:3000'
      
      // Intentar obtener desde variables de entorno o configuración
      const envUrl = process.env.NEXT_PUBLIC_API_URL
      if (envUrl) {
        // Remover /api del final si existe
        return envUrl.replace(/\/api$/, '')
      }

      // Detectar hostname actual para usar en desarrollo móvil
      const hostname = window.location.hostname
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const protocol = window.location.protocol
        return `${protocol}//${hostname}:3000`
      }

      return 'http://localhost:3000'
    }

    const backendUrl = getBackendUrl()
    console.log(`🔌 Conectando Socket.io a: ${backendUrl}`)

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
      console.log('✅ Socket.io conectado:', socket.id)
      isConnectedRef.current = true
    })

    // Evento: Desconexión
    socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket.io desconectado:', reason)
      isConnectedRef.current = false
    })

    // Evento: Error de conexión
    socket.on('connect_error', (error: Error) => {
      console.error('❌ Error conectando Socket.io:', error.message)
      isConnectedRef.current = false
    })

    // Evento: Reconexión exitosa
    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 Socket.io reconectado después de ${attemptNumber} intentos`)
      isConnectedRef.current = true
    })

    // Evento principal: Actualización de estado de seguimiento
    socket.on('FOLLOW_UPDATED', (data: {
      targetUserId: string
      isFollowing: boolean
      action: 'follow' | 'unfollow'
      timestamp: string
    }) => {
      console.log('📡 Evento FOLLOW_UPDATED recibido:', data)

      // Actualizar el estado global según la acción
      if (data.isFollowing) {
        // Usuario seguido - agregar al Context
        addFollowing(data.targetUserId)
        console.log(`✅ Sincronizado: Siguiendo a ${data.targetUserId}`)
      } else {
        // Usuario dejado de seguir - remover del Context
        removeFollowing(data.targetUserId)
        console.log(`✅ Sincronizado: Dejado de seguir a ${data.targetUserId}`)
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
        console.log('🔌 Desconectando socket: Cleanup')
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
      }
    }
  }, [isAuthenticated, user?.id, addFollowing, removeFollowing])

  // Retornar el socket para uso avanzado si es necesario
  return socketRef.current
}

