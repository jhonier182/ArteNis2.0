import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

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
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const apiUrl = (Constants.expoConfig?.extra as any)?.apiUrl || 'http://localhost:3000';

  const refreshUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${apiUrl}/api/users/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUser: UserProfile = res.data?.data?.user;
      if (fetchedUser) {
        setUser(fetchedUser);
        await AsyncStorage.setItem('userProfile', JSON.stringify(fetchedUser));
      }
    } catch (error) {
      // Silenciar errores aquí; manejo se hace en pantallas
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


