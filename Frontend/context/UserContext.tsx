import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../utils/apiClient';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  userType: string;
  bio?: string;
  posts?: any[];
  [key: string]: any;
}

interface UserContextValue {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      // Obtener perfil del usuario usando apiClient (maneja automáticamente refresh tokens)
      const profileRes = await apiClient.get('/api/profile/me');
      
      // Obtener publicaciones del usuario
      const postsRes = await apiClient.get('/api/posts/user/me');
      
      const fetchedUser: UserProfile = profileRes.data?.data?.user;
      const userPosts = postsRes.data?.data?.posts || [];
      
      if (fetchedUser) {
        // Combinar perfil con publicaciones
        const userWithPosts = {
          ...fetchedUser,
          posts: userPosts
        };
        
        setUser(userWithPosts);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('userProfile', JSON.stringify(userWithPosts));
      } else {
        console.log('No se pudo obtener el usuario del perfil');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('Error al refrescar usuario:', error);
      setIsAuthenticated(false);
      // Si hay error de autenticación, limpiar datos
      if (error.response?.status === 401) {
        await logout();
      }
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        identifier,
        password
      });

      const { user: userData, token, refreshToken } = response.data.data;

      // Guardar tokens
      await AsyncStorage.multiSet([
        ['token', token],
        ['refreshToken', refreshToken]
      ]);

      // Establecer usuario
      setUser(userData);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Intentar revocar el refresh token en el servidor
        try {
          await apiClient.post('/api/auth/logout', { refreshToken });
        } catch (error) {
          console.log('Error al revocar token en servidor:', error);
        }
      }

      // Limpiar datos locales
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'userProfile']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }, []);

  useEffect(() => {
    // Cargar desde almacenamiento al arrancar para render inicial rápido
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('userProfile');
        const token = await AsyncStorage.getItem('token');
        
        if (stored && token) {
          setUser(JSON.parse(stored));
          setIsAuthenticated(true);
        }
      } catch {}
      // Intentar refrescar desde API si hay token
      refreshUser();
    })();
  }, [refreshUser]);

  const value: UserContextValue = {
    user,
    setUser,
    refreshUser,
    login,
    logout,
    isAuthenticated,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider');
  return ctx;
};


