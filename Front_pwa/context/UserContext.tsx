import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import { saveAuthData, clearAuthData, forceClearAllAuthData } from '@/utils/persistentStorage';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  userType: string;
  bio?: string;
  [key: string]: any;
}

interface UserContextValue {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get('/api/profile/me');
      const userData = response.data?.data?.user;

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfile', JSON.stringify(userData));
        }
        console.log('Usuario cargado:', userData.username, userData.id);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Limpiar datos inválidos
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('refreshToken');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      // Limpiar datos anteriores antes del login
      setUser(null);
      setIsAuthenticated(false);
      
      const response = await apiClient.post('/api/auth/login', {
        identifier,
        password
      });

      const { user: userData, token, refreshToken } = response.data.data;

      // Guardar en múltiples métodos para persistencia en PWA móviles
      await saveAuthData({
        token,
        refreshToken,
        user: userData
      });

      // Establecer estado inmediatamente después del login
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login exitoso para:', userData.username, userData.id);
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      setUser(null);
      setIsAuthenticated(false);
      
      const errorMessages = {
        'ECONNABORTED': 'La conexión tardó demasiado. Verifica tu conexión a internet e intenta nuevamente.',
        'ECONNREFUSED': 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
        'ERR_NETWORK': 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.'
      };
      
      const statusMessages = {
        401: 'Credenciales incorrectas. Verifica tu email/usuario y contraseña.',
        429: 'Demasiados intentos. Espera un momento antes de intentar nuevamente.'
      };
      
      const errorMessage = errorMessages[error.code as keyof typeof errorMessages] || 
                          statusMessages[error.response?.status as keyof typeof statusMessages] ||
                          (error.response?.status >= 500 ? 'Error del servidor. Intenta nuevamente en unos minutos.' : 'Error al iniciar sesión') ||
                          error.response?.data?.message ||
                          'Error al iniciar sesión';
      
      const customError = new Error(errorMessage) as any;
      customError.name = error.name || 'LoginError';
      customError.code = error.code;
      
      throw customError;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      
      if (refreshToken) {
        try {
          await apiClient.post('/api/auth/logout', { refreshToken });
        } catch (error) {
          console.log('Error al revocar token en servidor:', error);
        }
      }

      // Limpiar de todos los métodos de almacenamiento
      await forceClearAllAuthData();

      // Limpiar estado inmediatamente
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Logout completado');
    } catch (error) {
      console.error('Error en logout:', error);
      // Asegurar que el estado esté limpio incluso si hay error
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const forceLogout = useCallback(async () => {
    try {
      // Limpieza completa sin llamar al servidor
      await forceClearAllAuthData();
      
      // Limpiar estado inmediatamente
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Logout forzado completado');
    } catch (error) {
      console.error('Error en logout forzado:', error);
      // Asegurar que el estado esté limpio incluso si hay error
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    
    // Limpiar memoria cada 5 minutos
    const memoryCleanup = setInterval(() => {
      if (typeof window !== 'undefined' && window.gc) {
        window.gc();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(memoryCleanup);
    };
  }, [loadUser]);

  const value: UserContextValue = {
    user,
    setUser,
    login,
    logout,
    forceLogout,
    isAuthenticated,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }
  return context;
};
