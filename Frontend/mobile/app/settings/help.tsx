import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelpScreen() {
  const router = useRouter();

  const helpItems = [
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      subtitle: 'Encuentra respuestas rápidas',
      icon: 'help-circle-outline',
      color: '#00d4ff'
    },
    {
      id: 'contact',
      title: 'Contactar Soporte',
      subtitle: 'Habla con nuestro equipo',
      icon: 'chatbubble-outline',
      color: '#ff6b6b'
    },
    {
      id: 'tutorials',
      title: 'Tutoriales',
      subtitle: 'Aprende a usar la app',
      icon: 'play-circle-outline',
      color: '#4ecdc4'
    },
    {
      id: 'report',
      title: 'Reportar Problema',
      subtitle: 'Informa sobre errores',
      icon: 'warning-outline',
      color: '#ffd700'
    },
    {
      id: 'feedback',
      title: 'Enviar Feedback',
      subtitle: 'Comparte tu opinión',
      icon: 'star-outline',
      color: '#a8e6cf'
    }
  ];

  const handleHelpItem = (itemId: string) => {
    switch (itemId) {
      case 'faq':
        router.push('/settings/help/faq');
        break;
      case 'contact':
        router.push('/settings/help/contact');
        break;
      case 'tutorials':
        router.push('/settings/help/tutorials');
        break;
      case 'report':
        router.push('/settings/help/report');
        break;
      case 'feedback':
        router.push('/settings/help/feedback');
        break;
      default:
        break;
    }
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
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Banner de Ayuda */}
        <View style={styles.helpBanner}>
          <LinearGradient
            colors={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.1)']}
            style={styles.bannerGradient}
          >
            <Ionicons name="help-buoy-outline" size={48} color="#00d4ff" />
            <Text style={styles.bannerTitle}>¿Necesitas Ayuda?</Text>
            <Text style={styles.bannerSubtitle}>
              Estamos aquí para ayudarte con cualquier pregunta o problema que tengas
            </Text>
          </LinearGradient>
        </View>

        {/* Opciones de Ayuda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Opciones de Ayuda</Text>
          
          {helpItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.helpItem}
              onPress={() => handleHelpItem(item.id)}
            >
              <View style={styles.helpItemLeft}>
                <View style={[styles.helpItemIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.helpItemInfo}>
                  <Text style={styles.helpItemTitle}>{item.title}</Text>
                  <Text style={styles.helpItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Información de Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Información de Contacto</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#00d4ff" />
              <Text style={styles.contactText}>soporte@artenis.com</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="phone-outline" size={20} color="#00d4ff" />
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color="#00d4ff" />
              <Text style={styles.contactText}>Lun - Vie: 9:00 AM - 6:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Botón de Contacto Directo */}
        <TouchableOpacity style={styles.contactButton}>
          <LinearGradient
            colors={['#00d4ff', '#0099cc']}
            style={styles.contactButtonGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Contactar Soporte Ahora</Text>
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
  helpBanner: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  helpItem: {
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
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  helpItemInfo: {
    flex: 1,
  },
  helpItemTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpItemSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  contactInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 15,
  },
  contactButton: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contactButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
