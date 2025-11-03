import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Cliente HTTP centralizado con interceptores para manejo de autenticación y errores
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    let baseURL = 'http://localhost:3000'
    
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextData = (window as any).__NEXT_DATA__ as { env?: { NEXT_PUBLIC_API_URL?: string } } | undefined
      const envUrl = nextData?.env?.NEXT_PUBLIC_API_URL
      baseURL = envUrl || baseURL
      
      // Si no hay URL configurada y estamos en un dispositivo móvil/externo,
      // intentar usar la IP de red local
      if (!envUrl && baseURL.includes('localhost')) {
        // Detectar si estamos en un dispositivo móvil o externo
        // Si window.location.hostname no es localhost/127.0.0.1, es probable que estemos en red local
        const hostname = window.location.hostname
        const isMobileOrRemote = hostname !== 'localhost' && hostname !== '127.0.0.1'
        
        if (isMobileOrRemote) {
          // Usar la misma IP desde donde se accede al frontend para el backend
          // Por ejemplo, si acceden a http://192.168.1.2:3002, usar http://192.168.1.2:3000
          const protocol = window.location.protocol
          const port = window.location.port || (protocol === 'https:' ? '443' : '80')
          const backendPort = '3000'
          
          // Si el puerto es diferente y parece ser el frontend, usar el mismo hostname para el backend
          if (port !== backendPort && port !== '443' && port !== '80') {
            baseURL = `${protocol}//${hostname}:${backendPort}`
          }
        }
      }
    } else if (typeof process !== 'undefined') {
      // En el servidor
      baseURL = process.env.NEXT_PUBLIC_API_URL || baseURL
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
        
        // Endpoints que no requieren autenticación (opcional)
        const publicEndpoints = [
          '/posts/user/', // Ver posts de usuario (público)
          '/posts/', // Ver feed público (opcional)
        ]
        
        const fullUrl = (config.baseURL || '') + (config.url || '')
        const isPublicEndpoint = publicEndpoints.some(endpoint => fullUrl.includes(endpoint))
        
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

