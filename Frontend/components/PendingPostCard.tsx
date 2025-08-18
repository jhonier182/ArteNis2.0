import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface PendingPostCardProps {
  post: any;
}

export default function PendingPostCard({ post }: PendingPostCardProps) {
  const progressAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Animación de la barra de progreso
    const animateProgress = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: width,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(progressAnim, {
            toValue: -width,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateProgress();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header del post */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.username}>{post.author.username}</Text>
            <Text style={styles.timeAgo}>Publicando...</Text>
          </View>
        </View>
        
        {/* Indicador de estado */}
        <View style={styles.statusIndicator}>
          <Ionicons name="time-outline" size={20} color="#ffd700" />
        </View>
      </View>

      {/* Imagen del post */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
        
        {/* Overlay de estado */}
        <View style={styles.overlay}>
          <View style={styles.statusContainer}>
            <Ionicons name="cloud-upload-outline" size={24} color="#ffffff" />
            <Text style={styles.statusText}>Subiendo publicación...</Text>
          </View>
        </View>
      </View>

      {/* Barra de progreso delgada con animación */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              transform: [{ translateX: progressAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#00d4ff', '#ff6b9d', '#4ecdc4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 4,
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
    opacity: 0.8, // Hacer el post semi-transparente
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
    color: '#ffd700',
    fontSize: 14,
    fontStyle: 'italic',
  },
  statusIndicator: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%',
  },
  progressGradient: {
    height: '100%',
    width: '100%',
  },
});
