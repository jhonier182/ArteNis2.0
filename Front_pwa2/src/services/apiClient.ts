import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * Cliente HTTP centralizado con interceptores para manejo de autenticación y errores
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    // Usar variable de entorno en cliente, fallback a localhost en desarrollo
    // En el cliente, process.env solo funciona con NEXT_PUBLIC_ prefijo
    let baseURL = 'http://localhost:3000'
    
    if (typeof window !== 'undefined') {
      // En el cliente, usar la variable de entorno del navegador
      const envUrl = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL
      baseURL = envUrl || baseURL
    } else if (typeof process !== 'undefined') {
      // En el servidor
      baseURL = process.env.NEXT_PUBLIC_API_URL || baseURL
    }

    // Asegurar que baseURL termine con /api (sin duplicar)
    if (!baseURL.endsWith('/api')) {
      // Remover cualquier trailing slash y luego añadir /api
      baseURL = baseURL.replace(/\/$/, '') + '/api'
    }

    console.log('🔧 ApiClient baseURL configurado:', baseURL) // Debug

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
    // Interceptor de request: añade token de autenticación y loguea la URL
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Loggear la URL completa para debug
        const fullUrl = (config.baseURL || '') + (config.url || '')
        console.log('📡 Request URL completa:', fullUrl)
        
        // Añadir token de autenticación
        const token = this.getAuthToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Interceptor de response: maneja errores globales
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<unknown>) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          this.clearAuthToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
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

