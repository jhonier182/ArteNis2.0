import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Text } from 'react-native';
import ElegantPostCard from './ElegantPostCard';
import { NeutralColors } from '../constants/Colors';

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

interface InstagramGridProps {
  posts: Post[];
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onFollowUser: (userId: string, isFollowing: boolean) => void;
  loading?: boolean;
  hasMore?: boolean;
}

export default function InstagramGrid({
  posts,
  onLike,
  onComment,
  onEditPost,
  onDeletePost,
  onFollowUser,
  loading = false,
  hasMore = false,
}: InstagramGridProps) {
  // Función para determinar el tamaño de cada post basado en su posición
  const getPostSize = (index: number): 'small' | 'medium' | 'large' => {
    // Patrón tipo Instagram: crear variación visual interesante
    const pattern = index % 8;
    
    switch (pattern) {
      case 0: // Primera imagen - grande
        return 'large';
      case 1: // Segunda imagen - pequeña
        return 'small';
      case 2: // Tercera imagen - pequeña
        return 'small';
      case 3: // Cuarta imagen - mediana
        return 'medium';
      case 4: // Quinta imagen - pequeña
        return 'small';
      case 5: // Sexta imagen - mediana
        return 'medium';
      case 6: // Séptima imagen - pequeña
        return 'small';
      case 7: // Octava imagen - pequeña
        return 'small';
      default:
        return 'medium';
    }
  };

  // Función para calcular el ancho real de cada post
  const getPostWidth = (size: 'small' | 'medium' | 'large') => {
    const gap = 1; // Espacio entre posts (mínimo)
    const totalGaps = 2; // Número de gaps en una fila
    const availableWidth = width - (gap * totalGaps); // Sin padding horizontal
    
    switch (size) {
      case 'large':
        return availableWidth * 0.66; // 66% del ancho disponible
      case 'medium':
        return availableWidth * 0.33; // 33% del ancho disponible
      case 'small':
        return availableWidth * 0.33; // 33% del ancho disponible
      default:
        return availableWidth * 0.33;
    }
  };

  // Función para renderizar una fila de posts
  const renderRow = (rowPosts: Post[], rowIndex: number) => {
    return (
      <View key={`row-${rowIndex}`} style={styles.row}>
        {rowPosts.map((post, postIndex) => {
          const size = getPostSize(rowIndex * 3 + postIndex);
          const postWidth = getPostWidth(size);
          
          return (
            <View key={post.id} style={[styles.postContainer, { width: postWidth }]}>
              <ElegantPostCard
                post={post}
                onLike={onLike}
                onComment={onComment}
                onEditPost={onEditPost}
                onDeletePost={onDeletePost}
                onFollowUser={onFollowUser}
                size={size}
              />
            </View>
          );
        })}
      </View>
    );
  };

  // Organizar posts en filas de 3
  const organizePostsInRows = () => {
    const rows: Post[][] = [];
    for (let i = 0; i < posts.length; i += 3) {
      rows.push(posts.slice(i, i + 3));
    }
    return rows;
  };

  const rows = organizePostsInRows();

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {rows.map((rowPosts, rowIndex) => renderRow(rowPosts, rowIndex))}
      
      {/* Indicador de carga */}
      {loading && hasMore && (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Cargando más publicaciones...</Text>
        </View>
      )}
    </ScrollView>
  );
}

/*
EJEMPLO DE USO:

import InstagramGrid from './InstagramGrid';

// En tu pantalla principal:
<InstagramGrid
  posts={posts}
  onLike={handleLike}
  onComment={handleComment}
  onEditPost={handleEditPost}
  onDeletePost={handleDeletePost}
  onFollowUser={handleFollowUser}
  loading={loading}
  hasMore={hasMore}
/>

CARACTERÍSTICAS DEL GRID:
- Layout tipo Instagram con imágenes de diferentes tamaños
- Patrón visual variado: large (65%), medium (35%), small (32%)
- Organización automática en filas de 3 posts
- Espaciado uniforme entre posts (2px)
- Scroll vertical suave
- Fondo negro consistente con el modo oscuro
- Responsive: se adapta al ancho de la pantalla
- Indicador de carga al final

PATRÓN DE TAMAÑOS:
- Índice 0: Large (65% del ancho) - Imagen destacada
- Índice 1: Small (32% del ancho) - Imagen pequeña
- Índice 2: Small (32% del ancho) - Imagen pequeña
- Índice 3: Medium (35% del ancho) - Imagen mediana
- Índice 4: Small (32% del ancho) - Imagen pequeña
- Índice 5: Medium (35% del ancho) - Imagen mediana
- Índice 6: Small (32% del ancho) - Imagen pequeña
- Índice 7: Small (32% del ancho) - Imagen pequeña
- Se repite cada 8 posts para crear variación visual

RESULTADO:
- Grid visualmente atractivo y variado
- Mejor aprovechamiento del espacio de pantalla
- Experiencia similar a Instagram
- Fácil navegación y visualización
- Imágenes solo se muestran, toda la información en modal al hacer click
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeutralColors.black,
  },
  contentContainer: {
    paddingVertical: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  postContainer: {
    // El ancho se establece dinámicamente
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: NeutralColors.gray400,
  },
});
