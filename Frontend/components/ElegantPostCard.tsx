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
}

export default function ElegantPostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onFollow,
  onUserPress,
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
        
        {post.author.id !== currentUserId && (
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

      {/* Descripción del post */}
      {post.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={3}>
            {post.description}
          </Text>
        </View>
      )}

      {/* Métricas de engagement */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Ionicons name="eye-outline" size={20} color="#666" />
          <Text style={styles.metricText}>{formatNumber(post.viewsCount || 0)}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.metricText}>{formatNumber(post.commentsCount || 0)}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.metricText}>{formatNumber(post.sharesCount || 0)}</Text>
        </View>
        
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 8,
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
    paddingVertical: 16,
  },
  description: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
});
