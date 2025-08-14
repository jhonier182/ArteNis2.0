import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  createdAt: string;
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'explore' | 'foryou'>('explore');
  const router = useRouter();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.6:3000';

  const fetchPosts = useCallback(async (pageNum: number, refresh = false) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Intentar refresh del token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/users/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (refreshResponse.ok) {
            const { accessToken } = await refreshResponse.json();
            await AsyncStorage.setItem('token', accessToken);
            // Reintentar la petición original
            return fetchPosts(pageNum, refresh);
          }
        }
        router.replace('/auth/login');
        return;
      }

      if (!response.ok) throw new Error('Error al cargar posts');

      const data = await response.json();
      
      if (refresh) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      
      setHasMore((data.posts || []).length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
    }
  }, [API_BASE_URL, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts(1, true);
    setRefreshing(false);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts(1, true);
    }, [fetchPosts])
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      
      {/* Overlay con información del post */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.postOverlay}
      >
        <View style={styles.postInfo}>
          <View style={styles.authorInfo}>
            <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
            <Text style={styles.authorUsername}>{item.author.username}</Text>
          </View>
          <Text style={styles.postTitle}>{item.title}</Text>
        </View>
      </LinearGradient>

      {/* Botones de acción a la derecha */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header con tabs */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'explore' && styles.activeTab]}
            onPress={() => setSelectedTab('explore')}
          >
            <Text style={[styles.tabText, selectedTab === 'explore' && styles.activeTabText]}>
              Explore
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'foryou' && styles.activeTab]}
            onPress={() => setSelectedTab('foryou')}
          >
            <Text style={[styles.tabText, selectedTab === 'foryou' && styles.activeTabText]}>
              For you
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed de posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        style={styles.feed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 21,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
  },
  feed: {
    flex: 1,
  },
  postContainer: {
    width,
    height,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  postInfo: {
    marginBottom: 100, // Espacio para la navegación inferior
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  authorUsername: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  postTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  actionButtons: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
});
