import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ;

  const refreshUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      // Obtener perfil del usuario
      const profileRes = await axios.get(`${apiUrl}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Obtener publicaciones del usuario
      const postsRes = await axios.get(`${apiUrl}/api/posts/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      
      const fetchedUser: UserProfile = profileRes.data?.data?.user;
      const userPosts = postsRes.data?.data?.posts || [];
      
      
      
      if (fetchedUser) {
        // Combinar perfil con publicaciones
        const userWithPosts = {
          ...fetchedUser,
          posts: userPosts
        };
        
        setUser(userWithPosts);
        await AsyncStorage.setItem('userProfile', JSON.stringify(userWithPosts));
      } else {
        console.log('No se pudo obtener el usuario del perfil');
      }
    } catch (error) {
      console.log('Error al refrescar usuario:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Cargar desde almacenamiento al arrancar para render inicial rápido
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('userProfile');
        if (stored) {
          setUser(JSON.parse(stored));
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
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider');
  return ctx;
};


