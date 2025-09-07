import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para agregar token a las requests
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y renovar tokens
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si es error 401 y no es una request de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya estamos refrescando, agregar a la cola
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
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Intentar renovar el token
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refreshToken
            });

            const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

            // Guardar nuevos tokens
            await AsyncStorage.setItem('token', newToken);
            await AsyncStorage.setItem('refreshToken', newRefreshToken);

            // Actualizar el header de la request original
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Procesar la cola de requests fallidas
            this.processQueue(null);

            // Reintentar la request original
            return this.client(originalRequest);

          } catch (refreshError) {
            // Si falla el refresh, limpiar tokens y redirigir al login
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
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'userProfile']);
  }

  // Métodos HTTP
  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.delete(url, config);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.patch(url, data, config);
  }

  // Método para hacer requests con manejo manual de tokens (útil para login)
  async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.request(config);
  }
}

// Exportar una instancia singleton
export const apiClient = new ApiClient();
export default apiClient;
