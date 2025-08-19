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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pendingPosts, setPendingPosts] = useState<any[]>([]); // Posts en espera
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

      if (response.ok) {
        const data = await response.json();
        const newPosts = data.data.posts || [];
        
        setPosts(newPosts);
        setLoading(false);
        
        // Trackear visualizaciones del feed
        if (newPosts.length > 0) {
          const postIds = newPosts.map((post: any) => post.id);
          trackFeedViews(postIds);
        }
        
        // Verificar si hay posts temporales que se pueden limpiar
        // (cuando se complete la publicación, el post real aparecerá en newPosts)
        if (pendingPosts.length > 0 && newPosts.length > 0) {
          console.log('🔍 Verificando posts temporales en fetchPosts...');
          console.log(`⏳ Posts temporales: ${pendingPosts.length}`);
          console.log(`📊 Posts nuevos: ${newPosts.length}`);
          
          // Buscar posts que coincidan con los temporales por descripción
          pendingPosts.forEach(pendingPost => {
            const matchingRealPost = newPosts.find((realPost: any) => {
              // Comparar descripción, autor y tipo
              const basicMatch = realPost.description === pendingPost.description &&
                               realPost.author.id === pendingPost.author.id &&
                               realPost.type === pendingPost.type;
              
              // También verificar que el post real sea reciente (últimos 5 minutos)
              if (basicMatch) {
                const realPostTime = new Date(realPost.createdAt).getTime();
                const pendingPostTime = new Date(pendingPost.createdAt).getTime();
                const timeDiff = Math.abs(realPostTime - pendingPostTime);
                const isRecent = timeDiff < 5 * 60 * 1000; // 5 minutos
                
                console.log(`⏰ Comparación de tiempo en fetchPosts: ${timeDiff}ms, Reciente: ${isRecent}`);
                return isRecent;
              }
              
              return false;
            });
            
            if (matchingRealPost) {
              // Remover el post temporal ya que se completó la publicación
              console.log('🎉 Post temporal completado en fetchPosts:', pendingPost.id);
              console.log('📝 Descripción:', pendingPost.description);
              removePendingPost(pendingPost.id);
            }
          });
        }
      } else {
        throw new Error('Error al cargar publicaciones');
      }
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
    
    // Verificar manualmente posts temporales después del refresh
    if (pendingPosts.length > 0) {
      console.log('🔄 Verificación manual de posts temporales después del refresh...');
      setTimeout(() => {
        checkPendingPostsStatus();
      }, 1000);
    }
    
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
      
      // Verificar posts temporales al enfocar la pantalla
      if (pendingPosts.length > 0) {
        console.log('🔍 Verificación inicial de posts temporales al enfocar...');
        setTimeout(() => {
          checkPendingPostsStatus();
        }, 1000); // Esperar 1 segundo para que se carguen los posts
      }
    }, [])
  );

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
            console.log('Post temporal duplicado detectado, no se agrega');
            return prev;
          }
          
          console.log('Post temporal agregado:', tempPost.id);
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

      console.log('🔍 Verificando estado de posts temporales...');
      
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
        
        console.log(`📊 Posts totales: ${allPosts.length}`);
        console.log(`👤 Posts del usuario: ${userPosts.length}`);
        console.log(`⏳ Posts temporales pendientes: ${pendingPosts.length}`);
        
        // Debug: Mostrar información de los posts
        if (allPosts.length > 0) {
          console.log('🔍 Primer post:', {
            id: allPosts[0].id,
            author: allPosts[0].author,
            description: allPosts[0].description?.substring(0, 30)
          });
        }
        
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
              
              console.log(`⏰ Comparación de tiempo: ${timeDiff}ms, Reciente: ${isRecent}`);
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
                
                console.log(`🔍 Post encontrado en todos los posts:`, realPost.id);
                console.log(`📝 Descripción real:`, realPost.description);
                console.log(`📝 Descripción temporal:`, pendingPost.description);
                console.log(`⏰ Comparación de tiempo: ${timeDiff}ms, Reciente: ${isRecent}`);
                return isRecent;
              }
              
              return false;
            });
          }
          
          if (matchingRealPost) {
            console.log('🎉 Post temporal completado:', pendingPost.id);
            console.log('📝 Descripción:', pendingPost.description);
            removePendingPost(pendingPost.id);
          } else {
            // Verificar si el post temporal ha estado demasiado tiempo (más de 2 minutos)
            const pendingPostTime = new Date(pendingPost.createdAt).getTime();
            const currentTime = new Date().getTime();
            const timeElapsed = currentTime - pendingPostTime;
            const maxWaitTime = 2 * 60 * 1000; // 2 minutos
            
            if (timeElapsed > maxWaitTime) {
              console.log('⏰ Post temporal expirado (más de 2 minutos):', pendingPost.id);
              console.log('🔄 Forzando limpieza del post temporal');
              removePendingPost(pendingPost.id);
            }
          }
        });
      } else {
        console.log('❌ Error en API de posts:', response.status);
      }
    } catch (error) {
      console.error('❌ Error verificando estado de posts temporales:', error);
    }
  };

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
          <>
            {/* Mostrar posts en espera primero */}
            {pendingPosts.map((post) => (
              <PendingPostCard 
                key={post.id} 
                post={post}
                progress={post.progress || 0}
              />
            ))}
            
            {/* Mostrar posts normales */}
            {posts.map((post) => (
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
            ))}
          </>
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
