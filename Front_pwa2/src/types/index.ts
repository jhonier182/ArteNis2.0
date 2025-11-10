/**
 * Tipos globales de la aplicación
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ErrorResponse {
  success: false
  error: string
  message: string
  statusCode?: number
}

