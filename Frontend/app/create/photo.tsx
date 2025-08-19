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
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

export default function CreatePhotoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, refreshUser } = useUser();
  
  // Detectar si estamos en modo edición
  const isEditMode = params.mode === 'edit';
  const postId = params.postId as string;
  const initialImageUrl = params.imageUrl as string;
  const initialDescription = params.description as string;
  const initialHashtags = params.hashtags as string;
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  // Cargar datos del post si estamos en modo edición
  useEffect(() => {
    if (isEditMode) {
      setSelectedImage(initialImageUrl);
      setDescription(initialDescription || '');
      setHashtags(initialHashtags || '');
    }
  }, [isEditMode, initialImageUrl, initialDescription, initialHashtags]);

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],       
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
    if (!selectedImage && !isEditMode) { // Only require image if not in edit mode
      Alert.alert('Error', 'Debes seleccionar una imagen');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Debes agregar una descripción');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10); // 10% - Iniciando
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      if (isEditMode) {
        setUploadProgress(50); // 50% - Guardando cambios
        await handleUpdatePost(token);
      } else {
        setUploadProgress(10); // 10% - Iniciando publicación
        await handleCreatePost(token);
      }

    } catch (error) {
      console.error('Error al procesar:', error);
      
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        if (error.message.includes('Tiempo de espera agotado')) {
          errorMessage = 'La operación tardó demasiado. Verifica tu conexión a internet.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de conexión. Verifica tu internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        '❌ Error', 
        isEditMode ? `No se pudo actualizar la publicación: ${errorMessage}` : `No se pudo publicar la imagen: ${errorMessage}`,
        [
          { text: 'Reintentar', onPress: () => handlePublish() },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePost = async (token: string) => {
    if (!selectedImage) {
      throw new Error('No hay imagen seleccionada');
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

    // Crear un post temporal en modo "espera"
    const tempPost = {
      id: `temp_${Date.now()}`,
      imageUrl: selectedImage,
      description: description.trim(),
      hashtags: hashtags.trim() ? hashtags.trim().split(' ').filter(tag => tag.startsWith('#')) : [],
      type: 'image',
      status: 'pending', // Estado de espera
      progress: uploadProgress, // Progreso actual
      createdAt: new Date().toISOString(),
      author: {
        id: user?.id || '',
        username: user?.username || '',
        avatar: user?.avatar || null
      },
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      isLiked: false
    };

    // Navegar inmediatamente al feed con el post temporal
    router.push({
      pathname: '/(tabs)',
      params: { 
        tempPost: JSON.stringify(tempPost),
        pendingPublication: 'true'
      }
    });

    // Continuar con la publicación en segundo plano
    try {
      // Subir imagen a Cloudinary
      const imageFormData = new FormData();
      
      // Crear el archivo de imagen de manera compatible con web y mobile
      if (Platform.OS === 'web') {
        // Para web: convertir URI a Blob
        try {
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          const file = new File([blob], `post.${fileExtension}`, { type: mimeType });
          imageFormData.append('image', file);
        } catch (error) {
          console.error('Error convirtiendo imagen a Blob:', error);
          // Fallback: usar la URI directamente como string
          imageFormData.append('image', selectedImage);
        }
      } else {
        // Para mobile: usar el formato nativo
        const imageFile = {
          uri: selectedImage,
          type: mimeType,
          name: `post.${fileExtension}`,
          mimeType: mimeType
        } as any;
        imageFormData.append('image', imageFile);
      }
      
      setUploadProgress(25); // 25% - Subiendo imagen
      
      // Headers compatibles con web y mobile
      const headers: any = {
        'Authorization': `Bearer ${token}`
      };
      
      // NO incluir Content-Type en web para que el navegador lo establezca automáticamente
      if (Platform.OS !== 'web') {
        headers['Content-Type'] = 'multipart/form-data';
      }
      
      console.log('🔍 === SUBIENDO IMAGEN ===');
      console.log('🔍 Platform:', Platform.OS);
      console.log('🔍 Headers:', headers);
      console.log('🔍 URL:', `${API_BASE_URL}/api/posts/upload`);
      
      const imageResponse = await fetch(`${API_BASE_URL}/api/posts/upload`, {
        method: 'POST',
        headers,
        body: imageFormData,
        // Timeout más largo para subida de archivos
        signal: AbortSignal.timeout(60000) // 60 segundos
      });
      
      console.log('🔍 Respuesta de subida:', imageResponse.status, imageResponse.statusText);
      console.log('🔍 Headers de respuesta:', Object.fromEntries(imageResponse.headers.entries()));

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}));
        console.error('Error en respuesta de subida:', imageResponse.status, errorData);
        throw new Error(errorData.message || `Error al subir imagen: ${imageResponse.status}`);
      }

      setUploadProgress(75); // 75% - Imagen subida, creando post
      const imageResult = await imageResponse.json();
      const imageUrl = imageResult.data.url;
      const cloudinaryPublicId = imageResult.data.publicId;

      // Crear el post real
      const postData = {
        imageUrl,
        cloudinaryPublicId,
        description: description.trim(),
        hashtags: hashtags.trim() ? hashtags.trim().split(' ').filter(tag => tag.startsWith('#')) : [],
        type: 'image'
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
        const errorData = await postResponse.json().catch(() => ({}));
        throw new Error(`Error al crear el post: ${postResponse.status} - ${errorData.message || 'Error desconocido'}`);
      }

      // Refrescar los datos del usuario
      await refreshUser();
      
      // Crear el objeto del post completado para enviar al feed
      const completedPost = {
        id: postResponse.headers.get('post-id') || `post_${Date.now()}`,
        imageUrl,
        cloudinaryPublicId,
        description: description.trim(),
        hashtags: hashtags.trim() ? hashtags.trim().split(' ').filter(tag => tag.startsWith('#')) : [],
        type: 'image',
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id || '',
          username: user?.username || '',
          avatar: user?.avatar || null
        },
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        isLiked: false
      };
      
      // Navegar al feed con la notificación de publicación completada
      router.push({
        pathname: '/(tabs)',
        params: {
          publicationCompleted: 'true',
          completedPost: JSON.stringify(completedPost)
        }
      });
      
      // Marcar como completado
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error en publicación en segundo plano:', error);
      // El error se manejará en el feed mostrando el post como fallido
    }
  };

  const handleUpdatePost = async (token: string) => {
    // Actualizar el post existente
    const postData = {
      description: description.trim(),
      hashtags: hashtags.trim() ? hashtags.trim().split(' ').filter(tag => tag.startsWith('#')) : [],
    };

    const updateResponse = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      throw new Error(`Error al actualizar el post: ${updateResponse.status} - ${errorData.message || 'Error desconocido'}`);
    }

    // Refrescar los datos del usuario
    await refreshUser();
    
    // Navegar de vuelta al feed sin mostrar alerta
    router.back();
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
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Editar Publicación' : 'Nueva Publicación'}
        </Text>
        <TouchableOpacity 
          style={[styles.publishButton, (!selectedImage || !description.trim() || uploading) && styles.publishButtonDisabled]} 
          onPress={handlePublish}
          disabled={!selectedImage || !description.trim() || uploading}
        >
          <Text style={styles.publishButtonText}>
            {uploading ? (isEditMode ? 'Guardando...' : 'Publicando...') : (isEditMode ? 'Guardar' : 'Publicar')}
          </Text>
          {uploading && uploadProgress && (
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selector de imagen */}
        {isEditMode ? (
          // Modo edición: solo mostrar la imagen
          <View style={styles.imageSelector}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
          </View>
        ) : (
          // Modo creación: permitir seleccionar imagen
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
        )}

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
          <Text style={styles.infoTitle}>
            {isEditMode ? '✏️ Editar Publicación' : '📸 Información de la publicación'}
          </Text>
          {isEditMode ? (
            <>
              <View style={styles.infoItem}>
                <Ionicons name="image" size={16} color="#00d4ff" />
                <Text style={styles.infoText}>La imagen no se puede cambiar, solo la descripción y hashtags</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="save" size={16} color="#4ecdc4" />
                <Text style={styles.infoText}>Los cambios se guardarán inmediatamente en tu publicación</Text>
              </View>
            </>
          ) : (
            <>
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
              <View style={styles.infoItem}>
                <Ionicons name="wifi" size={16} color="#ffd700" />
                <Text style={styles.infoText}>Asegúrate de tener una conexión estable a internet</Text>
              </View>
              {Platform.OS === 'web' && (
                <View style={styles.infoItem}>
                  <Ionicons name="desktop" size={16} color="#ff9800" />
                  <Text style={styles.infoText}>Modo navegador web: La subida puede tardar más tiempo</Text>
                </View>
              )}
            </>
          )}
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
  progressText: {
    color: '#000000',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
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
