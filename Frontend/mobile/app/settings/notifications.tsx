import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [newFollowers, setNewFollowers] = useState(true);
  const [newLikes, setNewLikes] = useState(true);
  const [newComments, setNewComments] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

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
        <Text style={styles.headerTitle}>Configuración de Notificaciones</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Sección de Tipos de Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Tipos de Notificaciones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#00d4ff' }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificaciones Push</Text>
                <Text style={styles.settingSubtitle}>Recibe alertas en tu dispositivo</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#00d4ff' }}
              thumbColor={pushNotifications ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ff6b6b' }]}>
                <Ionicons name="mail-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificaciones por Email</Text>
                <Text style={styles.settingSubtitle}>Recibe alertas por correo</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#ff6b6b' }}
              thumbColor={emailNotifications ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </View>

        {/* Sección de Actividad Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Actividad Social</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#4ecdc4' }]}>
                <Ionicons name="people-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Nuevos Seguidores</Text>
                <Text style={styles.settingSubtitle}>Cuando alguien te sigue</Text>
              </View>
            </View>
            <Switch
              value={newFollowers}
              onValueChange={setNewFollowers}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ecdc4' }}
              thumbColor={newFollowers ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ffd700' }]}>
                <Ionicons name="heart-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Nuevos Likes</Text>
                <Text style={styles.settingSubtitle}>Cuando alguien da like a tu contenido</Text>
              </View>
            </View>
            <Switch
              value={newLikes}
              onValueChange={setNewLikes}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#ffd700' }}
              thumbColor={newLikes ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#a8e6cf' }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Nuevos Comentarios</Text>
                <Text style={styles.settingSubtitle}>Cuando alguien comenta tu contenido</Text>
              </View>
            </View>
            <Switch
              value={newComments}
              onValueChange={setNewComments}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#a8e6cf' }}
              thumbColor={newComments ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ff9ff3' }]}>
                <Ionicons name="mail-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Nuevos Mensajes</Text>
                <Text style={styles.settingSubtitle}>Cuando recibes mensajes privados</Text>
              </View>
            </View>
            <Switch
              value={newMessages}
              onValueChange={setNewMessages}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#ff9ff3' }}
              thumbColor={newMessages ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
        </View>

        {/* Sección de Sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Sistema</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#74b9ff' }]}>
                <Ionicons name="refresh-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Actualizaciones de la App</Text>
                <Text style={styles.settingSubtitle}>Nuevas versiones disponibles</Text>
              </View>
            </View>
            <Switch
              value={appUpdates}
              onValueChange={setAppUpdates}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#74b9ff' }}
              thumbColor={appUpdates ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#e17055' }]}>
                <Ionicons name="megaphone-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Emails de Marketing</Text>
                <Text style={styles.settingSubtitle}>Ofertas y promociones</Text>
              </View>
            </View>
            <Switch
              value={marketingEmails}
              onValueChange={setMarketingEmails}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#e17055' }}
              thumbColor={marketingEmails ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            />
          </View>
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
