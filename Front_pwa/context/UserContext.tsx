import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import { saveAuthData, clearAuthData } from '@/utils/persistentStorage';

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
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
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

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
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
      await clearAuthData();

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value: UserContextValue = {
    user,
    setUser,
    login,
    logout,
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
