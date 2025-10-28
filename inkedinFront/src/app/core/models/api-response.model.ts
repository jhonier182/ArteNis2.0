/**
 * Modelo base para respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * Modelo para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Modelo para errores de la API
 */
export interface ApiError {
  message: string;
  status: number;
  errors?: { [key: string]: string[] };
}
