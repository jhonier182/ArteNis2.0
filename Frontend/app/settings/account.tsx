import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleChangePassword = () => {
    // Implementar cambio de contraseña
    Alert.alert('Cambiar Contraseña', 'Funcionalidad en desarrollo');
  };

  const handleTwoFactorAuth = () => {
    Alert.alert('Autenticación de Dos Factores', 'Funcionalidad en desarrollo');
  };

  const handlePrivacySettings = () => {
    router.push('/settings/privacy');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Eliminar Cuenta Permanentemente',
      'Esta acción iniciará un período de 15 días antes de la eliminación definitiva.\n\nDurante este tiempo:\n• Tu cuenta seguirá funcionando normalmente\n• Podrás cancelar la eliminación\n• Recibirás notificaciones sobre el progreso\n\n¿Quieres continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar lógica de eliminación programada
            // 1. Llamar a la API para programar la eliminación en 15 días
            // 2. Actualizar el estado local del usuario
            // 3. Mostrar indicador de cuenta en proceso de eliminación
            // 4. Programar notificaciones de recordatorio
            // 5. Permitir cancelación durante el período de gracia
            Alert.alert(
              '🗓️ Eliminación Programada',
              'Tu cuenta será eliminada permanentemente en 15 días.\n\nRecibirás notificaciones sobre el progreso y podrás cancelar la eliminación desde tu perfil en cualquier momento.',
              [
                {
                  text: 'Entendido',
                  style: 'default',
                }
              ]
            );
          },
        },
      ]
    );
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      '⏸️ Desactivar Cuenta',
      'Al desactivar tu cuenta:\n\n• Tu perfil no será visible para otros usuarios\n• Se cerrará tu sesión actual\n• Podrás reactivarla iniciando sesión nuevamente\n\n¿Quieres continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, Desactivar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '✅ Cuenta Desactivada',
              'Tu cuenta ha sido desactivada exitosamente.\n\nTu perfil ya no es visible para otros usuarios. Para reactivarla, simplemente inicia sesión nuevamente.',
              [
                {
                  text: 'Entendido',
                  style: 'default',
                  onPress: () => {
                    // TODO: Implementar lógica de desactivación de cuenta
                    // 1. Llamar a la API para marcar la cuenta como desactivada
                    // 2. Actualizar el estado local del usuario
                    // 3. Cerrar sesión automáticamente
                    // 4. Redirigir al login
                    handleLogout();
                  },
                }
              ]
            );
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              const refreshToken = await AsyncStorage.getItem('refreshToken');
              if (refreshToken) {
                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/logout`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken })
                });
              }
              await AsyncStorage.removeItem('token');
              const SecureStore = await import('expo-secure-store');
              await SecureStore.deleteItemAsync('refreshToken');
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              // Aún así, limpiar el almacenamiento local
              await AsyncStorage.removeItem('token');
              const SecureStore = await import('expo-secure-store');
              await SecureStore.deleteItemAsync('refreshToken');
              router.replace('/auth/login');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
  

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Sección de Seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="key-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Cambiar Contraseña</Text>
                <Text style={styles.settingSubtitle}>Actualiza tu contraseña</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleTwoFactorAuth}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Autenticación de Dos Factores</Text>
                <Text style={styles.settingSubtitle}>Añade una capa extra de seguridad</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="finger-print-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Autenticación Biométrica</Text>
                <Text style={styles.settingSubtitle}>Usa tu huella o rostro</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#9C27B0' }}
              thumbColor={biometricEnabled ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </View>

        {/* Sección de Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Preferencias</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="notifications-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificaciones Push</Text>
                <Text style={styles.settingSubtitle}>Recibe alertas importantes</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FF9800' }}
              thumbColor={notificationsEnabled ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#607D8B' }]}>
                <Ionicons name="moon-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Modo Oscuro</Text>
                <Text style={styles.settingSubtitle}>Tema oscuro por defecto</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#607D8B' }}
              thumbColor={darkModeEnabled ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </View>

        {/* Sección de Privacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Privacidad</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#00BCD4' }]}>
                <Ionicons name="eye-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Configuración de Privacidad</Text>
                <Text style={styles.settingSubtitle}>Controla tu visibilidad</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

        </View>

        {/* Sección de Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Cuenta</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF5722' }]}>
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Cerrar Sesión</Text>
                <Text style={styles.settingSubtitle}>Cierra tu sesión actual</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleDeactivateAccount}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="pause-circle-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Desactivar Cuenta</Text>
                <Text style={styles.settingSubtitle}>Oculta tu perfil temporalmente</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#E91E63' }]}>
                <Ionicons name="trash-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Eliminar Cuenta</Text>
                <Text style={styles.settingSubtitle}>Eliminación permanente en 15 días</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Botón de Guardar */}
        <TouchableOpacity style={styles.saveButton}>
          <LinearGradient
            colors={['#FFCA28', '#FF9800', '#F57C00', '#E65100', '#D84315', '#C62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 90,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
