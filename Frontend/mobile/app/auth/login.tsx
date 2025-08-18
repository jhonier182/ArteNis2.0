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
      const res = await axios.post(`${apiUrl}/api/users/login`, { identifier, password });
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Welcome back please login to your account</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="User Name"
              placeholderTextColor="#dcdde1"
              style={styles.input}
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#dcdde1"
              style={styles.input}
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(s => !s)} style={styles.eye}>
              <Text style={{ color: '#eee' }}>{secure ? '🙈' : '👀'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rememberRow}>
            <Checkbox value={remember} onValueChange={setRemember} color={remember ? '#2ecc71' : undefined} />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={onLogin} disabled={loading}>
            <LinearGradient colors={["#A4E34A", "#22C55E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
              <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>Don't have an account? <Link href="/auth/signup" style={styles.link}>Signup</Link></Text>

          <Text style={styles.credit}>Created by anggialwiputra</Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: {
    width: '90%', maxWidth: 360, borderRadius: 14, padding: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(10px)' as any,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#eaeaea', fontSize: 12, marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  input: { flex: 1, height: 44, color: '#fff' },
  eye: { paddingHorizontal: 6 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  rememberText: { color: '#eaeaea' },
  button: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: { color: '#eaeaea', textAlign: 'center', marginTop: 12 },
  link: { color: '#a7f3d0', fontWeight: '700' },
  credit: { color: '#eaeaea', fontSize: 10, textAlign: 'center', marginTop: 16, opacity: 0.8 }
});


