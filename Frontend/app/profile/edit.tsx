import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StatusBar,
  Switch,
  Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  bio: string;
  avatar?: string;
  phone: string;
  city?: string;
  state?: string;
  country: string;
  studioAddress?: string;
  studioName?: string;
  experience?: string;
  specialties: string[];
  pricePerHour?: number;
  rating: string;
  businessHours: any;
  socialLinks: any;
  portfolioImages: any[];
  isPremium: boolean;
  isVerified: boolean;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  
  // Estados del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    studioAddress: '',
    studioName: '',
    experience: '',
    specialties: [] as string[],
    pricePerHour: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: false },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    },
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      website: ''
    }
  });

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data.user;
        setLocalUser(userData);
        
        // Llenar el formulario con los datos del usuario
        setFormData({
          fullName: userData.fullName || '',
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || '',
          phone: userData.phone || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          studioAddress: userData.studioAddress || '',
          studioName: userData.studioName || '',
          experience: userData.experience || '',
          specialties: userData.specialties || [],
          pricePerHour: userData.pricePerHour?.toString() || '',
          businessHours: userData.businessHours || formData.businessHours,
          socialLinks: userData.socialLinks || formData.socialLinks
        });
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };



  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      // Preparar datos para enviar
      const updateData = {
        fullName: formData.fullName || null,
        bio: formData.bio || null,
        phone: formData.phone || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        studioAddress: formData.studioAddress || null,
        studioName: formData.studioName || null,
        experience: formData.experience ? parseInt(formData.experience) : null,
        specialties: formData.specialties || [],
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
        businessHours: formData.businessHours || null,
        socialLinks: formData.socialLinks || null
      };

      // Actualizar perfil
      const response = await fetch(`${API_BASE_URL}/api/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('✅ Perfil actualizado exitosamente');
        if (user) {
          setUser({
            ...user,
            fullName: updateData.fullName || user.fullName,
            bio: updateData.bio || user.bio,
            phone: updateData.phone || user.phone,
            city: updateData.city || user.city,
            state: updateData.state || user.state,
            country: updateData.country || user.country,
            studioAddress: updateData.studioAddress || user.studioAddress,
            studioName: updateData.studioName || user.studioName,
            experience: updateData.experience?.toString() || user.experience,
            pricePerHour: updateData.pricePerHour || user.pricePerHour,
            businessHours: updateData.businessHours || user.businessHours,
            socialLinks: updateData.socialLinks || user.socialLinks
          });
        }
        
        // Regresar automáticamente al perfil
        router.back();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateBusinessHours = (day: keyof typeof formData.businessHours, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const updateSocialLinks = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: ''
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        


        {/* Información Personal */}
        <View style={[styles.section, { marginTop: 0 }]}>
          <Text style={styles.sectionTitle}>👤 Información Personal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.textInput}
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
              placeholder="Tu nombre completo"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de Usuario</Text>
            <TextInput
              style={styles.textInput}
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              placeholder="Tu nombre de usuario"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Tu email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="Tu teléfono"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Biografía</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => updateFormData('bio', value)}
              placeholder="Cuéntanos sobre ti..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Ubicación</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ciudad</Text>
            <TextInput
              style={styles.textInput}
              value={formData.city}
              onChangeText={(value) => updateFormData('city', value)}
              placeholder="Tu ciudad"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estado/Departamento</Text>
            <TextInput
              style={styles.textInput}
              value={formData.state}
              onChangeText={(value) => updateFormData('state', value)}
              placeholder="Tu estado o departamento"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>País</Text>
            <TextInput
              style={styles.textInput}
              value={formData.country}
              onChangeText={(value) => updateFormData('country', value)}
              placeholder="Tu país"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dirección del Estudio</Text>
            <TextInput
              style={styles.textInput}
              value={formData.studioAddress}
              onChangeText={(value) => updateFormData('studioAddress', value)}
              placeholder="Dirección de tu estudio"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
        </View>

        {/* Información Profesional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Información Profesional</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del Estudio</Text>
            <TextInput
              style={styles.textInput}
              value={formData.studioName}
              onChangeText={(value) => updateFormData('studioName', value)}
              placeholder="Nombre de tu estudio"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Años de Experiencia</Text>
            <TextInput
              style={styles.textInput}
              value={formData.experience}
              onChangeText={(value) => updateFormData('experience', value)}
              placeholder="Años de experiencia"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Precio por Hora ($)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.pricePerHour}
              onChangeText={(value) => updateFormData('pricePerHour', value)}
              placeholder="Precio por hora"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Horarios de Trabajo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Horarios de Trabajo</Text>
          
          {Object.entries(formData.businessHours).map(([day, hours]) => (
            <View key={day} style={styles.businessHoursRow}>
              <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Switch
                  value={hours.isOpen}
                  onValueChange={(value) => updateBusinessHours(day as keyof typeof formData.businessHours, 'isOpen', value)}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#00d4ff' }}
                  thumbColor={hours.isOpen ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                />
              </View>
              
              {hours.isOpen && (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={hours.open}
                    onChangeText={(value) => updateBusinessHours(day as keyof typeof formData.businessHours, 'open', value)}
                    placeholder="09:00"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <Text style={styles.timeSeparator}>-</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={hours.close}
                    onChangeText={(value) => updateBusinessHours(day as keyof typeof formData.businessHours, 'close', value)}
                    placeholder="18:00"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Redes Sociales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Redes Sociales</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instagram</Text>
            <TextInput
              style={styles.textInput}
              value={formData.socialLinks.instagram}
              onChangeText={(value) => updateSocialLinks('instagram', value)}
              placeholder="@tuusuario"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Twitter</Text>
            <TextInput
              style={styles.textInput}
              value={formData.socialLinks.twitter}
              onChangeText={(value) => updateSocialLinks('twitter', value)}
              placeholder="@tuusuario"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Facebook</Text>
            <TextInput
              style={styles.textInput}
              value={formData.socialLinks.facebook}
              onChangeText={(value) => updateSocialLinks('facebook', value)}
              placeholder="Tu página de Facebook"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sitio Web</Text>
            <TextInput
              style={styles.textInput}
              value={formData.socialLinks.website}
              onChangeText={(value) => updateSocialLinks('website', value)}
              placeholder="https://tusitio.com"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="url"
            />
          </View>
        </View>

        {/* Botón de Guardar */}
        <TouchableOpacity 
          style={styles.saveButtonLarge} 
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={['#00d4ff', '#0099cc']}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="save" size={20} color="#ffffff" />
            <Text style={styles.saveButtonLargeText}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },


  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },


  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  businessHoursRow: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  timeSeparator: {
    color: '#ffffff',
    fontSize: 18,
    marginHorizontal: 15,
  },
  saveButtonLarge: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonLargeText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});
