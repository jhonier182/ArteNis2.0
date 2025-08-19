import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import ElegantPostCard from '../../components/ElegantPostCard';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface Post {
  id: string;
  imageUrl: string;
  description?: string;
  hashtags?: string[];
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified?: boolean;
    isFollowing?: boolean;
    followersCount?: number;
  };
  isLiked?: boolean;
}

export default function ExploreScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useUser();

  // Obtener todas las publicaciones
  const fetchAllPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/posts?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newPosts = data.data?.posts || [];
        
        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }
        
        setHasMore(data.data?.pagination?.currentPage < data.data?.pagination?.totalPages);
        setPage(pageNum);
      } else {
        const errorText = await response.text();
        console.error('Error fetching posts:', response.status, errorText);
        setError(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar más posts
  const loadMorePosts = () => {
    if (hasMore && !loading) {
      fetchAllPosts(page + 1);
    }
  };

  // Refrescar posts
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllPosts(1);
    setRefreshing(false);
  };

  // Manejar like
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
        // Actualizar estado local
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? (post.likesCount || 1) - 1 : (post.likesCount || 0) + 1
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Manejar comentario
  const handleComment = (postId: string) => {
    // TODO: Implementar navegación a comentarios
    console.log('Navegar a comentarios del post:', postId);
  };

  // Manejar edición de post (solo para posts propios)
  const handleEditPost = (post: Post) => {
    // TODO: Implementar navegación a editor
    console.log('Editar post:', post.id);
  };

  // Manejar eliminación de post (solo para posts propios)
  const handleDeletePost = async (post: Post) => {
    // TODO: Implementar eliminación
    console.log('Eliminar post:', post.id);
  };

  // Manejar seguimiento de usuario
  const handleFollowUser = async (userId: string, isFollowing: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No hay token para seguir usuarios');
        return;
      }

      const url = isFollowing 
        ? `${API_BASE_URL}/api/users/${userId}/follow`
        : `${API_BASE_URL}/api/users/follow`;
      
      const method = isFollowing ? 'DELETE' : 'POST';
      const body = isFollowing ? undefined : JSON.stringify({ userId });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        // Actualizar el estado local del post
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.author.id === userId) {
            return {
              ...post,
              author: {
                ...post.author,
                isFollowing: !isFollowing,
                followersCount: isFollowing 
                  ? Math.max(0, ((post.author as any).followersCount || 0) - 1)
                  : ((post.author as any).followersCount || 0) + 1
              }
            };
          }
          return post;
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al seguir/dejar de seguir:', errorData.message);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
    }
  };

  useEffect(() => {
    fetchAllPosts(1);
  }, []);

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Explorando publicaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Ionicons name="warning" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchAllPosts(1)}>
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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Explorar</Text>
          <Text style={styles.headerSubtitle}>Descubre publicaciones de todos los artistas</Text>
        </View>
      </View>

      {/* Lista de publicaciones */}
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <ElegantPostCard
            key={item.id}
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onFollowUser={handleFollowUser}
          />
        )}
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
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && hasMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="large" color="#FF9800" />
              <Text style={styles.loadingText}>Cargando más publicaciones...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>No hay publicaciones para mostrar</Text>
              <Text style={styles.emptySubtitle}>
                Intenta refrescar la página o revisar más tarde
              </Text>
            </View>
          ) : null
        }
      />
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
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  retryButtonText: {
    color: '#000000',
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#999',
    fontSize: 14,
    lineHeight: 18,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
