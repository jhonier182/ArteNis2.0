'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { FollowingProvider } from '@/context/FollowingContext'
import { SocketProvider } from './SocketProvider'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers globales de la aplicación
 * 
 * Orden de providers (de afuera hacia adentro):
 * - ThemeProvider: Maneja tema claro/oscuro
 * - AuthProvider: Maneja autenticación y usuario actual
 * - FollowingProvider: Maneja estado global de usuarios seguidos (debe estar dentro de AuthProvider)
 * - SocketProvider: Inicializa Socket.io para sincronización en tiempo real
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FollowingProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </FollowingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

