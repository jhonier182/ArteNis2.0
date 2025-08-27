import { useState } from 'react';
import { ImageBackground, StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

import { Link, useRouter } from 'expo-router';

const background = require('@/assets/images/fondototal.jpg');

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const onSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Completa los campos', 'Usuario, email y contraseña son obligatorios.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email inválido', 'Por favor ingresa un email válido.');
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post(`${apiUrl}/api/auth/register`, {
        username, email, password, fullName: username
      }, { timeout: 15000 });
      // Guardar refresh si viene (el backend devuelve en register)
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;
      if (refreshToken) {
        try { const SecureStore = require('expo-secure-store'); await SecureStore.setItemAsync('refreshToken', refreshToken); } catch {}
      }
      Alert.alert('Cuenta creada', 'Inicia sesión para continuar.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') }
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'No se pudo crear la cuenta.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.title}>Signup</Text>
          <Text style={styles.subtitle}>Create your account to continue</Text>

          <View style={styles.inputWrapper}>
            <TextInput placeholder="User Name" placeholderTextColor="#dcdde1" style={styles.input} autoCapitalize="none" value={username} onChangeText={setUsername} />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput placeholder="Email" placeholderTextColor="#dcdde1" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput placeholder="Password" placeholderTextColor="#dcdde1" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={onSignup} disabled={loading}>
            <LinearGradient colors={["#A4E34A", "#22C55E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create account'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>Already have an account? <Link href="/auth/login" style={styles.link}>Login</Link></Text>
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
  button: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: { color: '#eaeaea', textAlign: 'center', marginTop: 12 },
  link: { color: '#a7f3d0', fontWeight: '700' },
});


