import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Animated,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { useRouter } from 'expo-router';
import { createShadow, shadows } from '../utils/shadowHelper';
import { NeutralColors, BrandColors, TextColors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

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
  size?: 'small' | 'medium' | 'large'; // Tamaño de la imagen
}

export default function ElegantPostCard({
  post,
  onLike,
  onComment,
  onEditPost,
  onDeletePost,
  onFollowUser,
  size = 'medium'
}: ElegantPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [spinValue] = useState(new Animated.Value(0));
  const [showPostModal, setShowPostModal] = useState(false);
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

  const handleImagePress = () => {
    setShowPostModal(true);
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

  // Función para obtener el tamaño de la imagen según el prop size
  const getImageSize = () => {
    switch (size) {
      case 'small':
        return width * 0.33; // 33% del ancho de pantalla
      case 'large':
        return width * 0.66; // 66% del ancho de pantalla
      case 'medium':
      default:
        return width * 0.33; // 33% del ancho de pantalla (tamaño por defecto)
    }
  };

  const imageSize = getImageSize();

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
    <>
      {/* Solo la imagen - sin información */}
      <TouchableOpacity 
        style={[styles.imageOnlyContainer, { width: imageSize, height: imageSize }]} 
        onPress={handleImagePress}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.imageOnly}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Modal completo con toda la información */}
      <Modal
        visible={showPostModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header del modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPostModal(false)}
            >
              <Ionicons name="close" size={24} color={TextColors.inverse} />
            </TouchableOpacity>
          </View>

          {/* Contenido del modal */}
          <View style={styles.modalContent}>
            {/* Header del post */}
            <View style={styles.postHeader}>
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
              
              {renderFollowButton()}
            </View>

            {/* Imagen del post */}
            <View style={styles.modalImageContainer}>
              <Image 
                source={{ uri: post.imageUrl }} 
                style={styles.modalPostImage}
                resizeMode="cover"
              />
            </View>

            {/* Descripción del post */}
            {post.description && (
              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionRow}>
                  <Text style={styles.description}>
                    {post.description}
                  </Text>
                  <View style={styles.viewsIconContainer}>
                    <Ionicons name="eye-outline" size={16} color={TextColors.inverse} />
                    <Text style={styles.viewsText}>{formatNumber(post.viewsCount || 0)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Métricas de engagement */}
            <View style={styles.metricsContainer}>
              <TouchableOpacity style={styles.metricItem} onPress={handleLike} disabled={isLiking}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? BrandColors.error : TextColors.inverse} 
                />
                <Text style={[styles.metricText, isLiked && styles.likedText]}>
                  {formatNumber(likesCount)}
                </Text>
                {isLiking && (
                  <Animated.View style={[styles.loadingIndicator, { transform: [{ rotate: spin }] }]}>
                    <Ionicons name="sync" size={12} color={TextColors.inverse} />
                  </Animated.View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.metricItem} onPress={() => onComment(post.id)}>
                <Ionicons name="chatbubble-outline" size={24} color={TextColors.inverse} />
                <Text style={styles.metricText}>{formatNumber(post.commentsCount || 0)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/*
EJEMPLO DE USO:

// Publicación pequeña (30% del ancho)
<ElegantPostCard
  post={post}
  onLike={handleLike}
  onComment={handleComment}
  onFollowUser={handleFollowUser}
  size="small"
/>

// Publicación mediana (50% del ancho) - por defecto
<ElegantPostCard
  post={post}
  onLike={handleLike}
  onComment={handleComment}
  onFollowUser={handleFollowUser}
  size="medium"
/>

// Publicación grande (80% del ancho)
<ElegantPostCard
  post={post}
  onLike={handleLike}
  onComment={handleComment}
  onFollowUser={handleFollowUser}
  size="large"
/>

CARACTERÍSTICAS:
- Solo muestra la imagen (sin información)
- Al hacer click se abre un modal completo con toda la información
- Diferentes tamaños disponibles: small, medium, large
- Modal incluye: header del usuario, imagen grande, descripción, métricas
- Funcionalidades: like, comentarios, seguir usuario, opciones del post
*/

const styles = StyleSheet.create({
  imageOnlyContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  imageOnly: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: NeutralColors.black,
    paddingTop: height * 0.1, // Espacio para el header
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal:2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray800,
  },
  closeButton: {
    padding: 10,
  },
  modalContent: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: TextColors.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeAgo: {
    color: TextColors.inverse,
    fontSize: 14,
  },
  modalImageContainer: {
    width: '100%',
    height: width * 0.8, // Tamaño fijo para la imagen en el modal
    overflow: 'hidden',
    marginBottom: 15,
  },
  modalPostImage: {
    width: '100%',
    height: '100%',
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  descriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    color: TextColors.inverse,
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  viewsIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    color: TextColors.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: NeutralColors.gray900,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: NeutralColors.gray800,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    color: TextColors.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
  likedText: {
    color: BrandColors.error,
  },
  moreButton: {
    padding: 8,
  },
  loadingIndicator: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: NeutralColors.gray700,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: {
    color: TextColors.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  followingText: {
    color: TextColors.inverse,
  },
});
