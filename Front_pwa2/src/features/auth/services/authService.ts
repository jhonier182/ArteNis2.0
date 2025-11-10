import { apiClient } from '@/services/apiClient'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
    avatar?: string
  }
  token: string
  refreshToken?: string
}

/**
 * Servicio de autenticación
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.getClient().post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.getClient().post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.getClient().post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.getClient().post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },
}

