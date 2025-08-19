import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const CustomTabBarBackground = () => (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        paddingBottom: 20,
        paddingTop: 10,
        backgroundColor: '#000000',
      }}
    />
  );

  return (
    <UserProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarBackground: CustomTabBarBackground,
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
            title: 'Tableros',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={focused ? "#ff3b30" : color} 
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "compass" : "compass-outline"} 
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
                overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={['#FFCA28', '#FF9800', '#F57C00', '#E65100', '#D84315', '#C62828']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons 
                    name="add" 
                    size={32} 
                    color="#ffffff" 
                  />
                </LinearGradient>
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
