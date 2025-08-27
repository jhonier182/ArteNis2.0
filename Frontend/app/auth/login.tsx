import { useState } from 'react';
import { ImageBackground, StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
  
import { Link, useRouter } from 'expo-router';

const background = require('@/assets/images/fondototal.jpg');

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const onLogin = async () => {
    if (!identifier || !password) return;
    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/api/auth/login`, { identifier, password });
      const data = res.data;
      let token =
        data?.data?.token ||
        data?.token ||
        data?.data?.accessToken ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.jwt;
      if (!token) {
        const authHeader = (res.headers as any)?.authorization || (res.headers as any)?.Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7);
        }
      }
      if (token) {
        await AsyncStorage.setItem('token', token);
        if (remember) await AsyncStorage.setItem('remember', '1');
        const refreshToken = data?.data?.refreshToken || data?.refreshToken;
        if (refreshToken) {
          try {
            const SecureStore = await import('expo-secure-store');
            await SecureStore.setItemAsync('refreshToken', refreshToken);
          } catch {}
        }
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'No se pudo iniciar sesión.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.bg}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Welcome back please login to your account</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="User Name"
                placeholderTextColor="#6B7280"
                style={styles.input}
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6B7280"
                style={styles.input}
                secureTextEntry={secure}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecure(s => !s)} style={styles.eye}>
                <Text style={{ color: '#374151' }}>{secure ? '🙈' : '👀'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rememberRow}>
              <Checkbox value={remember} onValueChange={setRemember} color={remember ? '#2ecc71' : undefined} />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={onLogin} disabled={loading}>
              <LinearGradient colors={["#D97706", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerText}>Don't have an account? <Link href="/auth/signup" style={styles.link}>Signup</Link></Text>

            <Text style={styles.credit}>Created by anggialwiputra</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.85)', // Azul profundo con transparencia
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: {
    width: '95%', 
    maxWidth: 420, 
    borderRadius: 20, 
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Blanco más sólido para mejor legibilidad
    borderWidth: 2, 
    borderColor: '#D97706', // Dorado para el borde
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { 
    color: '#1E3A8A', // Azul profundo para el título
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: { 
    color: '#374151', // Gris oscuro para subtítulo
    fontSize: 14, 
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', // Gris claro para inputs
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 16, 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: { 
    flex: 1, 
    height: 50, 
    color: '#111827', // Negro para texto de input
    fontSize: 16,
    fontWeight: '500'
  },
  eye: { paddingHorizontal: 8 },
  rememberRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginBottom: 24 
  },
  rememberText: { 
    color: '#374151', // Gris oscuro
    fontSize: 14,
    fontWeight: '500'
  },
  button: { 
    height: 54, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  footerText: { 
    color: '#374151', // Gris oscuro
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 14,
    fontWeight: '500'
  },
  link: { 
    color: '#7C3AED', // Violeta para enlaces
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  credit: { 
    color: '#6B7280', // Gris medio
    fontSize: 11, 
    textAlign: 'center', 
    marginTop: 24, 
    opacity: 0.8 
  }
});


