import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView,
  RefreshControl,
  Platform
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useUser } from '../../context/UserContext';
import * as ImagePicker from 'expo-image-picker';
import PostsGrid from '../../components/PostsGrid';
import { createShadow, shadows } from '../../utils/shadowHelper';
import { BrandColors, TextColors, NeutralColors, StateColors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  username: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isVerified?: boolean;
  studioName?: string;
  city?: string;
  specialties?: string[];
  rating?: number;
  posts?: Array<{
    id: string;
    imageUrl: string;
    type: 'photo' | 'video';
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    isLiked?: boolean;
  }>;
}

export default function ProfileScreen() {
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user: contextUser, refreshUser } = useUser();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  // Usar datos del contexto si están disponibles
  const user = localUser || contextUser;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }
 
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Intentar refresh del token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshResponse.ok) {
              const { accessToken } = await refreshResponse.json();
              await AsyncStorage.setItem('token', accessToken);
              // Reintentar la petición original
              return fetchProfile();
            }
          } catch (refreshError) {
            console.log('❌ Error al refrescar token:', refreshError);
          }
        }
        
        // Si no se pudo refrescar, limpiar y redirigir
        await AsyncStorage.removeItem('token');
        const SecureStore = await import('expo-secure-store');
        await SecureStore.deleteItemAsync('refreshToken');
        Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente');
        router.replace('/auth/login');
        return;
      }

      if (response.status === 500) {
        setError('Error del servidor. Intenta más tarde.');//error del servidor
        return;
      }

      if (!response.ok) {
        const errorText = await response.text(); //error en la respuesta
        setError(`Error ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json(); //datos recibidos del perfil
      if (data.user) {
        setLocalUser(data.user);
      } else if (data.data && data.data.user) {
        setLocalUser(data.data.user);
      } else {
        setError('Formato de datos inesperado');//estructura de datos inesperada
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Solo cargar si no tenemos datos del contexto
      if (!contextUser) {
        fetchProfile();
      } else {
        // Usar datos del contexto para evitar parpadeo
        setLocalUser(contextUser);
      }
    }, [contextUser])
  );

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  // Función para manejar likes en el perfil
  const handleLike = async (postId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Buscar el post para determinar si ya tiene like
      const post = user.posts?.find(p => p.id === postId);
      const isLiked = post?.isLiked || false;
      
      const method = isLiked ? 'DELETE' : 'POST';
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/posts/${postId}/like`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      // Actualizar el estado local del usuario
      setUser(prevUser => ({
        ...prevUser,
        posts: prevUser.posts?.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: !isLiked,
              likesCount: isLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1
            };
          }
          return p;
        }) || []
      }));
      
    } catch (error) {
      console.error('❌ Error al dar like:', error);
    }
  };

  const handleSettings = () => {
    router.push('/settings/account');
  };

  const handleRetry = () => {
    fetchProfile();
  };

  const handleChangeAvatar = async () => {
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
        const selectedImage = result.assets[0].uri;
        
        // Mostrar loading
        setLoading(true);
        
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            router.replace('/auth/login');
            return;
          }

          const imageFormData = new FormData();

          if (Platform.OS === 'web') {
            const blobResponse = await fetch(selectedImage);
            const blob = await blobResponse.blob();
            const contentType = blob.type || 'image/jpeg';
            const extension = contentType.split('/')[1] || 'jpg';
            const fileName = `avatar.${extension}`;
            const file = new File([blob], fileName, { type: contentType });
            imageFormData.append('avatar', file);
          } else {
            imageFormData.append('avatar', {
              uri: selectedImage,
              type: 'image/jpeg',
              name: 'avatar.jpg'
            } as any);
          }

          const headers: any = { 'Authorization': `Bearer ${token}` };
          if (Platform.OS !== 'web') {
            headers['Content-Type'] = 'multipart/form-data';
          }

          const imageResponse = await fetch(`${API_BASE_URL}/api/profile/me/avatar`, {
            method: 'POST',
            headers,
            body: imageFormData
          });

          if (imageResponse.ok) {
            const imageResult = await imageResponse.json();//resultado de la imagen 
            // Actualizar el estado local del usuario
            if (user) {
              const newAvatar = imageResult?.data?.avatarUrl || imageResult?.data?.user?.avatar || user.avatar;
              setLocalUser({
                ...user,
                avatar: newAvatar
              });
            }
            
            Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
          } else {
            const errorData = await imageResponse.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al subir imagen');
          }
        } catch (error) {
          console.error('Error al subir imagen:', error);
          Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };



  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + ' K';
    }
    return num.toString();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Usar refreshUser del contexto para mantener consistencia
      await refreshUser();
      // Actualizar localUser con los nuevos datos del contexto
      if (contextUser) {
        // Mapear UserProfile a User
        const mappedUser: User = {
          id: contextUser.id,
          username: contextUser.username,
          fullName: contextUser.fullName,
          bio: contextUser.bio,
          avatar: contextUser.avatar,
          followersCount: contextUser.followersCount || 0,
          followingCount: contextUser.followingCount || 0,
          postsCount: contextUser.postsCount || 0,
          isVerified: contextUser.isVerified || false,
          studioName: contextUser.studioName,
          city: contextUser.city,
          specialties: contextUser.specialties,
          rating: contextUser.rating,
          posts: contextUser.posts
        };
        setLocalUser(mappedUser);
      }
    } catch (error) {
      console.log('Error en refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Solo mostrar loading si no tenemos datos del usuario
  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Ionicons name="sparkles" size={32} color={BrandColors.secondary} />
        </View>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={64} color={BrandColors.error} />
        <Text style={styles.errorTitle}>Error al cargar el perfil</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NeutralColors.black} />
      
      {/* Header con icono de configuración a la derecha */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {loading && (
              <View style={styles.headerLoadingIndicator}>
                <Ionicons name="sync" size={16} color={BrandColors.secondary} />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={TextColors.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BrandColors.secondary}
            colors={[BrandColors.secondary]}
          />
        }
      >
        {/* Sección del perfil principal - Sticky Header */}
        <View style={styles.profileSection}>
          {/* Nombre de usuario arriba del avatar */}
          <Text style={styles.usernameAboveAvatar}>@{user.username}</Text>
          
          {/* Avatar circular grande */}
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleChangeAvatar}
          >
            <Image 
              source={{ 
                uri: user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
              }} 
              style={styles.avatar}
            />
            <View style={styles.avatarGlow} />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={20} color={TextColors.inverse} />
            </View>
          </TouchableOpacity>
          
          {/* Nombre completo abajo del avatar */}
          <Text style={styles.fullNameBelowAvatar}>{user.fullName || 'Nombre completo'}</Text>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(user.followersCount || 0)}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(user.followingCount || 0)}</Text>
              <Text style={styles.statLabel}>following</Text>
            </View>
          </View>

          {/* Información del usuario */}
          <View style={styles.userInfo}>
            <Text style={styles.bio}>
              {user.bio || 'Tatuador profesional | Artista digital | Amante del arte'}
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <LinearGradient
                colors={[BrandColors.secondary, BrandColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="person" size={20} color={TextColors.inverse} />
                <Text style={styles.buttonText}>Editar Perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid de publicaciones integrado en el scroll */}
        <View style={styles.postsSection}>
          <Text style={styles.postsSectionTitle}>Mis Publicaciones</Text>
          <PostsGrid 
            userId={user.id}
            onPostPress={(post) => {
              // Aquí puedes navegar a la vista detallada del post
            }}
            isEmbedded={true}
            isOwnProfile={true}
            onLike={handleLike}
          />
        </View>
      </ScrollView>

      {/* Modal para ver imagen completa */}
      {showImageModal && (
        <TouchableOpacity 
          style={styles.imageModal}
          onPress={() => setShowImageModal(false)}
          activeOpacity={1}
        >
          <Image 
            source={{ 
              uri: user.avatar
            }} 
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={24} color={TextColors.inverse} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeutralColors.black,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: NeutralColors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    marginBottom: 20,
  },
  loadingText: {
    color: TextColors.inverse,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: NeutralColors.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: TextColors.inverse,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: TextColors.inverse,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: BrandColors.secondary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: BrandColors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: TextColors.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: NeutralColors.black,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray800,
    shadowColor: NeutralColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerLoadingIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TextColors.inverse,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TextColors.inverse,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NeutralColors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NeutralColors.gray700,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NeutralColors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NeutralColors.gray700,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: NeutralColors.black,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  usernameAboveAvatar: {
    color: BrandColors.secondary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  fullNameBelowAvatar: {
    color: TextColors.inverse,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: BrandColors.secondary,
  },
  avatarGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 65,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    zIndex: -1,
    shadowColor: BrandColors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NeutralColors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BrandColors.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TextColors.inverse,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: TextColors.inverse,
    textTransform: 'lowercase',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  bio: {
    fontSize: 16,
    color: TextColors.inverse,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NeutralColors.gray700,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TextColors.inverse,
  },
  postsSection: {
    paddingHorizontal: 0,
    paddingBottom: 30,
    backgroundColor: NeutralColors.gray900,
  },
  postsSectionTitle: {
    color: TextColors.inverse,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  imageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
