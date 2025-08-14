import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const SecureStore = await import('expo-secure-store');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          try {
            const apiUrl = (require('expo-constants').default.expoConfig?.extra as any)?.apiUrl || 'http://localhost:3000';
            await fetch(`${apiUrl}/api/users/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
          } catch {}
        }
        await SecureStore.deleteItemAsync('refreshToken');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('remember');
      } finally {
        router.replace('/auth/login');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}


