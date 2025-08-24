import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createShadow, shadows } from '../../utils/shadowHelper';

export default function AddScreen() {
  const router = useRouter();

  const createOptions = [
    {
      id: 'photo',
      title: 'Subir Foto',
      subtitle: 'Comparte tu trabajo de tatuaje',
      icon: 'camera',
      color: '#ff6b6b',
      onPress: () => router.push('/create/photo')
    },
    {
      id: 'reel',
      title: 'Crear Reel',
      subtitle: 'Video corto de tu proceso',
      icon: 'videocam',
      color: '#4ecdc4',
      onPress: () => router.push('/create/reel')
    },
    {
      id: 'ai-tool',
      title: 'Herramienta IA',
      subtitle: 'Simula tatuajes con IA',
      icon: 'sparkles',
      color: '#45b7d1',
      onPress: () => router.push('/create/ai-tool')
    },
    {
      id: 'quote',
      title: 'Cotización',
      subtitle: 'Crea propuesta para cliente',
      icon: 'document-text',
      color: '#96ceb4',
      onPress: () => router.push('/create/quote')
    },
    {
      id: 'appointment',
      title: 'Cita',
      subtitle: 'Programa sesión de tatuaje',
      icon: 'calendar',
      color: '#feca57',
      onPress: () => router.push('/create/appointment')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crear Contenido</Text>
        <Text style={styles.headerSubtitle}>¿Qué quieres compartir hoy?</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsGrid}>
          {createOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <LinearGradient
                colors={[option.color, `${option.color}dd`]}
                style={styles.optionGradient}
              >
                <Ionicons name={option.icon as any} size={32} color="white" />
              </LinearGradient>
              
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de herramientas rápidas */}
        <View style={styles.quickTools}>
          <Text style={styles.sectionTitle}>Herramientas Rápidas</Text>
          
          <View style={styles.quickToolsRow}>
            <TouchableOpacity style={styles.quickTool}>
              <Ionicons name="color-palette" size={24} color="#ff6b6b" />
              <Text style={styles.quickToolText}>Paleta de Colores</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickTool}>
              <Ionicons name="brush" size={24} color="#4ecdc4" />
              <Text style={styles.quickToolText}>Diseño</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickToolsRow}>
            <TouchableOpacity style={styles.quickTool}>
              <Ionicons name="calculator" size={24} color="#45b7d1" />
              <Text style={styles.quickToolText}>Precios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickTool}>
              <Ionicons name="time" size={24} color="#96ceb4" />
              <Text style={styles.quickToolText}>Tiempo</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsGrid: {
    paddingTop: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  quickTools: {
    marginTop: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  quickToolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickTool: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickToolText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});
