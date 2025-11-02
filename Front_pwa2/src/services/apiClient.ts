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
            console.log('📱 Detectado dispositivo móvil/remoto, usando:', baseURL)
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
        
        // Endpoints que no requieren autenticación (opcional)
        const publicEndpoints = [
          '/posts/user/', // Ver posts de usuario (público)
          '/posts/', // Ver feed público (opcional)
        ]
        
        const isPublicEndpoint = publicEndpoints.some(endpoint => fullUrl.includes(endpoint))
        
        if (token && config.headers) {
          // Limpiar el token de espacios y caracteres inválidos
          const cleanToken = token.trim()
          config.headers.Authorization = `Bearer ${cleanToken}`
          console.log('🔑 Token añadido al header:', cleanToken.substring(0, 20) + '...')
        } else if (!isPublicEndpoint) {
          // Solo mostrar warning si NO es un endpoint público
          console.warn('⚠️ No hay token disponible para la petición:', fullUrl)
        } else {
          // Endpoint público - no mostrar warning
          console.log('🌐 Petición pública (sin token requerido):', fullUrl)
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
        
        if (error.response?.status === 401) {
          const url = error.response.config?.url
          const message = error.response.data?.message || 'Sin mensaje'
          const authHeader = error.response.config?.headers?.Authorization
          const authHeaderStr = typeof authHeader === 'string' ? authHeader : ''
          console.error('❌ Error 401:', {
            url,
            message,
            hasToken: !!authHeader,
            tokenPreview: authHeaderStr.substring(0, 30) || 'Sin token'
          })
        }
        
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
      console.warn('⚠️ Token tenía comillas, removidas:', cleanToken.substring(0, 20) + '...')
      // Guardar el token limpio de nuevo
      localStorage.setItem('authToken', cleanToken)
    }
    
    // Validar formato básico de JWT (3 partes separadas por puntos)
    if (cleanToken && cleanToken.includes('.') && cleanToken.split('.').length === 3) {
      return cleanToken
    }
    
    console.error('Token almacenado no tiene formato válido:', cleanToken.substring(0, 50))
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

