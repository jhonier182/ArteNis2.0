import { useState } from 'react';
import { ImageBackground, StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import apiClient from '../../utils/apiClient';

const background = require('@/assets/images/fondototal.jpg');

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      const { data } = await apiClient.post('/api/auth/register', {
        username, email, password, fullName: username
      });
      
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
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>Signup</Text>
            <Text style={styles.subtitle}>Create your account to continue</Text>

            <View style={styles.inputWrapper}>
              <TextInput placeholder="User Name" placeholderTextColor="#6B7280" style={styles.input} autoCapitalize="none" value={username} onChangeText={setUsername} />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput placeholder="Email" placeholderTextColor="#6B7280" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput placeholder="Password" placeholderTextColor="#6B7280" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={onSignup} disabled={loading}>
              <LinearGradient colors={["#D97706", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create account'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footerText}>Already have an account? <Link href="/auth/login" style={styles.link}>Login</Link></Text>
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
});


