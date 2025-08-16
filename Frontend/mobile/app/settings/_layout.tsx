import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="account"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
