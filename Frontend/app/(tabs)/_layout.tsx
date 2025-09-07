import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow, shadows } from '../../utils/shadowHelper';
import { UserProvider } from '../../context/UserContext';
import { BrandColors, TextColors, NeutralColors, Gradients } from '../../constants/Colors';

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
        backgroundColor: NeutralColors.black,
        borderTopWidth: 1,
        borderTopColor: NeutralColors.gray800,
      }}
    />
  );

  return (
    <UserProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: NeutralColors.black,
            borderTopWidth: 1,
            borderTopColor: NeutralColors.gray800,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: BrandColors.primary,
          tabBarInactiveTintColor: NeutralColors.gray400,
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
                color={focused ? BrandColors.primary : color} 
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
                color={focused ? BrandColors.primary : color} 
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
                ...createShadow(BrandColors.secondary, { width: 0, height: 6 }, 0.4, 8, 12),
                overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={Gradients.primary as any}
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
                    color={TextColors.inverse} 
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
                color={focused ? BrandColors.primary : color} 
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
                color={focused ? BrandColors.primary : color} 
              />
            ),
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
