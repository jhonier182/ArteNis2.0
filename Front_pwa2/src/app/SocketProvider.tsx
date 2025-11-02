'use client'

import { ReactNode } from 'react'
import { useFollowSocket } from '@/hooks/useFollowSocket'

interface SocketProviderProps {
  children: ReactNode
}

/**
 * Provider que inicializa la conexión Socket.io para sincronización en tiempo real
 * 
 * Este componente debe estar dentro de AuthProvider y FollowingProvider
 * para tener acceso al usuario autenticado y al estado de follows
 */
export function SocketProvider({ children }: SocketProviderProps) {
  // Inicializar el socket - se conecta automáticamente cuando hay usuario
  useFollowSocket()

  return <>{children}</>
}

