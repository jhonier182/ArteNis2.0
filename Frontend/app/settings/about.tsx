import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const router = useRouter();

  const appInfo = {
    name: 'ArteNis',
    version: '1.0.0',
    build: '2024.1.0',
    description: 'La plataforma definitiva para tatuadores y amantes del arte corporal',
    company: 'ArteNis Studios',
    year: '2024'
  };

  const aboutItems = [
    {
      id: 'terms',
      title: 'Términos de Servicio',
      subtitle: 'Condiciones de uso de la app',
      icon: 'document-text-outline',
      color: '#00d4ff'
    },
    {
      id: 'privacy',
      title: 'Política de Privacidad',
      subtitle: 'Cómo protegemos tus datos',
      icon: 'shield-outline',
      color: '#ff6b6b'
    },
    {
      id: 'licenses',
      title: 'Licencias de Software',
      subtitle: 'Bibliotecas de terceros',
      icon: 'code-outline',
      color: '#4ecdc4'
    },
    {
      id: 'website',
      title: 'Sitio Web',
      subtitle: 'Visita artenis.com',
      icon: 'globe-outline',
      color: '#ffd700'
    }
  ];

  const handleAboutItem = (itemId: string) => {
    switch (itemId) {
      case 'terms':
        router.push('/settings/about/terms');
        break;
      case 'privacy':
        router.push('/settings/about/privacy');
        break;
      case 'licenses':
        router.push('/settings/about/licenses');
        break;
      case 'website':
        Linking.openURL('https://artenis.com');
        break;
      default:
        break;
    }
  };

  const handleContact = () => {
    Linking.openURL('mailto:info@artenis.com');
  };

  const handleSocialMedia = (platform: string) => {
    const urls = {
      instagram: 'https://instagram.com/artenis',
      twitter: 'https://twitter.com/artenis',
      facebook: 'https://facebook.com/artenis',
      youtube: 'https://youtube.com/artenis'
    };
    
    if (urls[platform as keyof typeof urls]) {
      Linking.openURL(urls[platform as keyof typeof urls]);
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
        <Text style={styles.headerTitle}>Acerca de ArteNis</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Logo y Información de la App */}
        <View style={styles.appInfoSection}>
          <LinearGradient
            colors={['rgba(0,212,255,0.2)', 'rgba(0,212,255,0.1)']}
            style={styles.appInfoGradient}
          >
            <View style={styles.appLogo}>
              <Ionicons name="sparkles" size={64} color="#00d4ff" />
            </View>
            <Text style={styles.appName}>{appInfo.name}</Text>
            <Text style={styles.appVersion}>Versión {appInfo.version}</Text>
            <Text style={styles.appDescription}>{appInfo.description}</Text>
          </LinearGradient>
        </View>

        {/* Información Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información Legal</Text>
          
          {aboutItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.aboutItem}
              onPress={() => handleAboutItem(item.id)}
            >
              <View style={styles.aboutItemLeft}>
                <View style={[styles.aboutItemIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.aboutItemInfo}>
                  <Text style={styles.aboutItemTitle}>{item.title}</Text>
                  <Text style={styles.aboutItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Redes Sociales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Síguenos</Text>
          
          <View style={styles.socialGrid}>
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleSocialMedia('instagram')}
            >
              <LinearGradient
                colors={['#E1306C', '#C13584']}
                style={styles.socialGradient}
              >
                <Ionicons name="logo-instagram" size={24} color="#ffffff" />
                <Text style={styles.socialText}>Instagram</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleSocialMedia('twitter')}
            >
              <LinearGradient
                colors={['#1DA1F2', '#0D8BD9']}
                style={styles.socialGradient}
              >
                <Ionicons name="logo-twitter" size={24} color="#ffffff" />
                <Text style={styles.socialText}>Twitter</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleSocialMedia('facebook')}
            >
              <LinearGradient
                colors={['#4267B2', '#365899']}
                style={styles.socialGradient}
              >
                <Ionicons name="logo-facebook" size={24} color="#ffffff" />
                <Text style={styles.socialText}>Facebook</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => handleSocialMedia('youtube')}
            >
              <LinearGradient
                colors={['#FF0000', '#CC0000']}
                style={styles.socialGradient}
              >
                <Ionicons name="logo-youtube" size={24} color="#ffffff" />
                <Text style={styles.socialText}>YouTube</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contacto</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#00d4ff" />
              <Text style={styles.contactText}>info@artenis.com</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color="#00d4ff" />
              <Text style={styles.contactText}>Bogotá, Colombia</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color="#00d4ff" />
              <Text style={styles.contactText}>Lun - Vie: 9:00 AM - 6:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {appInfo.year} {appInfo.company}. Todos los derechos reservados.
          </Text>
          <Text style={styles.footerText}>
            Hecho con ❤️ para la comunidad del tatuaje
          </Text>
        </View>

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
  appInfoSection: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  appInfoGradient: {
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  appLogo: {
    marginBottom: 20,
  },
  appName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 15,
  },
  appDescription: {
    color: 'rgba(255,255,255,0.9)',
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
  aboutItem: {
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
  aboutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aboutItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  aboutItemInfo: {
    flex: 1,
  },
  aboutItemTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aboutItemSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialButton: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  socialGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  socialText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
});
