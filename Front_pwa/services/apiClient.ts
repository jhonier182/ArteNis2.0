import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Configuración base del cliente API
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en desarrollo
    if (process.env.NODE_ENV === 'development') {
      
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de responses exitosos en desarrollo
    if (process.env.NODE_ENV === 'development') {
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
            refreshToken
          });

          if (response.data.success) {
            const { token, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Reintentar la request original
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Si falla la renovación, limpiar tokens y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Manejar errores de red con reintentos
    if (shouldRetry(error) && originalRequest && !originalRequest._retry) {
      return retryRequest(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Función para determinar si se debe reintentar
function shouldRetry(error: AxiosError): boolean {
  const retryableErrors = [
    'ECONNABORTED', // Timeout
    'ECONNREFUSED', // Conexión rechazada
    'ERR_NETWORK',  // Error de red
    'ETIMEDOUT'     // Timeout de conexión
  ];

  return retryableErrors.includes(error.code || '') || 
         (error.response?.status ? error.response.status >= 500 : false);
}

// Función para reintentar requests
async function retryRequest(originalRequest: AxiosRequestConfig & { _retry?: boolean; _retryCount?: number }): Promise<AxiosResponse> {
  originalRequest._retry = true;
  
  // Esperar antes del reintento con backoff exponencial
  const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, (originalRequest._retryCount || 0));
  await new Promise(resolve => setTimeout(resolve, delay));

  // Incrementar contador de reintentos
  originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
  
  return apiClient(originalRequest);
}

// Función para hacer requests con reintentos automáticos
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig,
  retryOptions?: {
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> => {
  const maxRetries = retryOptions?.maxRetries || API_CONFIG.RETRY_ATTEMPTS;
  const retryDelay = retryOptions?.retryDelay || API_CONFIG.RETRY_DELAY;

  let lastError: AxiosError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiClient(config);
      return response.data;
    } catch (error) {
      lastError = error as AxiosError;
      
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
};

// Funciones de conveniencia para métodos HTTP
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'GET', url }),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'POST', url, data }),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

// Función para cancelar requests pendientes
export const createCancelToken = () => axios.CancelToken.source();

// Función para verificar si un error es de cancelación
export const isCancelError = (error: any): boolean => {
  return axios.isCancel(error);
};

// Función para configurar el cliente (útil para tests)
export const configureApiClient = (config: Partial<typeof API_CONFIG>) => {
  Object.assign(API_CONFIG, config);
  apiClient.defaults.baseURL = API_CONFIG.BASE_URL;
  apiClient.defaults.timeout = API_CONFIG.TIMEOUT;
};

export default apiClient;
