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
import { createShadow, shadows } from '../../utils/shadowHelper';
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
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const { user } = useUser();

  // Obtener lista de usuarios que sigue
  const fetchFollowingUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return;
      }

      // Intentar obtener la lista de usuarios seguidos
      // Si el endpoint /api/users/following falla, usaremos una alternativa
      const response = await fetch(`${API_BASE_URL}/api/users/following`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const followingIds = data.data?.users?.map((u: any) => u.id) || [];
        setFollowingUsers(followingIds);
      } else {
        // Si falla, dejamos la lista vacía y usamos el filtro por isFollowing
        setFollowingUsers([]);
      }
    } catch (error) {
      setFollowingUsers([]);
    }
  };

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
          let newPosts = data.data?.posts || [];
          
          // Filtrar: solo posts de usuarios que NO sigues
          newPosts = newPosts.filter((post: Post) => {
            // Excluir posts propios
            if (post.author.id === user?.id) {
              return false;
            }
            
            // Excluir posts de usuarios que ya sigues
            // Primero intentar usar la lista de followingUsers (más confiable)
            if (followingUsers.length > 0 && followingUsers.includes(post.author.id)) {
              return false;
            }
            
            // Si no tenemos la lista, usar isFollowing como respaldo
            if (followingUsers.length === 0 && post.author.isFollowing === true) {
              return false;
            }
            
            // Solo incluir posts de usuarios que NO sigues
            return true;
          });
         
         if (pageNum === 1) {
           setPosts(newPosts);
         } else {
           setPosts(prevPosts => [...prevPosts, ...newPosts]);
         }
         
         const apiHasMore = data.data?.pagination?.currentPage < data.data?.pagination?.totalPages;
         const filteredHasMore = (pageNum > 1 && newPosts.length === 0) ? false : apiHasMore;
         setHasMore(filteredHasMore);
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
    // Evitar bucles: no cargar si ya estamos cargando, si no hay más páginas,
    // o si aún no hay posts (lista vacía después del filtrado)
    if (loading || !hasMore || posts.length === 0) {
      return;
    }
    fetchAllPosts(page + 1);
  };

  // Refrescar posts
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllPosts(1);
    setRefreshing(false);
  };

  // Manejar like
  const handleLike = async (postId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      // La actualización del estado local ya se hace en el componente
      // Solo verificamos que la API respondió correctamente
      console.log('✅ Like procesado correctamente');
      
    } catch (error) {
      console.error('Error handling like:', error);
      // Re-lanzar el error para que el componente lo maneje
      throw error;
    }
  };

  // Manejar comentario
  const handleComment = (postId: string) => {
    // TODO: Implementar navegación a comentarios
  };

  // Manejar edición de post (solo para posts propios)
  const handleEditPost = (post: Post) => {
    // TODO: Implementar navegación a editor
  };

  // Manejar eliminación de post (solo para posts propios)
  const handleDeletePost = async (post: Post) => {
    // TODO: Implementar eliminación
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

                   // Actualizar la lista de usuarios seguidos localmente
          if (isFollowing) {
            // Dejó de seguir al usuario
            setFollowingUsers(prev => prev.filter(id => id !== userId));
          } else {
            // Empezó a seguir al usuario
            setFollowingUsers(prev => [...prev, userId]);
          }
       } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al seguir/dejar de seguir:', errorData.message);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
    }
  };

  useEffect(() => {
    // Solo obtener usuarios seguidos, fetchAllPosts se ejecutará en otro useEffect
    const initializeData = async () => {
      await fetchFollowingUsers();
    };
    initializeData();
  }, []);

  // Efecto separado para cuando followingUsers cambie
  useEffect(() => {
    // Solo ejecutar fetchAllPosts si ya tenemos la lista de usuarios seguidos
    if (followingUsers.length >= 0) { // Incluye 0 para cuando no sigues a nadie
      fetchAllPosts(1);
    }
  }, [followingUsers]);

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
                     <Text style={styles.headerSubtitle}>Descubre publicaciones de artistas que no sigues</Text>
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
                             <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
                             <Text style={styles.emptyTitle}>No hay publicaciones para explorar</Text>
               <Text style={styles.emptySubtitle}>
                 Ya sigues a todos los artistas disponibles. Intenta refrescar más tarde.
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
    ...shadows.small,
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
