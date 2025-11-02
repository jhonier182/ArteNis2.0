import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useLikesContext } from '@/context/LikesContext'
import { useAuth } from '@/context/AuthContext'

/**
 * Hook para manejar la conexión Socket.io y sincronización en tiempo real de likes
 * 
 * Características:
 * - Conecta automáticamente cuando hay un usuario autenticado
 * - Escucha eventos LIKE_UPDATED del servidor
 * - Actualiza el estado global del Context automáticamente
 * - Se desconecta cuando el usuario cierra sesión o el componente se desmonta
 * 
 * @example
 * ```tsx
 * function App() {
 *   useLikeSocket()
 *   return <YourApp />
 * }
 * ```
 */
export function useLikeSocket() {
  const { user, isAuthenticated } = useAuth()
  const { updateLikeInfo, getLikeInfo } = useLikesContext()
  const socketRef = useRef<Socket | null>(null)
  const isConnectedRef = useRef(false)
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Solo conectar si hay usuario autenticado
    if (!isAuthenticated || !user?.id) {
      // Si ya hay una conexión, desconectarla
      if (socketRef.current?.connected) {
        console.log('🔌 Desconectando socket de likes: Usuario no autenticado')
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
        currentUserIdRef.current = null
      }
      return
    }

    // IMPORTANTE: Si el userId cambió, desconectar el socket anterior primero
    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      console.log(`🔄 Usuario cambió de ${currentUserIdRef.current} a ${user.id}, reconectando socket de likes...`)
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
      }
      currentUserIdRef.current = null
    }

    // Evitar múltiples conexiones para el mismo usuario
    // Reutilizar el socket existente si ya está conectado para follows
    // (compartimos la misma conexión Socket.io)
    if (isConnectedRef.current && socketRef.current?.connected && currentUserIdRef.current === user.id) {
      console.log('🔌 Socket de likes ya conectado para este usuario')
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
    console.log(`🔌 Conectando Socket.io para likes a: ${backendUrl}`)

    // Crear conexión Socket.io (o reutilizar si ya existe)
    // NOTA: Podríamos reutilizar el socket de useFollowSocket, pero por ahora creamos uno nuevo
    // En el futuro se puede optimizar para compartir una sola conexión
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
      console.log(`✅ Socket.io conectado para likes: ${socket.id} para usuario: ${user.id}`)
      isConnectedRef.current = true
      currentUserIdRef.current = user.id
    })

    // Evento: Desconexión
    socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket.io de likes desconectado:', reason)
      isConnectedRef.current = false
    })

    // Evento: Error de conexión
    socket.on('connect_error', (error: Error) => {
      console.error('❌ Error conectando Socket.io de likes:', error.message)
      isConnectedRef.current = false
    })

    // Evento: Reconexión exitosa
    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 Socket.io de likes reconectado después de ${attemptNumber} intentos`)
      isConnectedRef.current = true
    })

    // Evento principal: Actualización de estado de likes
    socket.on('LIKE_UPDATED', (data: {
      postId: string
      isLiked: boolean
      likesCount: number
      action: 'like' | 'unlike'
      timestamp: string
    }) => {
      console.log('📡 Evento LIKE_UPDATED recibido:', data)

      // IMPORTANTE: Actualizar el estado siempre, sin importar quién hizo el like
      // Esto permite que el contador de likes se actualice en tiempo real para todos
      // los usuarios que están viendo el post, no solo para quien hizo el like
      
      // Obtener el estado actual del post si existe
      const currentInfo = getLikeInfo(data.postId)
      
      // Actualizar el estado global con la información del servidor
      // Si el evento es para este usuario (isLiked cambió), actualizar ambos campos
      // Si el evento es para otro usuario (solo cambió el contador), mantener isLiked actual y actualizar likesCount
      if (currentInfo) {
        // Si el usuario actual ya tiene estado para este post, mantener su isLiked
        // pero actualizar el contador
        updateLikeInfo(data.postId, currentInfo.isLiked, data.likesCount)
      } else {
        // Si no hay estado previo, usar los datos del evento
        updateLikeInfo(data.postId, data.isLiked, data.likesCount)
      }
      
      console.log(`✅ Sincronizado: Post ${data.postId} - Likes: ${data.likesCount}`)
    })

    // Cleanup al desmontar o cuando cambia el usuario
    return () => {
      if (socketRef.current?.connected) {
        console.log('🔌 Desconectando socket de likes: Cleanup')
        socketRef.current.disconnect()
        socketRef.current = null
        isConnectedRef.current = false
        currentUserIdRef.current = null
      }
    }
  }, [isAuthenticated, user?.id, updateLikeInfo, getLikeInfo])

  // Retornar el socket para uso avanzado si es necesario
  return socketRef.current
}

