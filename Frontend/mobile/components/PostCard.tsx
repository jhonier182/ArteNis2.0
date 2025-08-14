import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PostData {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified: boolean;
    userType: string;
  };
  hasLiked?: boolean;
}

interface PostCardProps {
  post: PostData;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onProfile: (userId: string) => void;
}

const { width } = Dimensions.get('window');

export default function PostCard({ post, onLike, onComment, onProfile }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return postDate.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return 'ahora';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={() => onProfile(post.author.id)}
        >
          <View style={styles.avatarContainer}>
            {post.author.avatar ? (
              <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {post.author.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {post.author.userType === 'artist' && (
              <LinearGradient
                colors={['#A4E34A', '#22C55E']}
                style={styles.artistBadge}
              >
                <Ionicons name="brush" size={10} color="white" />
              </LinearGradient>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.author.username}</Text>
              {post.author.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              )}
            </View>
            <Text style={styles.timeAgo}>{formatTime(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Media */}
      <View style={styles.mediaContainer}>
        <Image 
          source={{ uri: post.mediaUrl }} 
          style={styles.media}
          resizeMode="cover"
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#E11D48" : "#333"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push(`/comments/${post.id}`)}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.likesText}>
          {formatCount(likesCount)} {likesCount === 1 ? 'like' : 'likes'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        {post.description && (
          <Text style={styles.description} numberOfLines={2}>
            {post.description}
          </Text>
        )}
        
        {post.commentsCount > 0 && (
          <TouchableOpacity onPress={() => router.push(`/comments/${post.id}`)}>
            <Text style={styles.viewComments}>
              Ver {post.commentsCount === 1 ? 'comentario' : `los ${formatCount(post.commentsCount)} comentarios`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 12,
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  artistBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
    marginRight: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  moreButton: {
    padding: 4,
  },
  mediaContainer: {
    width: width,
    height: width,
  },
  media: {
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
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  stats: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  viewComments: {
    fontSize: 14,
    color: '#6B7280',
  },
});
