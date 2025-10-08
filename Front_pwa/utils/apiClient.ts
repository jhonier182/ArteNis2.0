import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.8:3000';

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
        const token = getStorageItem('token');
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

            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refreshToken
            });

            const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

            setStorageItem('token', newToken);
            setStorageItem('refreshToken', newRefreshToken);

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
}

export const apiClient = new ApiClient();
export default apiClient;
