import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useUser } from '../context/UserContext';

export function useAuth() {
  const { isAuthenticated, user, isInitializing } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    // Pequeño delay para asegurar que el router esté completamente listo
    const timer = setTimeout(() => {
      setIsRouterReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Solo navegar si el contexto y el router están listos
    if (isInitializing || !isRouterReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Usuario no autenticado y no está en la pantalla de auth
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Usuario autenticado pero está en pantalla de auth
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router, isInitializing, isRouterReady]);

  return {
    isAuthenticated,
    user,
    isLoading: isInitializing || !isRouterReady,
  };
}
