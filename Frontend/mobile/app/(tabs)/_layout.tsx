import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { UserProvider } from '../../context/UserContext';

export default function TabLayout() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Redirigir a login si no hay token
        const { router } = await import('expo-router');
        router.replace('/auth/login');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <UserProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderTopWidth: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#ff3b30',
          tabBarInactiveTintColor: '#ffffff',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={focused ? "#ff3b30" : color} 
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="boards"
          options={{
            title: 'Boards',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "grid" : "grid-outline"} 
                size={24} 
                color={focused ? "#ff3b30" : color} 
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#ff3b30',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}>
                <Ionicons 
                  name="add" 
                  size={32} 
                  color="#ffffff" 
                />
              </View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "chatbubble" : "chatbubble-outline"} 
                size={24} 
                color={focused ? "#ff3b30" : color} 
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={24} 
                color={focused ? "#ff3b30" : color} 
              />
            ),
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
