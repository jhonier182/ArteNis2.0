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

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [profilePublic, setProfilePublic] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);

  const handleBlockedUsers = () => {
    Alert.alert('Usuarios Bloqueados', 'Funcionalidad en desarrollo');
  };

  const handleMutedAccounts = () => {
    Alert.alert('Cuentas Silenciadas', 'Funcionalidad en desarrollo');
  };

  const handleDataUsage = () => {
    Alert.alert('Uso de Datos', 'Funcionalidad en desarrollo');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración de Privacidad</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Sección de Visibilidad del Perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Visibilidad del Perfil</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#00d4ff' }]}>
                <Ionicons name="eye-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Perfil Público</Text>
                <Text style={styles.settingSubtitle}>Cualquiera puede ver tu perfil</Text>
              </View>
            </View>
            <Switch
              value={profilePublic}
              onValueChange={setProfilePublic}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#00d4ff' }}
              thumbColor={profilePublic ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ff6b6b' }]}>
                <Ionicons name="location-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Mostrar Ubicación</Text>
                <Text style={styles.settingSubtitle}>Compartir tu ciudad/estudio</Text>
              </View>
            </View>
            <Switch
              value={showLocation}
              onValueChange={setShowLocation}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#ff6b6b' }}
              thumbColor={showLocation ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#4ecdc4' }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Permitir Mensajes</Text>
                <Text style={styles.settingSubtitle}>Recibir mensajes de otros usuarios</Text>
              </View>
            </View>
            <Switch
              value={allowMessages}
              onValueChange={setAllowMessages}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ecdc4' }}
              thumbColor={allowMessages ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </View>

        {/* Sección de Estado en Línea */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 Estado en Línea</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ffd700' }]}>
                <Ionicons name="radio-button-on-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Mostrar Estado en Línea</Text>
                <Text style={styles.settingSubtitle}>Otros ven cuando estás activo</Text>
              </View>
            </View>
            <Switch
              value={showOnlineStatus}
              onValueChange={setShowOnlineStatus}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#ffd700' }}
              thumbColor={showOnlineStatus ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#a8e6cf' }]}>
                <Ionicons name="at-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Permitir Etiquetas</Text>
                <Text style={styles.settingSubtitle}>Otros pueden etiquetarte en posts</Text>
              </View>
            </View>
            <Switch
              value={allowTagging}
              onValueChange={setAllowTagging}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#a8e6cf' }}
              thumbColor={allowTagging ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </View>

        {/* Sección de Control de Contenido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚫 Control de Contenido</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleBlockedUsers}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ff9ff3' }]}>
                <Ionicons name="ban-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Usuarios Bloqueados</Text>
                <Text style={styles.settingSubtitle}>Gestiona usuarios bloqueados</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleMutedAccounts}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#74b9ff' }]}>
                <Ionicons name="volume-mute-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Cuentas Silenciadas</Text>
                <Text style={styles.settingSubtitle}>Usuarios que no quieres ver</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Sección de Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Datos y Privacidad</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleDataUsage}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#e17055' }]}>
                <Ionicons name="analytics-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Uso de Datos</Text>
                <Text style={styles.settingSubtitle}>Cómo usamos tu información</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Botón de Guardar */}
        <TouchableOpacity style={styles.saveButton}>
          <LinearGradient
            colors={['#00d4ff', '#0099cc']}
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
    paddingTop: 50,
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
    paddingTop: 20,
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
