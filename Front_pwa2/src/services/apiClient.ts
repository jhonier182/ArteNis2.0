import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Tipos para datos de Next.js __NEXT_DATA__
 */
interface NextDataEnv {
  NEXT_PUBLIC_API_URL?: string
}

interface NextData {
  env?: NextDataEnv
}

/**
 * Cliente HTTP centralizado con interceptores para manejo de autenticación y errores
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    // Usar NEXT_PUBLIC_API_URL directamente (disponible en cliente y servidor)
    let baseURL = process.env.NEXT_PUBLIC_API_URL
    
    // Si no está configurada, usar fallback inteligente
    if (!baseURL) {
      if (typeof window !== 'undefined') {
        // En el cliente
        const hostname = window.location.hostname
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
        
        if (isLocalhost) {
          baseURL = 'http://localhost:3000/api'
        } else {
          // En producción, usar el backend de Railway
          const protocol = window.location.protocol
          baseURL = `${protocol}//back-end-production-b33a.up.railway.app/api`
        }
      } else {
        // En el servidor
        baseURL = 'http://localhost:3000/api'
      }
    }

    // Asegurar que baseURL termine con /api (sin duplicar)
    if (!baseURL.endsWith('/api')) {
      // Remover cualquier trailing slash y luego añadir /api
      baseURL = baseURL.replace(/\/$/, '') + '/api'
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Interceptor de request: añade token de autenticación
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Añadir token de autenticación
        const token = this.getAuthToken()
        
        if (token && config.headers) {
          // Limpiar el token de espacios y caracteres inválidos
          const cleanToken = token.trim()
          config.headers.Authorization = `Bearer ${cleanToken}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Interceptor de response: maneja errores globales
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<{ message?: string }>) => {
        
        // Manejar errores 401 si es necesario en el futuro
        
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('authToken')
    if (!token) return null
    
    // Limpiar el token de espacios y caracteres inválidos
    let cleanToken = token.trim()
    
    // Remover comillas dobles si el token fue guardado como JSON por error
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1)
      // Guardar el token limpio de nuevo
      localStorage.setItem('authToken', cleanToken)
    }
    
    // Validar formato básico de JWT (3 partes separadas por puntos)
    if (cleanToken && cleanToken.includes('.') && cleanToken.split('.').length === 3) {
      return cleanToken
    }
    
    return null
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    }
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  public setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token)
    }
  }

  public getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()

