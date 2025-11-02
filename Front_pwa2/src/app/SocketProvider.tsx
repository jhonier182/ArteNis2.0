'use client'

import { ReactNode } from 'react'
import { useFollowSocket } from '@/hooks/useFollowSocket'
import { useLikeSocket } from '@/hooks/useLikeSocket'

interface SocketProviderProps {
  children: ReactNode
}

/**
 * Provider que inicializa la conexión Socket.io para sincronización en tiempo real
 * 
 * Este componente debe estar dentro de AuthProvider, FollowingProvider y LikesProvider
 * para tener acceso al usuario autenticado y al estado de follows y likes
 */
export function SocketProvider({ children }: SocketProviderProps) {
  // Inicializar los sockets - se conectan automáticamente cuando hay usuario
  useFollowSocket()
  useLikeSocket()

  return <>{children}</>
}

