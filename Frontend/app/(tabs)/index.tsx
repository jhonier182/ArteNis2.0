import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ElegantPostCard from '../../components/ElegantPostCard';
import CategoryFilter from '../../components/CategoryFilter';
import PendingPostCard from '../../components/PendingPostCard';
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
  const router = useRouter();
  const params = useLocalSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const { user } = useUser();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  // Función para obtener posts de usuarios seguidos
  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/posts/following?page=${pageNum}&limit=10`, {
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

  // Función para cargar más posts
  const loadMorePosts = () => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  };

  // Función para refrescar el feed
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(1);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
      
      // Verificar posts temporales al enfocar la pantalla
      if (pendingPosts.length > 0) {
        setTimeout(() => {
          checkPendingPostsStatus();
        }, 1000); // Esperar 1 segundo para que se carguen los posts
      }
    }, [])
  );

  // Efecto para detectar cuando se complete una publicación
  useEffect(() => {
    if (params?.publicationCompleted === 'true' && params?.completedPost) {
      try {
        const completedPost = JSON.parse(params.completedPost as string);
        
        // Agregar el post completado al feed
        addPostToFeed(completedPost);
        
        // Limpiar posts temporales que coincidan con el post completado
        setPendingPosts(prev => prev.filter(pendingPost => 
          !(pendingPost.description === completedPost.description &&
            pendingPost.author.id === completedPost.author.id)
        ));
        
        // Limpiar los parámetros para evitar duplicados
        router.setParams({
          publicationCompleted: undefined,
          completedPost: undefined
        });
        
      } catch (error) {
        console.error('Error procesando post completado:', error);
      }
    }
  }, [params?.publicationCompleted, params?.completedPost]);

  // Efecto para detectar posts temporales cuando cambian los parámetros
  useEffect(() => {
    if (params?.tempPost && params?.pendingPublication === 'true') {
      try {
        const tempPost = JSON.parse(params.tempPost as string);
        
        // Verificar que no sea un duplicado antes de agregar
        setPendingPosts(prev => {
          // Verificar si ya existe un post temporal con la misma descripción y autor
          const isDuplicate = prev.some(p => 
            p.description === tempPost.description && 
            p.author.id === tempPost.author.id &&
            p.status === 'pending'
          );
          
          if (isDuplicate) {
            return prev;
          }
          
          return [tempPost, ...prev];
        });
        
      } catch (error) {
        console.error('Error al procesar post temporal:', error);
      }
    }
  }, [params?.tempPost, params?.pendingPublication]);

  // Efecto para simular progreso de posts temporales
  useEffect(() => {
    if (pendingPosts.length === 0) return;
    
    // Simular progreso incremental para posts temporales
    const progressInterval = setInterval(() => {
      pendingPosts.forEach(post => {
        if (post.progress < 90) { // No llegar al 100% hasta que se complete
          const increment = Math.random() * 5 + 1; // Incremento aleatorio entre 1-6%
          const newProgress = Math.min(post.progress + increment, 90);
          updatePendingPostProgress(post.id, newProgress);
        }
      });
    }, 1000); // Actualizar cada segundo
    
    return () => clearInterval(progressInterval);
  }, [pendingPosts]);

  // Efecto para verificar periódicamente el estado de posts temporales
  useEffect(() => {
    if (pendingPosts.length === 0) return;
    
    // Verificar cada 2 segundos si hay posts temporales (más frecuente)
    const interval = setInterval(() => {
      checkPendingPostsStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [pendingPosts.length]);

  // Función para seguir/dejar de seguir un usuario
  const handleFollowUser = async (userId: string, isFollowing: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para seguir usuarios');
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
            console.log('Actualizando estado de seguimiento para:', post.author.username);
            console.log('Estado anterior isFollowing:', (post.author as any).isFollowing);
            console.log('Nuevo estado isFollowing:', !isFollowing);
            
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

        // Mostrar mensaje de éxito
        const message = isFollowing ? 'Has dejado de seguir al usuario' : 'Ahora sigues al usuario';
        // Puedes agregar un toast o notificación aquí si quieres
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.message || 'No se pudo completar la acción');
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
      Alert.alert('Error', 'No se pudo completar la acción');
    }
  };

  // Función para agregar un post directamente al feed
  const addPostToFeed = (newPost: any) => {
    setPosts(prevPosts => {
      // Verificar que el post no esté ya en el feed por ID
      const alreadyExistsById = prevPosts.some(post => post.id === newPost.id);
      
      // También verificar por descripción y autor para evitar duplicados por contenido
      const alreadyExistsByContent = prevPosts.some(post => 
        post.description === newPost.description &&
        post.author.id === newPost.author.id
      );
      
      if (alreadyExistsById || alreadyExistsByContent) {
        return prevPosts;
      }
      
      return [newPost, ...prevPosts];
    });
  };

  // Función para actualizar el progreso de un post temporal
  const updatePendingPostProgress = (tempPostId: string, newProgress: number) => {
    setPendingPosts(prev => prev.map(post => 
      post.id === tempPostId 
        ? { ...post, progress: newProgress }
        : post
    ));
  };

  // Función para remover un post temporal cuando se complete la publicación
  const removePendingPost = (tempPostId: string) => {
    setPendingPosts(prev => prev.filter(p => p.id !== tempPostId));
  };

  // Función para verificar si los posts temporales se han completado
  const checkPendingPostsStatus = async () => {
    if (pendingPosts.length === 0) return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Usar la API principal de posts y buscar por el usuario actual
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allPosts = data.data.posts || [];
        
        // Filtrar solo posts del usuario actual
        const userPosts = allPosts.filter((post: any) => 
          post.author && post.author.id === user?.id
        );
        
        // Verificar cada post temporal
        pendingPosts.forEach(pendingPost => {
          // Primero buscar en posts del usuario
          let matchingRealPost = userPosts.find((realPost: any) => {
            // Comparar descripción y tipo (el autor ya está filtrado)
            const basicMatch = realPost.description === pendingPost.description &&
                             realPost.type === pendingPost.type;
            
            // También verificar que el post real sea reciente (últimos 5 minutos)
            if (basicMatch) {
              const realPostTime = new Date(realPost.createdAt).getTime();
              const pendingPostTime = new Date(pendingPost.createdAt).getTime();
              const timeDiff = Math.abs(realPostTime - pendingPostTime);
              const isRecent = timeDiff < 5 * 60 * 1000; // 5 minutos
              
              return isRecent;
            }
            
            return false;
          });
          
          // Si no se encontró en posts del usuario, buscar en todos los posts por descripción
          if (!matchingRealPost) {
            matchingRealPost = allPosts.find((realPost: any) => {
              // Comparación más flexible: descripción similar y tipo
              const descriptionMatch = realPost.description === pendingPost.description;
              const typeMatch = realPost.type === pendingPost.type;
              
              // También verificar que sea un post reciente (últimos 10 minutos para ser más flexible)
              if (descriptionMatch && typeMatch) {
                const realPostTime = new Date(realPost.createdAt).getTime();
                const pendingPostTime = new Date(pendingPost.createdAt).getTime();
                const timeDiff = Math.abs(realPostTime - pendingPostTime);
                const isRecent = timeDiff < 10 * 60 * 1000; // 10 minutos
                
                return isRecent;
              }
              
              return false;
            });
          }
          
          if (matchingRealPost) {
            // Solo eliminar el post temporal, no agregar al feed (ya se agregó automáticamente)
            removePendingPost(pendingPost.id);
          } else {
            // Verificar si el post temporal ha estado demasiado tiempo (más de 2 minutos)
            const pendingPostTime = new Date(pendingPost.createdAt).getTime();
            const currentTime = new Date().getTime();
            const timeElapsed = currentTime - pendingPostTime;
            const maxWaitTime = 2 * 60 * 1000; // 2 minutos
            
            if (timeElapsed > maxWaitTime) {
              removePendingPost(pendingPost.id);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error verificando estado de posts temporales:', error);
    }
  };

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
      console.error('Error al dar like:', error);
      // Re-lanzar el error para que el componente lo maneje
      throw error;
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
        description: post.description || '',
        hashtags: post.hashtags ? post.hashtags.join(',') : '',
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

  // Trackear visualizaciones del feed
  const trackFeedViews = async (postIds: string[]) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/posts/track-views`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postIds })
      });
    } catch (error) {
      console.error('Error tracking feed views:', error);
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts(1)}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header del feed */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {showSavedPosts ? 'Guardadas' : 'Feed'}
          </Text>
          <TouchableOpacity 
            style={[
              styles.savedPostsButton,
              showSavedPosts && styles.savedPostsButtonActive
            ]}
            onPress={() => setShowSavedPosts(!showSavedPosts)}
          >
            <Ionicons 
              name={showSavedPosts ? "bookmark" : "bookmark-outline"} 
              size={18} 
              color={showSavedPosts ? "#ffffff" : "#FF9800"} 
            />
            <Text style={[
              styles.savedPostsText,
              showSavedPosts && styles.savedPostsTextActive
            ]}>
              {showSavedPosts ? 'inicio' : 'Publicaciones Guardadas'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro de categorías */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        categories={[]}
      />

      {/* Feed de publicaciones */}
      <FlatList
        data={showSavedPosts ? 
          [...pendingPosts, ...posts].filter(post => post.isLiked) : 
          [...pendingPosts, ...posts]
        }
        renderItem={({ item }) => (
          item.status === 'pending' ? (
            <PendingPostCard
              key={item.id}
              post={item}
              progress={item.progress || 0}
            />
          ) : (
            <ElegantPostCard
              key={item.id}
              post={item}
              onLike={handleLike}
              onComment={handleComment}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onFollowUser={handleFollowUser}
            />
          )
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
          !loading && posts.length === 0 && pendingPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={showSavedPosts ? "bookmark-outline" : "people-outline"} 
                size={64} 
                color="rgba(255,255,255,0.3)" 
              />
              <Text style={styles.emptyTitle}>
                {showSavedPosts ? 'No hay publicaciones guardadas' : 'No hay publicaciones para mostrar'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {showSavedPosts ? 
                  'Guarda publicaciones que te gusten para verlas aquí' : 
                  'Sigue a algunos usuarios para ver sus publicaciones aquí'
                }
              </Text>
              <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.exploreButtonText}>
                  {showSavedPosts ? 'Explorar Publicaciones' : 'Explorar Publicaciones'}
                </Text>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1, // Allow left side to take available space
  },
  headerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginRight: 8,
  },
  indicatorDotActive: {
    backgroundColor: '#FF9800',
  },
  indicatorText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#bbb',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  savedPostsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  savedPostsText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  savedPostsButtonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  savedPostsTextActive: {
    color: '#ffffff',
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
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  exploreButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
});
