'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = storage.get<User>('user')
    const token = storage.get<string>('authToken')

    if (savedUser && token) {
      setUser(savedUser)
      apiClient.setAuthToken(token)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.getClient().post('/auth/login', {
        identifier: email, // El backend espera 'identifier' que puede ser email o username
        password,
      })

      // El backend devuelve { success, message, data: { user, token, refreshToken } }
      const responseData = response.data.data || response.data
      const { user: userData, token, refreshToken } = responseData

      apiClient.setAuthToken(token)
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken)
      }

      storage.set('user', userData)
      storage.set('authToken', token)

      setUser(userData)
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

      apiClient.setAuthToken(token)
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken)
      }

      storage.set('user', userData)
      storage.set('authToken', token)

      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = (): void => {
    storage.remove('user')
    storage.remove('authToken')
    storage.remove('refreshToken')
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

