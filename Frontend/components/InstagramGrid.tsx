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
  // Función para calcular la altura de la imagen basada en su aspecto
  const getImageHeight = (imageUrl: string, baseWidth: number): number => {
    // Alturas variadas para simular diferentes aspectos de imagen como en la imagen de referencia
    const heights = [180, 220, 160, 280, 200, 240, 300, 190, 260, 170, 250, 210];
    const randomIndex = Math.abs(imageUrl.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % heights.length;
    return heights[randomIndex];
  };

  // Función para distribuir posts en dos columnas
  const distributePostsInColumns = () => {
    const columnWidth = (width - 6) / 2; // 2 columnas con 2px de separación
    const leftColumn: Post[] = [];
    const rightColumn: Post[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    posts.forEach((post) => {
      const imageHeight = getImageHeight(post.imageUrl, columnWidth);
      const margin = 2; // Margen entre imágenes
      
      // Elegir la columna con menor altura
      if (leftHeight <= rightHeight) {
        leftColumn.push(post);
        leftHeight += imageHeight + margin;
      } else {
        rightColumn.push(post);
        rightHeight += imageHeight + margin;
      }
    });

    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = distributePostsInColumns();

  const renderColumn = (columnPosts: Post[], columnSide: 'left' | 'right') => {
    return (
      <View style={styles.column}>
        {columnPosts.map((post) => {
          const imageHeight = getImageHeight(post.imageUrl, (width - 6) / 2);
          
          return (
            <View 
              key={post.id} 
              style={[
                styles.postContainer, 
                { 
                  width: (width - 6) / 2,
                  height: imageHeight,
                  marginBottom: 2
                }
              ]}
            >
              <ElegantPostCard
                post={post}
                onLike={onLike}
                onComment={onComment}
                onEditPost={onEditPost}
                onDeletePost={onDeletePost}
                onFollowUser={onFollowUser}
                size="medium"
              />
            </View>
          );
        })}
      </View>
    );
  };


  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.gridContainer}>
        {renderColumn(leftColumn, 'left')}
        {renderColumn(rightColumn, 'right')}
      </View>
      
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
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  column: {
    flex: 1,
    marginHorizontal: 1,
  },
  postContainer: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: NeutralColors.gray900,
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
