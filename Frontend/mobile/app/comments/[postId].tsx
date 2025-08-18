import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  hasLiked: boolean;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified: boolean;
    userType: string;
  };
  replies?: Comment[];
}

export default function CommentsScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef<TextInput>(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchComments = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await axios.get(`${apiUrl}/api/posts/${postId}/comments`, {
        params: { page: pageNum, limit: 20 },
        headers
      });

      const { comments: newComments, pagination } = response.data.data;

      if (pageNum === 1) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }

      setHasMore(pagination.currentPage < pagination.totalPages);
      setPage(pageNum);

    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'No se pudieron cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSending(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para comentar');
        return;
      }

      const response = await axios.post(`${apiUrl}/api/posts/${postId}/comments`, {
        content: newComment.trim(),
        parentId: replyingTo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newCommentData = response.data.data.comment;
      
      if (replyingTo) {
        // Es una respuesta, agregar a las replies del comentario padre
        setComments(prev => prev.map(comment => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newCommentData],
              repliesCount: comment.repliesCount + 1
            };
          }
          return comment;
        }));
        setReplyingTo(null);
      } else {
        // Es un comentario nuevo, agregar al inicio
        setComments(prev => [newCommentData, ...prev]);
      }

      setNewComment('');
      inputRef.current?.blur();

    } catch (error) {
      console.error('Error sending comment:', error);
      Alert.alert('Error', 'No se pudo enviar el comentario');
    } finally {
      setSending(false);
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await axios.post(`${apiUrl}/api/comments/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar estado local
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            hasLiked: !comment.hasLiked,
            likesCount: comment.hasLiked ? comment.likesCount - 1 : comment.likesCount + 1
          };
        }
        return comment;
      }));

    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return 'ahora';
  };

  const startReply = (comment: Comment) => {
    setReplyingTo(comment.id);
    setNewComment(`@${comment.author.username} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const renderReply = ({ item }: { item: Comment }) => (
    <View style={styles.replyContainer}>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{item.author.username}</Text>
          {item.author.isVerified && (
            <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
          )}
          <Text style={styles.timeAgo}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={() => likeComment(item.id)}
          >
            <Ionicons 
              name={item.hasLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={item.hasLiked ? "#E11D48" : "#6B7280"} 
            />
            {item.likesCount > 0 && (
              <Text style={styles.likeCount}>{item.likesCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{item.author.username}</Text>
          {item.author.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
          )}
          <Text style={styles.timeAgo}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={() => likeComment(item.id)}
          >
            <Ionicons 
              name={item.hasLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={item.hasLiked ? "#E11D48" : "#6B7280"} 
            />
            {item.likesCount > 0 && (
              <Text style={styles.likeCount}>{item.likesCount}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => startReply(item)}
          >
            <Text style={styles.replyText}>Responder</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          <FlatList
            data={item.replies}
            renderItem={renderReply}
            keyExtractor={(reply) => reply.id}
            scrollEnabled={false}
          />
          {item.repliesCount > 3 && (
            <TouchableOpacity style={styles.viewMoreReplies}>
              <Text style={styles.viewMoreText}>
                Ver {item.repliesCount - 3} respuestas más
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchComments(page + 1);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comentarios</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comentarios</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        style={styles.commentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay comentarios aún</Text>
            <Text style={styles.emptySubtext}>¡Sé el primero en comentar!</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Respondiendo a {comments.find(c => c.id === replyingTo)?.author.username}
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Escribe un comentario..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={sendComment}
            disabled={sending || !newComment.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  replyContainer: {
    paddingVertical: 8,
    marginLeft: 32,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
    marginRight: 6,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  replyButton: {
    padding: 4,
  },
  replyText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 16,
  },
  viewMoreReplies: {
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  replyingToText: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#22C55E',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
