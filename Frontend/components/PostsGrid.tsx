import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const { width } = Dimensions.get('window');
const POSTS_PER_PAGE = 12; // 3 columnas x 4 filas por página

interface Post {
  id: string;
  imageUrl: string;
  type: 'photo' | 'video';
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface PostsGridProps {
  userId: string;
  onPostPress?: (post: Post) => void;
  isEmbedded?: boolean;
}

export default function PostsGrid({ userId, onPostPress, isEmbedded = false }: PostsGridProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerAnimation]);

  const fetchPosts = useCallback(async (page: number, pageSize: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No hay token');
      
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/posts/user/${userId}?page=${page}&limit=${pageSize}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      const posts = data.data?.posts || [];
      const hasMore = data.data?.pagination?.currentPage < data.data?.pagination?.totalPages;
      
      return {
        data: posts,
        hasMore: hasMore
      };
    } catch (error) {
      console.error('💥 Error fetching posts:', error);
      throw error;
    }
  }, [userId]);

  const {
    data: posts,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useInfiniteScroll(fetchPosts, { pageSize: POSTS_PER_PAGE });



  // Type assertion to fix TypeScript error
  const typedPosts = posts as Post[];

  // Cargar posts iniciales cuando el componente se monte
  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  const renderPostThumbnail = ({ item: post }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.postThumbnail}
      onPress={() => onPostPress?.(post)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: post.imageUrl }} 
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
      
      {/* Indicador de video */}
      {post.type === 'video' && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play" size={12} color="#ffffff" />
        </View>
      )}
      
      {/* Indicador de likes */}
      {post.likesCount > 0 && (
        <View style={styles.likesIndicator}>
          <Ionicons name="heart" size={10} color="#ff6b6b" />
          <Text style={styles.likesCount}>{post.likesCount}</Text>
        </View>
      )}
      
      {/* Indicador de comentarios */}
      {post.commentsCount > 0 && (
        <View style={styles.commentsIndicator}>
          <Ionicons name="chatbubble" size={10} color="#4ecdc4" />
          <Text style={styles.commentsCount}>{post.commentsCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.endFooter}>
          <Text style={styles.endText}>✨ Has visto todas las publicaciones</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="small" color="#FF9800" />
        </View>
        <Text style={styles.loadingText}>Cargando más...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color="rgba(255,255,255,0.3)" />
      <Text style={styles.emptyTitle}>No tienes publicaciones aún</Text>
      <Text style={styles.emptySubtitle}>Comparte tu trabajo para que aparezca aquí</Text>

    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={styles.skeletonThumbnail}>
          <Animated.View 
            style={[
              styles.skeletonImage,
              {
                opacity: shimmerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              },
            ]} 
          />
        </View>
      ))}
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isEmbedded && styles.embeddedContainer]}>
      {!isEmbedded && <Text style={styles.sectionTitle}>Mis Publicaciones</Text>}
      
      {isEmbedded ? (
        // Vista embebida sin FlatList para el perfil
        <View style={styles.embeddedGrid}>
          {loading && typedPosts.length === 0 ? (
            // Skeleton loading para vista embebida
            Array.from({ length: 6 }, (_, index) => (
              <View key={index} style={styles.embeddedPostThumbnail}>
                <Animated.View 
                  style={[
                    styles.skeletonImage,
                    {
                      opacity: shimmerAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.7],
                      }),
                    },
                  ]} 
                />
              </View>
            ))
          ) : typedPosts.length > 0 ? (
            typedPosts.map((post) => (
              <View key={post.id} style={styles.embeddedPostThumbnail}>
                {renderPostThumbnail({ item: post })}
              </View>
            ))
          ) : (
            <View style={styles.embeddedEmpty}>
              <Ionicons name="images-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.embeddedEmptyText}>No tienes publicaciones aún</Text>
            </View>
          )}
        </View>
      ) : (
        // Vista normal con FlatList para uso independiente
        <FlatList
          data={typedPosts}
          renderItem={renderPostThumbnail}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={loading ? renderSkeleton : renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={loading && typedPosts.length === 0}
              onRefresh={refresh}
              tintColor="#FF9800"
              colors={["#FF9800"]}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  embeddedContainer: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  postThumbnail: {
    width: width / 3, // 3 columnas que ocupan todo el ancho
    height: width / 3,
    position: 'relative',
    borderRadius: 0, // Sin bordes redondeados para que se vean como Instagram
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  likesCount: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  commentsIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  commentsCount: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
  },
  endFooter: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  endText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  skeletonThumbnail: {
    width: width / 3,
    height: width / 3,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  embeddedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Alinear desde el inicio
    paddingHorizontal: 0, // Sin padding horizontal
  },
  embeddedPostThumbnail: {
    width: width / 3,
    height: width / 3,
    marginBottom: 0, // Sin margen entre filas
    borderRadius: 0,
    overflow: 'hidden',
  },
  embeddedLoading: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  embeddedEmpty: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
  },
  embeddedEmptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
  },

});
