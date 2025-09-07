import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUser } from '../../context/UserContext';

export default function Logout() {
  const router = useRouter();
  const { logout } = useUser();

  useEffect(() => {
    (async () => {
      try {
        await logout();
      } finally {
        router.replace('/auth/login');
      }
    })();
  }, [logout, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}


