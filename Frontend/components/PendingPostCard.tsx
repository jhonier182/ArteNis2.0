import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface PendingPostCardProps {
  post: any;
}

export default function PendingPostCard({ post }: PendingPostCardProps) {
  const progressAnim = useRef(new Animated.Value(-width)).current;
  const [elapsedTime, setElapsedTime] = useState(0);

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
    
    // Contador de tiempo transcurrido
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

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

      {/* Indicador de estado en espera */}
      <View style={styles.pendingBanner}>
        <Ionicons name="cloud-upload-outline" size={16} color="#ffffff" />
        <Text style={styles.pendingText}>Publicación en progreso...</Text>
        <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
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

      {/* Descripción placeholder */}
      <View style={styles.descriptionContainer}>
        <View style={styles.descriptionPlaceholder}>
          <View style={styles.textPlaceholder} />
          <View style={[styles.textPlaceholder, { width: '60%' }]} />
        </View>
      </View>

      {/* Métricas placeholder */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <View style={styles.iconPlaceholder} />
          <View style={[styles.textPlaceholder, { width: 20 }]} />
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.iconPlaceholder} />
          <View style={[styles.textPlaceholder, { width: 20 }]} />
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.iconPlaceholder} />
          <View style={[styles.textPlaceholder, { width: 20 }]} />
        </View>
      </View>

      {/* Botón de reintento si pasa mucho tiempo */}
      {elapsedTime > 30 && (
        <View style={styles.retryContainer}>
          <Text style={styles.retryText}>¿La publicación está tardando mucho?</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color="#ffffff" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
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
    // Animación de progreso
    // transform: [{ translateX: -width }], // This line is removed as per the new_code
  },
  progressGradient: {
    height: '100%',
    width: '100%',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  descriptionPlaceholder: {
    gap: 8,
  },
  textPlaceholder: {
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  pendingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeText: {
    color: '#ffd700',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  retryContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  retryText: {
    color: '#ffd700',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd700',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});
