import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { createShadow, shadows } from '../../utils/shadowHelper';
import InstagramGrid from '../../components/InstagramGrid';
import { BrandColors, TextColors, NeutralColors, StateColors } from '../../constants/Colors';
import apiClient from '../../utils/apiClient';

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
      const response = await apiClient.get('/api/follow/following');
      const followingIds = response.data.data?.users?.map((u: any) => u.id) || [];
      setFollowingUsers(followingIds);
    } catch (error) {
      console.log('Error obteniendo usuarios seguidos:', error);
      setFollowingUsers([]);
    }
  };

  // Obtener todas las publicaciones
  const fetchAllPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/posts?page=${pageNum}&limit=20`);
      
      const data = response.data;
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
        // Actualización silenciosa en segundo plano
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }
      
      const apiHasMore = data.data?.pagination?.currentPage < data.data?.pagination?.totalPages;
      const filteredHasMore = (pageNum > 1 && newPosts.length === 0) ? false : apiHasMore;
      setHasMore(filteredHasMore);
      setPage(pageNum);
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

  // Refrescar posts cuando se enfoca la pantalla
  const refreshOnFocus = async () => {
    try {
      // Refrescar usuarios seguidos primero
      await fetchFollowingUsers();
      
      // Luego refrescar posts silenciosamente
      await fetchAllPosts(1);
      
    } catch (error) {
      console.error('❌ Error al refrescar en focus:', error);
    }
  };

  // Hook para detectar cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      // Delay más largo para evitar refrescar inmediatamente al cambiar de pestaña
      const timer = setTimeout(() => {
        refreshOnFocus();
      }, 800);
      
      return () => clearTimeout(timer);
    }, [])
  );

  // Manejar like
  const handleLike = async (postId: string): Promise<void> => {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/like`);
      console.log('✅ Like procesado correctamente');
    } catch (error) {
      console.error('Error handling like:', error);
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
      const url = isFollowing ? `/api/follow/${userId}` : '/api/follow';
      const method = isFollowing ? 'DELETE' : 'POST';
      const body = isFollowing ? undefined : { userId };

      const response = await apiClient.request({
        url,
        method,
        data: body
      });

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
      <StatusBar barStyle="light-content" backgroundColor={NeutralColors.black} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Explorar</Text>
          <Text style={styles.headerSubtitle}>Descubre publicaciones de artistas que no sigues</Text>
        </View>
      </View>


      {/* Lista de publicaciones */}
      {posts.length > 0 ? (
        <InstagramGrid
          posts={posts}
          onLike={handleLike}
          onComment={handleComment}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onFollowUser={handleFollowUser}
          loading={loading}
          hasMore={hasMore}
        />
      ) : !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={TextColors.inverse} />
          <Text style={styles.emptyTitle}>No hay publicaciones para explorar</Text>
          <Text style={styles.emptySubtitle}>
            Ya sigues a todos los artistas disponibles. Intenta refrescar más tarde.
          </Text>
        </View>
      ) : null}
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
  loadingText: {
    color: TextColors.inverse,
    fontSize: 16,
    marginTop: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray800,
    backgroundColor: NeutralColors.black,
    shadowColor: NeutralColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: TextColors.inverse,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: TextColors.inverse,
    fontSize: 14,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: NeutralColors.black,
  },
  emptyTitle: {
    color: TextColors.inverse,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: TextColors.inverse,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
});
