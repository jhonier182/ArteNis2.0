import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, APP_CONFIG } from './config';

// Helper functions for localStorage
const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

const multiRemoveStorage = (keys: string[]): void => {
  if (typeof window === 'undefined') return;
  keys.forEach(key => localStorage.removeItem(key));
};

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];
  private maxRetries = 3;
  private retryDelay = 1000; // 1 segundo

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para agregar token a las requests
    this.client.interceptors.request.use(
      (config) => {
        const token = getStorageItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar respuestas y renovar tokens
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getStorageItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
              refreshToken
            });

            const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response.data.data;

            // Log para debugging: verificar si el token cambió a otro usuario
            const oldToken = getStorageItem('token');
            const oldUserProfile = getStorageItem('userProfile');
            console.log('🔄 Refrescando token...');
            
            if (oldToken && oldToken !== newToken) {
              console.log('⚠️ Token refrescado (nuevo token obtenido)');
              if (oldUserProfile) {
                try {
                  const oldUser = JSON.parse(oldUserProfile);
                  console.log('👤 Usuario guardado antes del refresh:', oldUser.id);
                } catch (e) {
                  console.log('Error parseando usuario guardado:', e);
                }
              }
            }

            // ✅ Sincronizar userProfile con los datos del servidor después del refresh
            if (newUser) {
              setStorageItem('userProfile', JSON.stringify(newUser));
              // También actualizar sessionStorage para consistencia
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('userProfile', JSON.stringify(newUser));
                
                // Actualizar también en IndexedDB para persistencia completa
                try {
                  if ('indexedDB' in window) {
                    const request = indexedDB.open('InkEndinDB', 1);
                    request.onupgradeneeded = (event: any) => {
                      const db = event.target.result;
                      if (!db.objectStoreNames.contains('userData')) {
                        db.createObjectStore('userData');
                      }
                    };
                    request.onsuccess = () => {
                      const db = request.result;
                      if (db.objectStoreNames.contains('userData')) {
                        const transaction = db.transaction(['userData'], 'readwrite');
                        const store = transaction.objectStore('userData');
                        store.put(JSON.stringify(newUser), 'userProfile');
                        store.put(newToken, 'token');
                        if (newRefreshToken) {
                          store.put(newRefreshToken, 'refreshToken');
                        }
                      }
                    };
                  }
                } catch (indexedDBError) {
                  console.log('Error actualizando IndexedDB en refresh:', indexedDBError);
                }
              }
              console.log('✅ Usuario sincronizado después del refresh:', newUser.id);
            }

            setStorageItem('token', newToken);
            setStorageItem('refreshToken', newRefreshToken);
            
            // También actualizar sessionStorage para consistencia
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('token', newToken);
              sessionStorage.setItem('refreshToken', newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            this.processQueue(null);

            return this.client(originalRequest);

          } catch (refreshError) {
            this.processQueue(refreshError);
            await this.clearAuthData();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  private async clearAuthData() {
    multiRemoveStorage(['token', 'refreshToken', 'userProfile']);
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Solo reintentar en casos específicos de error de red
      const shouldRetry = 
        retryCount < this.maxRetries && 
        (error.code === 'ECONNABORTED' || 
         error.code === 'ECONNREFUSED' || 
         error.code === 'ERR_NETWORK' ||
         error.code === 'ETIMEDOUT' ||
         (error.response?.status >= 500 && error.response?.status < 600));

      if (shouldRetry) {
        console.log(`Reintentando petición (${retryCount + 1}/${this.maxRetries})...`);
        
        // Esperar con delay exponencial
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.retryRequest(requestFn, retryCount + 1);
      }
      
      throw error;
    }
  }

  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.retryRequest(() => this.client.get(url, config));
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.retryRequest(() => this.client.post(url, data, config));
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.retryRequest(() => this.client.put(url, data, config));
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.retryRequest(() => this.client.delete(url, config));
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.retryRequest(() => this.client.patch(url, data, config));
  }
}

export const apiClient = new ApiClient();
export default apiClient;
