import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  imageUrl: string;
  description?: string;
  hashtags?: string[];
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  isLiked?: boolean;
  isFollowed?: boolean;
}

interface ElegantPostCardProps {
  post: Post;
  currentUserId: string; // Agregar el ID del usuario actual
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onFollow: (userId: string) => void;
  onUserPress: (userId: string) => void;
  onEditPost?: (post: Post) => void; // Función para editar post
  onDeletePost?: (post: Post) => void; // Función para eliminar post
}

export default function ElegantPostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onFollow,
  onUserPress,
  onEditPost,
  onDeletePost,
}: ElegantPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isFollowed, setIsFollowed] = useState(post.isFollowed || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(post.id);
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    onFollow(post.author.id);
  };

  const handleEditPost = () => {
    onEditPost?.(post);
  };

  const handleDeletePost = () => {
    Alert.alert(
      '🗑️ Eliminar Publicación',
      '¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDeletePost?.(post);
          },
        },
      ]
    );
  };

  const showPostOptions = () => {
    Alert.alert(
      'Opciones de Publicación',
      '¿Qué quieres hacer con esta publicación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Editar',
          style: 'default',
          onPress: handleEditPost,
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDeletePost,
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header del post */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={() => onUserPress(post.author.id)}
        >
          <Image 
            source={{ uri: post.author.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.username}>{post.author.username}</Text>
            <Text style={styles.timeAgo}>{formatDate(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Menú de tres puntos para posts propios o botón de follow para posts de otros */}
        {post.author.id === currentUserId ? (
          // Es el usuario propio - mostrar menú de tres puntos
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={showPostOptions}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          // Es otro usuario - mostrar botón de follow
          currentUserId !== 'guest' && (
            <TouchableOpacity 
              onPress={handleFollow}
              style={styles.followButtonContainer}
            >
              {!isFollowed ? (
                <LinearGradient
                  colors={['#FFCA28', '#FF9800', '#F57C00', '#E65100', '#D84315', '#C62828']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.followButton}
                >
                  <Text style={styles.followText}>
                    Follow
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.followingButton}>
                  <Text style={styles.followingText}>
                    Following
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Imagen del post */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      </View>

      {/* Descripción del post con visualizaciones */}
      <View style={styles.descriptionContainer}>
        <View style={styles.descriptionRow}>
          {post.description && (
            <Text style={styles.description} numberOfLines={3}>
              {post.description}
            </Text>
          )}
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.viewsText}>{formatNumber(post.viewsCount || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Métricas de engagement */}
      <View style={styles.metricsContainer}>
        <TouchableOpacity style={styles.metricItem} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={isLiked ? "#ff6b6b" : "#666"} 
          />
          <Text style={[styles.metricText, isLiked && styles.likedText]}>
            {formatNumber(likesCount)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.metricItem} onPress={() => onComment(post.id)}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.metricText}>{formatNumber(post.commentsCount || 0)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.metricItem} onPress={() => onShare(post.id)}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.metricText}>{formatNumber(post.sharesCount || 0)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom:4, // Aumentar el espacio entre publicaciones
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeAgo: {
    color: '#999',
    fontSize: 14,
  },
  followButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#333',
  },
  followText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingText: {
    color: '#999',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20, // Aumentar el padding vertical
  },
  descriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  description: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
    marginRight: 20,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewsText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24, // Aumentar el padding vertical para más espacio
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  likedText: {
    color: '#ff6b6b',
  },
  moreButton: {
    padding: 8,
  },
});
