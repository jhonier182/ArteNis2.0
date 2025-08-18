import React, { useState } from 'react';
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
  Dimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

export default function CreatePhotoScreen() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [uploading, setUploading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handlePublish = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Debes seleccionar una imagen');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Debes agregar una descripción');
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      // Detectar automáticamente el tipo MIME de la imagen
      let mimeType = 'image/jpeg';
      let fileExtension = 'jpg';
      
      if (selectedImage.startsWith('data:')) {
        // Si es una URI de datos, extraer el tipo MIME
        const match = selectedImage.match(/^data:([^;]+);/);
        if (match) {
          mimeType = match[1];
          // Determinar la extensión basada en el tipo MIME
          if (mimeType === 'image/png') {
            fileExtension = 'png';
          } else if (mimeType === 'image/gif') {
            fileExtension = 'gif';
          } else if (mimeType === 'image/webp') {
            fileExtension = 'webp';
          }
        }
      } else if (selectedImage.includes('.')) {
        // Si es una URI de archivo, extraer la extensión
        const extension = selectedImage.split('.').pop()?.toLowerCase();
        if (extension === 'png') {
          mimeType = 'image/png';
          fileExtension = 'png';
        } else if (extension === 'gif') {
          mimeType = 'image/gif';
          fileExtension = 'gif';
        } else if (extension === 'webp') {
          mimeType = 'image/webp';
          fileExtension = 'webp';
        }
      }

      // Subir imagen a Cloudinary - Corregido para React Native
      const imageFormData = new FormData();
      const imageFile = {
        uri: selectedImage,
        type: mimeType,
        name: `post.${fileExtension}`,
        mimeType: mimeType
      } as any;
      
      imageFormData.append('image', imageFile);
      const imageResponse = await fetch(`${API_BASE_URL}/api/posts/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: imageFormData
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al subir imagen');
      }

      const imageResult = await imageResponse.json();//Imagen subida exitosamente
      const imageUrl = imageResult.data.url;
      const cloudinaryPublicId = imageResult.data.publicId;

      // Crear el post
      const postData = {
        imageUrl,
        cloudinaryPublicId,
        description: description.trim(),
        hashtags: hashtags.trim() ? hashtags.trim().split(' ').filter(tag => tag.startsWith('#')) : [],
        type: 'image'  // Cambiado de 'photo' a 'image' para que coincida con la validación del backend
      };

      const postResponse = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!postResponse.ok) {
        const errorData = await postResponse.json().catch(() => ({}));//error al crear el post
        throw new Error(`Error al crear el post: ${postResponse.status} - ${errorData.message || 'Error desconocido'}`);
      }

      console.log('✅ Post creado exitosamente');
      
      // Refrescar los datos del usuario para incluir el nuevo post
      await refreshUser();
      
      // Navegar de vuelta sin mostrar alerta
      router.back();

    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', 'No se pudo publicar la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: ''
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Publicación</Text>
        <TouchableOpacity 
          style={[styles.publishButton, (!selectedImage || !description.trim() || uploading) && styles.publishButtonDisabled]} 
          onPress={handlePublish}
          disabled={!selectedImage || !description.trim() || uploading}
        >
          <Text style={styles.publishButtonText}>
            {uploading ? 'Publicando...' : 'Publicar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selector de imagen */}
        <TouchableOpacity style={styles.imageSelector} onPress={handleImagePick}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={48} color="#666" />
              <Text style={styles.placeholderText}>Toca para seleccionar imagen</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Campos de texto */}
        <View style={styles.textFields}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Cuéntanos sobre tu trabajo..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hashtags (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={hashtags}
              onChangeText={setHashtags}
              placeholder="#tattoo #art #design"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Text style={styles.hashtagHint}>Separa los hashtags con espacios</Text>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📸 Información de la publicación</Text>
          <View style={styles.infoItem}>
            <Ionicons name="image" size={16} color="#00d4ff" />
            <Text style={styles.infoText}>La imagen se mostrará en tu perfil y en el feed</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="heart" size={16} color="#ff6b6b" />
            <Text style={styles.infoText}>Otros usuarios podrán dar like y comentar</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="share" size={16} color="#4ecdc4" />
            <Text style={styles.infoText}>Tu trabajo será visible para toda la comunidad</Text>
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
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  publishButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    backgroundColor: 'rgba(0,212,255,0.3)',
  },
  publishButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageSelector: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  textFields: {
    marginBottom: 30,
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  hashtagHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});
