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
        setIsLoading(true)
        
        // El token se guarda como string plano en localStorage, no como JSON
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken') 
          : null

        // CRÍTICO: Si no hay token, limpiar todo inmediatamente
        if (!token) {
          console.log('🔐 No hay token, limpiando sesión')
          storage.remove('user')
          storage.remove('authToken')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            // También limpiar caché de follows si existe
            localStorage.removeItem('following_users_cache')
            localStorage.removeItem('following_users_cache_timestamp')
          }
          setUser(null)
          setIsLoading(false)
          checkingRef.current = false
          return
        }

        // Validar formato básico del token
        const cleanToken = token.trim()
        if (!cleanToken.includes('.') || cleanToken.split('.').length !== 3) {
          console.error('❌ Token inválido, limpiando sesión')
          storage.remove('user')
          storage.remove('authToken')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('following_users_cache')
            localStorage.removeItem('following_users_cache_timestamp')
          }
          setUser(null)
          setIsLoading(false)
          checkingRef.current = false
          return
        }

        // Configurar el token en el cliente ANTES de hacer la petición
        apiClient.setAuthToken(cleanToken)
        
        // Obtener usuario guardado como fallback en caso de error de red
        const savedUser = storage.get<User>('user')
        
        // Verificar que el token es válido y obtener el usuario del servidor
        try {
          const { profileService } = await import('@/features/profile/services/profileService')
          const currentProfile = await profileService.getCurrentProfile()
          
          // VALIDACIÓN CRÍTICA: Verificar que el usuario del servidor coincide con el token
          // Decodificar el token JWT (solo lectura del payload, sin verificación)
          try {
            // JWT tiene formato: header.payload.signature
            const parts = cleanToken.split('.')
            if (parts.length === 3) {
              // Decodificar el payload (segunda parte) que está en Base64URL
              const payloadBase64 = parts[1]
              // Agregar padding si es necesario para Base64
              const padding = payloadBase64.length % 4
              const paddedBase64 = padding ? payloadBase64 + '='.repeat(4 - padding) : payloadBase64
              
              // Reemplazar caracteres Base64URL a Base64 estándar
              const base64 = paddedBase64.replace(/-/g, '+').replace(/_/g, '/')
              
              try {
                const payloadJson = atob(base64)
                const decoded = JSON.parse(payloadJson) as { id?: string } | null
                
                if (decoded?.id && decoded.id !== currentProfile.id) {
                  console.error(`❌ INCONSISTENCIA CRÍTICA DETECTADA:`)
                  console.error(`   - Token ID: ${decoded.id}`)
                  console.error(`   - Usuario servidor: ${currentProfile.id}`)
                  console.error(`   - Usuario servidor username: ${currentProfile.username}`)
                  console.error(`   - Token usado: ${cleanToken.substring(0, 50)}...`)
                  console.error(`   - Esto significa que el token no corresponde al usuario actual`)
                  console.error(`   - Limpiando sesión completa por seguridad`)
                  
                  // Limpiar todo
                  storage.remove('user')
                  storage.remove('authToken')
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('following_users_cache')
                    localStorage.removeItem('following_users_cache_timestamp')
                  }
                  apiClient.setAuthToken('')
                  setUser(null)
                  setIsLoading(false)
                  checkingRef.current = false
                  
                  // Mostrar alerta al usuario (opcional)
                  if (typeof window !== 'undefined') {
                    console.warn('⚠️ Tu sesión ha sido invalidada por inconsistencia de seguridad. Por favor, inicia sesión nuevamente.')
                  }
                  
                  return
                }
              } catch (parseError) {
                console.warn('⚠️ No se pudo parsear el payload del token:', parseError)
              }
            }
          } catch (jwtError) {
            console.warn('⚠️ No se pudo decodificar el token para validación (no crítico):', jwtError)
          }
          
          // Usuario validado correctamente - actualizar estado y storage
          const validatedUser: User = {
            id: currentProfile.id,
            username: currentProfile.username,
            email: currentProfile.email || '',
            avatar: currentProfile.avatar,
            bio: currentProfile.bio,
            userType: currentProfile.userType || 'user',
            fullName: currentProfile.fullName,
            city: currentProfile.city,
          }
          
          // Actualizar el estado y storage con el usuario validado del servidor
          setUser(validatedUser)
          storage.set('user', validatedUser)
          
          console.log(`✅ Sesión validada - Usuario: ${validatedUser.username} (${validatedUser.id})`)
          
        } catch (error) {
          // Manejar errores de forma inteligente
          const axiosError = error as AxiosError
          const status = axiosError.response?.status
          const isAuthError = status === 401 || status === 403
          const isNetworkError = !axiosError.response || axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT'
          
          console.log(`🔍 Error durante validación de sesión:`, {
            status,
            code: axiosError.code,
            message: axiosError.message,
            isAuthError,
            isNetworkError,
            hasSavedUser: !!savedUser
          })
          
          if (isAuthError) {
            // SOLO limpiar si es error de autenticación real
            console.error(`❌ Error de autenticación (${status}), limpiando sesión`)
            storage.remove('user')
            storage.remove('authToken')
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('following_users_cache')
              localStorage.removeItem('following_users_cache_timestamp')
            }
            apiClient.setAuthToken('')
            setUser(null)
          } else if (isNetworkError) {
            // Error de red: Usar usuario guardado como fallback temporal (NO limpiar token)
            console.warn('⚠️ Error de red al validar sesión, usando usuario guardado como fallback')
            
            if (savedUser) {
              // Validar que el usuario guardado tiene el mismo ID que el token
              try {
                const parts = cleanToken.split('.')
                if (parts.length === 3) {
                  const payloadBase64 = parts[1]
                  const padding = payloadBase64.length % 4
                  const paddedBase64 = padding ? payloadBase64 + '='.repeat(4 - padding) : payloadBase64
                  const base64 = paddedBase64.replace(/-/g, '+').replace(/_/g, '/')
                  const payloadJson = atob(base64)
                  const decoded = JSON.parse(payloadJson) as { id?: string } | null
                  
                  if (decoded?.id && decoded.id === savedUser.id) {
                    // El usuario guardado coincide con el token → Usar como fallback
                    setUser(savedUser)
                    console.log(`✅ Usando usuario guardado como fallback: ${savedUser.username} (${savedUser.id})`)
                  } else {
                    // Inconsistencia: pero NO limpiar el token, solo no mostrar usuario
                    console.error('❌ Usuario guardado no coincide con token (no crítico)')
                    setUser(null)
                  }
                } else {
                  // Token malformado pero existe → Usar usuario guardado
                  setUser(savedUser)
                }
              } catch (decodeError) {
                // Si no se puede decodificar, usar el usuario guardado de forma condicional
                console.warn('⚠️ No se pudo validar token, usando usuario guardado condicionalmente')
                setUser(savedUser)
              }
            } else {
              // No hay usuario guardado, pero no limpiar token por error de red
              console.warn('⚠️ Error de red y no hay usuario guardado, manteniendo token')
              setUser(null)
            }
          } else {
            // Otro tipo de error (500, 404, etc.): NO limpiar token, solo no mostrar usuario
            console.warn(`⚠️ Error inesperado validando sesión (${status || 'unknown'}):`, axiosError.message)
            console.warn('⚠️ NO se limpia el token por este tipo de error, solo no se muestra usuario')
            // Mantener el token en localStorage, no limpiarlo
            if (savedUser) {
              setUser(savedUser)
            } else {
              setUser(null)
            }
          }
        }
      } catch (error) {
        // Error crítico fuera del try/catch de validación
        console.error('❌ Error crítico en checkAuthStatus:', error)
        
        // Solo limpiar si realmente no hay token guardado
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken') 
          : null
        
        if (!token) {
          // No hay token → Limpiar todo
          storage.remove('user')
          storage.remove('authToken')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('following_users_cache')
            localStorage.removeItem('following_users_cache_timestamp')
          }
          apiClient.setAuthToken('')
          setUser(null)
        } else {
          // Hay token → Intentar usar usuario guardado como fallback
          const savedUser = storage.get<User>('user')
          if (savedUser) {
            console.warn('⚠️ Error crítico pero hay token, usando usuario guardado como fallback')
            setUser(savedUser)
          } else {
            console.warn('⚠️ Error crítico pero hay token, no se limpia para evitar pérdida de sesión')
            setUser(null)
          }
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
      // CRÍTICO: Limpiar sesión anterior antes de iniciar nueva sesión
      // Esto previene mezclar datos de usuarios diferentes
      console.log('🔐 Iniciando login, limpiando sesión anterior...')
      storage.remove('user')
      storage.remove('authToken')
      storage.remove('refreshToken')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('following_users_cache')
        localStorage.removeItem('following_users_cache_timestamp')
      }
      apiClient.setAuthToken('')
      setUser(null) // Limpiar estado antes de login

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
        console.error('❌ Token recibido no tiene formato JWT válido:', token.substring(0, 50))
        throw new Error('Formato de token inválido')
      }

      // VALIDACIÓN: Verificar que el ID del usuario coincide con el token decodificado
      try {
        // Decodificar JWT manualmente (solo lectura del payload)
        const parts = token.split('.')
        if (parts.length === 3) {
          const payloadBase64 = parts[1]
          const padding = payloadBase64.length % 4
          const paddedBase64 = padding ? payloadBase64 + '='.repeat(4 - padding) : payloadBase64
          const base64 = paddedBase64.replace(/-/g, '+').replace(/_/g, '/')
          
          try {
            const payloadJson = atob(base64)
            const decoded = JSON.parse(payloadJson) as { id?: string } | null
            
            if (decoded?.id && decoded.id !== userData.id) {
              console.error(`❌ Inconsistencia detectada: Token ID (${decoded.id}) != Usuario respuesta (${userData.id})`)
              throw new Error('El token no corresponde al usuario recibido')
            }
          } catch (parseError) {
            console.warn('⚠️ No se pudo validar token (continuando):', parseError)
          }
        }
      } catch (jwtError) {
        console.warn('⚠️ No se pudo validar token (continuando):', jwtError)
      }

      console.log(`✅ Login exitoso - Usuario: ${userData.username} (${userData.id})`)

      // Guardar token ANTES de configurar en apiClient
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('authToken')
        if (savedToken !== token) {
          console.error('❌ ERROR: El token no se guardó correctamente en localStorage')
          throw new Error('Error al guardar token en localStorage')
        }
        console.log('✅ Token guardado en localStorage correctamente')
      }
      
      // Configurar token en apiClient
      apiClient.setAuthToken(token)
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken)
      }
      
      // Preparar datos del usuario para guardar
      const userToSave: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio,
        userType: userData.userType,
        fullName: userData.fullName,
        city: userData.city,
      }
      
      // Guardar usuario en storage
      storage.set('user', userToSave)

      // Actualizar estado del usuario (último paso)
      setUser(userToSave)
      
      console.log(`✅ Sesión iniciada y guardada correctamente - Token: ${token.substring(0, 20)}...`)
    } catch (error) {
      // Si hay error, asegurar que todo está limpio
      storage.remove('user')
      storage.remove('authToken')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
      }
      apiClient.setAuthToken('')
      setUser(null)
      throw error
    }
  }

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      // CRÍTICO: Limpiar sesión anterior antes de registrar nueva cuenta
      console.log('🔐 Registrando nueva cuenta, limpiando sesión anterior...')
      storage.remove('user')
      storage.remove('authToken')
      storage.remove('refreshToken')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('following_users_cache')
        localStorage.removeItem('following_users_cache_timestamp')
      }
      apiClient.setAuthToken('')
      setUser(null)

      const response = await apiClient.getClient().post('/auth/register', {
        username,
        email,
        password,
        fullName: username, // El backend requiere fullName
        userType: 'user', // Por defecto es 'user'
      })

      // El backend devuelve { success, message, data: { user, token, refreshToken } }
      const responseData = response.data.data || response.data
      const { user: userData, token: rawToken, refreshToken: rawRefreshToken } = responseData

      // Validar token
      if (!rawToken || typeof rawToken !== 'string') {
        throw new Error('Token inválido recibido del servidor')
      }
      
      const token = rawToken.trim()
      const refreshToken = rawRefreshToken ? rawRefreshToken.trim() : null

      if (!token.includes('.') || token.split('.').length !== 3) {
        throw new Error('Formato de token inválido')
      }

      // Guardar token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
      }
      
      apiClient.setAuthToken(token)
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken)
      }
      
      const userToSave: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio,
        userType: userData.userType,
        fullName: userData.fullName,
        city: userData.city,
      }
      
      storage.set('user', userToSave)
      setUser(userToSave)
      
      console.log(`✅ Registro exitoso - Usuario: ${userToSave.username} (${userToSave.id})`)
    } catch (error) {
      storage.remove('user')
      storage.remove('authToken')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
      }
      apiClient.setAuthToken('')
      setUser(null)
      throw error
    }
  }

  const logout = (): void => {
    console.log('🔐 Cerrando sesión, limpiando todo...')
    
    // Limpiar storage
    storage.remove('user')
    storage.remove('authToken')
    storage.remove('refreshToken')
    
    // Limpiar localStorage completamente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      // También limpiar caché de follows
      localStorage.removeItem('following_users_cache')
      localStorage.removeItem('following_users_cache_timestamp')
    }
    
    // Limpiar token del apiClient
    apiClient.setAuthToken('')
    apiClient.setRefreshToken('')
    
    // Limpiar estado
    setUser(null)
    
    console.log('✅ Sesión cerrada completamente')
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

