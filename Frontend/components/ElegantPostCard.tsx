import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { useRouter } from 'expo-router';
import { createShadow, shadows } from '../utils/shadowHelper';

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
    isFollowing?: boolean;
    followersCount?: number;
  };
  isLiked?: boolean;
}

interface ElegantPostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onFollowUser: (userId: string, isFollowing: boolean) => void;
}

export default function ElegantPostCard({
  post,
  onLike,
  onComment,
  onEditPost,
  onDeletePost,
  onFollowUser,
}: ElegantPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [spinValue] = useState(new Animated.Value(0));
  const { user } = useUser();
  const router = useRouter();

  // Sincronizar estado local con props cuando cambien
  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setLikesCount(post.likesCount || 0);
  }, [post.isLiked, post.likesCount]);

  // Animación de rotación para el indicador de carga
  useEffect(() => {
    if (isLiking) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isLiking, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleLike = async () => {
    if (isLiking) return; // Evitar múltiples clicks
    
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    
    // Actualizar estado local inmediatamente (optimistic update)
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    setIsLiking(true);
    
    try {
      // Llamar a la función del padre para manejar la API
      await onLike(post.id);
    } catch (error) {
      // Si hay error, revertir el estado local
      setIsLiked(!newIsLiked);
      setLikesCount(!newIsLiked ? likesCount + 1 : likesCount - 1);
      
      // Mostrar alerta de error
      Alert.alert(
        'Error',
        'No se pudo procesar el like. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollowUser = () => {
    const isFollowing = post.author.isFollowing || false;
    onFollowUser(post.author.id, isFollowing);
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

  const handleUserPress = () => {
    if (post.author.id === user?.id) {
      // Si es el usuario actual, ir a su perfil
      router.push('/(tabs)/profile');
    } else {
      // Si es otro usuario, mostrar alerta temporal
      Alert.alert('Perfil de Usuario', `Perfil de ${post.author.username}`);
    }
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

  const renderFollowButton = () => {
    if (post.author.id === user?.id) {
      return (
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={showPostOptions}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#ffffff" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        onPress={handleFollowUser}
        style={styles.followButtonContainer}
      >
        {!post.author.isFollowing ? (
          <LinearGradient
            colors={['#FFCA28', '#FF9800', '#F57C00', '#E65100', '#D84315', '#C62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.followButton}
          >
            <Text style={styles.followText}>
              Seguir
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.followingButton}>
            <Text style={styles.followingText}>
              Siguiendo
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header del post */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={handleUserPress}
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
        {renderFollowButton()}
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
        <TouchableOpacity style={styles.metricItem} onPress={handleLike} disabled={isLiking}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={isLiked ? "#ff6b6b" : "#666"} 
          />
          <Text style={[styles.metricText, isLiked && styles.likedText]}>
            {formatNumber(likesCount)}
          </Text>
          {isLiking && (
            <Animated.View style={[styles.loadingIndicator, { transform: [{ rotate: spin }] }]}>
              <Ionicons name="sync" size={12} color="#666" />
            </Animated.View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.metricItem} onPress={() => onComment(post.id)}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.metricText}>{formatNumber(post.commentsCount || 0)}</Text>
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
    ...shadows.large,
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
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
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
  loadingIndicator: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
