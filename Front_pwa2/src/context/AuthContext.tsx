'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import { storage } from '@/utils/storage'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  userType?: 'user' | 'artist'
  fullName?: string
  city?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const checkingRef = useRef(false) // Prevenir verificaciones duplicadas simultáneas

  useEffect(() => {
    // Verificar si hay sesión guardada y validar con el servidor
    const checkAuthStatus = async () => {
      // Evitar verificaciones duplicadas simultáneas (útil en StrictMode)
      if (checkingRef.current) {
        return
      }

      try {
        checkingRef.current = true
        const savedUser = storage.get<User>('user')
        // El token se guarda como string plano en localStorage, no como JSON
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken') 
          : null

        if (savedUser && token) {
          // Configurar el token en el cliente
          apiClient.setAuthToken(token)
          
          // Restaurar el usuario desde el storage inmediatamente para evitar redirección
          setUser(savedUser)
          
          try {
            // Verificar que el token sigue siendo válido con el servidor
            // Esto se hace en segundo plano, sin bloquear la UI
            const { profileService } = await import('@/features/profile/services/profileService')
            const currentProfile = await profileService.getCurrentProfile()
            
            // Actualizar el usuario con los datos más recientes del servidor
            const updatedUser: User = {
              id: currentProfile.id,
              username: currentProfile.username,
              email: currentProfile.email || savedUser.email || '',
              avatar: currentProfile.avatar,
              bio: currentProfile.bio,
              userType: currentProfile.userType || savedUser.userType || 'user',
              fullName: currentProfile.fullName,
              city: currentProfile.city,
            }
            setUser(updatedUser)
            // Actualizar también en el storage
            storage.set('user', updatedUser)
          } catch (error) {
            // Solo limpiar si es un error de autenticación (401), no errores de red u otros
            const axiosError = error as AxiosError
            const isAuthError = axiosError.response?.status === 401 || axiosError.response?.status === 403
            if (isAuthError) {
              console.error('Token inválido, limpiando sesión:', axiosError)
              storage.remove('user')
              storage.remove('authToken')
              if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken')
                localStorage.removeItem('refreshToken')
              }
              setUser(null)
            } else {
              // Si es un error de red u otro error, mantener la sesión local
              console.warn('Error al verificar perfil (no crítico):', error)
              // Mantener el usuario guardado en storage
            }
          }
        } else {
          // No hay token o usuario guardado, limpiar todo por seguridad
          storage.remove('user')
          storage.remove('authToken')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
          }
          setUser(null)
        }
      } catch (error) {
        console.error('Error en checkAuthStatus:', error)
        // Solo limpiar si realmente no hay datos guardados
        const savedUser = storage.get<User>('user')
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken') 
          : null
        if (!savedUser || !token) {
          storage.remove('user')
          storage.remove('authToken')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
          }
          setUser(null)
        }
      } finally {
        setIsLoading(false)
        checkingRef.current = false
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.getClient().post('/auth/login', {
        identifier: email, // El backend espera 'identifier' que puede ser email o username
        password,
      })

      // El backend devuelve { success, message, data: { user, token, refreshToken } }
      const responseData = response.data.data || response.data
      const { user: userData, token: rawToken, refreshToken: rawRefreshToken } = responseData

      // Limpiar y validar el token antes de guardarlo
      if (!rawToken || typeof rawToken !== 'string') {
        throw new Error('Token inválido recibido del servidor')
      }
      
      const token = rawToken.trim()
      const refreshToken = rawRefreshToken ? rawRefreshToken.trim() : null

      // Validar que el token tiene el formato correcto (JWT típicamente tiene 3 partes separadas por puntos)
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('Token recibido no tiene formato JWT válido:', token.substring(0, 50))
        throw new Error('Formato de token inválido')
      }

      console.log('✅ Token válido recibido, longitud:', token.length)

      // Guardar token tanto en localStorage directamente (para apiClient) como en storage
      apiClient.setAuthToken(token)
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken)
      }
      
      // Guardar token directamente en localStorage (string plano) para apiClient
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
      }
      
      // También guardar en storage para consistencia
      storage.set('user', userData)
      // NO usar storage.set('authToken', token) porque añade comillas (JSON.stringify)
      // El token ya se guardó directamente en localStorage arriba con localStorage.setItem

      // Actualizar estado del usuario
      setUser({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio,
        userType: userData.userType,
        fullName: userData.fullName,
        city: userData.city,
      })
    } catch (error) {
      throw error
    }
  }

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await apiClient.getClient().post('/auth/register', {
        username,
        email,
        password,
        fullName: username, // El backend requiere fullName
        userType: 'user', // Por defecto es 'user'
      })

      // El backend devuelve { success, message, data: { user, token, refreshToken } }
      const responseData = response.data.data || response.data
      const { user: userData, token, refreshToken } = responseData

      // Guardar token tanto en localStorage directamente (para apiClient) como en storage
      apiClient.setAuthToken(token)
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken)
      }
      
      // Guardar token directamente en localStorage (string plano) para apiClient
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
      }
      
      // También guardar en storage para consistencia
      storage.set('user', userData)
      // NO usar storage.set('authToken', token) porque añade comillas (JSON.stringify)
      // El token ya se guardó directamente en localStorage arriba con localStorage.setItem

      // Actualizar estado del usuario
      setUser({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio,
        userType: userData.userType,
        fullName: userData.fullName,
        city: userData.city,
      })
    } catch (error) {
      throw error
    }
  }

  const logout = (): void => {
    storage.remove('user')
    storage.remove('authToken')
    storage.remove('refreshToken')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    }
    apiClient.setAuthToken('')
    setUser(null)
  }

  const updateUser = (userData: Partial<User>): void => {
    if (!user) return
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    storage.set('user', updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

