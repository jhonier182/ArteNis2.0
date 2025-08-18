import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ElegantPostCard from '../../components/ElegantPostCard';
import CategoryFilter from '../../components/CategoryFilter';
import { useUser } from '../../context/UserContext';
import { router } from 'expo-router';

interface Post {
  id: string;
  imageUrl: string;
  description?: string;  // Opcional porque puede ser null
  hashtags?: string[];   // Opcional porque puede ser null
  likesCount?: number;   // Opcional porque puede ser null
  commentsCount?: number; // Opcional porque puede ser null
  createdAt: string;
  author: {  // Cambiado de 'user' a 'author' para coincidir con PostCard
    id: string;
    username: string;
    fullName: string;
    avatar?: string;      // Opcional porque puede ser null
    isVerified?: boolean; // Opcional porque puede ser null
  };
  isLiked?: boolean;     // Opcional porque puede ser null
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useUser();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar publicaciones');
      }

      const data = await response.json();
      setPosts(data.data.posts || []);
      
    } catch (error) {
      console.error('Error al cargar posts:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const handleLike = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Actualizar el estado local
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  isLiked: !post.isLiked,
                  likesCount: post.isLiked ? (post.likesCount || 0) - 1 : (post.likesCount || 0) + 1
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleComment = (postId: string) => {
    Alert.alert('Comentarios', 'Funcionalidad de comentarios en desarrollo');
  };

  const handleShare = (postId: string) => {
    Alert.alert('Compartir', 'Funcionalidad de compartir en desarrollo');
  };

  const handleUserPress = (userId: string) => {
    // Navegar al perfil del usuario
    if (userId === user?.id) {
      // Si es el usuario actual, ir a su perfil
      router.push('/(tabs)/profile');
    } else {
      // Si es otro usuario, mostrar alert temporal
      Alert.alert('Perfil de usuario', 'Navegación al perfil de otros usuarios en desarrollo');
    }
  };

  const handleEditPost = (post: any) => {
    // Navegar al editor de publicaciones con los datos del post
    router.push({
      pathname: '/create/photo',
      params: { 
        mode: 'edit',
        postId: post.id,
        imageUrl: post.imageUrl,
        type: 'photo'
      }
    });
  };

  const handleDeletePost = async (post: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      // Llamar a la API para eliminar el post
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Recargar los posts para mostrar los cambios
        fetchPosts();
        Alert.alert('✅ Éxito', 'Publicación eliminada correctamente');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar la publicación');
      }
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      Alert.alert('❌ Error', 'No se pudo eliminar la publicación');
    }
  };

  const handleFollow = (userId: string) => {
    // TODO: Implementar lógica de follow
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // TODO: Filtrar posts por categoría
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Ionicons name="sparkles" size={48} color="#ff6b9d" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Ionicons name="warning" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Popular</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filtro de categorías */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        categories={[]}
      />

      {/* Feed de publicaciones */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff6b9d"
            colors={["#ff6b9d"]}
          />
        }
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <ElegantPostCard
              key={post.id}
              post={post}
              currentUserId={user?.id || 'guest'}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onFollow={handleFollow}
              onUserPress={handleUserPress}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No hay publicaciones</Text>
            <Text style={styles.emptyText}>
              Sé el primero en compartir tu trabajo de tatuaje
            </Text>
          </View>
        )}
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
    color: '#333',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#ff6b9d',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,   
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    backgroundColor: '#000000',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
