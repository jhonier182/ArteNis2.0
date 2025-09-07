import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useUser } from '../context/UserContext';

export function useAuth() {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Usuario no autenticado y no está en la pantalla de auth
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Usuario autenticado pero está en pantalla de auth
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return {
    isAuthenticated,
    user,
  };
}
