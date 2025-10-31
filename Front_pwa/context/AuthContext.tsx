import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/apiClient';

// Tipos para el contexto de autenticación
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  userType: 'artist' | 'collector' | 'gallery' | 'admin';
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  userType: 'artist' | 'collector' | 'gallery';
  bio?: string;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Limpiar memoria cada 5 minutos
  useEffect(() => {
    const memoryCleanup = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(memoryCleanup);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get('/api/profile/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token, refreshToken } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        
        return { success: true, message: 'Inicio de sesión exitoso' };
      } else {
        return { success: false, message: response.data.message || 'Error en el inicio de sesión' };
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error en el inicio de sesión';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/auth/register', userData);

      if (response.data.success) {
        return { success: true, message: 'Registro exitoso. Inicia sesión para continuar.' };
      } else {
        return { success: false, message: response.data.message || 'Error en el registro' };
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error en el registro';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiClient.put('/api/auth/profile', userData);
      
      if (response.data.success) {
        setUser(prev => prev ? { ...prev, ...userData } : null);
        return { success: true, message: 'Perfil actualizado exitosamente' };
      } else {
        return { success: false, message: response.data.message || 'Error actualizando perfil' };
      }
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error actualizando perfil' 
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/api/profile/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
