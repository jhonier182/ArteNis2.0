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
  description?: string;  // Opcional porque puede ser null
  hashtags?: string[];   // Opcional porque puede ser null
  likesCount?: number;   // Opcional porque puede ser null
  commentsCount?: number; // Opcional porque puede ser null
  createdAt: string;
  author: {  // Cambiado de 'user' a 'author' para coincidir con el backend
    id: string;
    username: string;
    fullName: string;
    avatar?: string;      // Opcional porque puede ser null
    isVerified?: boolean; // Opcional porque puede ser null
  };
  isLiked?: boolean;     // Opcional porque puede ser null
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onUserPress: (userId: string) => void;
}

export default function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onUserPress 
}: PostCardProps) {
  // Validación de seguridad: verificar que post.author existe
  if (!post.author) {
    console.log('⚠️ PostCard: post.author es undefined para el post:', post.id);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Información del usuario no disponible</Text>
      </View>
    );
  }

  // Validar y establecer valores por defecto para campos opcionales
  const safeHashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
  const safeCommentsCount = typeof post.commentsCount === 'number' ? post.commentsCount : 0;
  const safeLikesCount = typeof post.likesCount === 'number' ? post.likesCount : 0;
  const safeDescription = post.description || '';

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(safeLikesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(post.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Ahora';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
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
            source={{ uri: post.author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' }} 
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.author.username}</Text>
              {post.author.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#00d4ff" />
              )}
            </View>
            <Text style={styles.fullName}>{post.author.fullName}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Imagen del post */}
      <TouchableOpacity style={styles.imageContainer}>
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Acciones del post */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#ff6b6b" : "#ffffff"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post.id)}>
            <Ionicons name="chatbubble-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => onShare(post.id)}>
            <Ionicons name="paper-plane-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <View style={styles.likesSection}>
        <Text style={styles.likesText}>
          <Text style={styles.likesCount}>{formatNumber(likesCount)}</Text> me gusta
        </Text>
      </View>

      {/* Descripción y hashtags */}
      <View style={styles.descriptionSection}>
        <Text style={styles.description}>
          <Text style={styles.usernameInDescription}>{post.author.username}</Text>
          <Text> {safeDescription}</Text>
        </Text>
        {safeHashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {safeHashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Comentarios */}
      {safeCommentsCount > 0 && (
        <TouchableOpacity style={styles.commentsSection} onPress={() => onComment(post.id)}>
          <Text style={styles.commentsText}>
            Ver los {formatNumber(safeCommentsCount)} comentarios
          </Text>
        </TouchableOpacity>
      )}

      {/* Fecha */}
      <Text style={styles.dateText}>{formatDate(post.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  username: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fullName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: width,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
  likesSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  likesCount: {
    fontWeight: 'bold',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  description: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  usernameInDescription: {
    fontWeight: '600',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  hashtag: {
    color: '#00d4ff',
    fontSize: 16,
    marginRight: 8,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  dateText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
