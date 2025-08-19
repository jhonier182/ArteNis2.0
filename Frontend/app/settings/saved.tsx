import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

interface SavedPost {
  id: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
}

export default function SavedScreen() {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  // Obtener posts guardados
  const fetchSavedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/posts/saved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPosts(data.data?.posts || []);
      } else {
        console.error('Error fetching saved posts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar posts guardados
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedPosts();
    setRefreshing(false);
  };

  // Quitar post de guardados
  const removeFromSaved = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/save`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSavedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        Alert.alert('Éxito', 'Post removido de guardados');
      } else {
        Alert.alert('Error', 'No se pudo remover el post de guardados');
      }
    } catch (error) {
      console.error('Error removing from saved:', error);
      Alert.alert('Error', 'No se pudo remover el post de guardados');
    }
  };

  // Navegar al perfil del usuario
  const navigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      router.push('/(tabs)/profile');
    } else {
      Alert.alert('Perfil de Usuario', 'Funcionalidad en desarrollo');
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const renderSavedPost = ({ item }: { item: SavedPost }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity 
        style={styles.postImageContainer}
        onPress={() => {/* TODO: Navegar a vista detallada del post */}}
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.postInfo}>
        <TouchableOpacity 
          style={styles.authorInfo}
          onPress={() => navigateToProfile(item.author.id)}
        >
          <Image 
            source={{ uri: item.author.avatar }} 
            style={styles.authorAvatar}
          />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.fullName}</Text>
            <Text style={styles.authorUsername}>@{item.author.username}</Text>
          </View>
        </TouchableOpacity>
        
        {item.description && (
          <Text style={styles.postDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeFromSaved(item.id)}
          >
            <Ionicons name="bookmark" size={20} color="#FF9800" />
            <Text style={styles.removeButtonText}>Quitar de guardados</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Cargando publicaciones guardadas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicaciones Guardadas</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={savedPosts}
        renderItem={renderSavedPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF9800"
            colors={["#FF9800"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No tienes publicaciones guardadas</Text>
            <Text style={styles.emptySubtitle}>
              Guarda las publicaciones que te gusten para verlas más tarde
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
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
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
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
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  postContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  postImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  authorUsername: {
    color: '#999',
    fontSize: 12,
  },
  postDescription: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,152,0,0.1)',
    borderRadius: 16,
  },
  removeButtonText: {
    color: '#FF9800',
    fontSize: 12,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
