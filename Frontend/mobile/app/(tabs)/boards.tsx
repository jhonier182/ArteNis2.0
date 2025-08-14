import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BoardsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Colecciones</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.boardsGrid}>
          {/* Colección destacada */}
          <TouchableOpacity style={styles.featuredBoard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' }}
              style={styles.boardImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.boardOverlay}
            >
              <Text style={styles.boardTitle}>Tatuajes Tradicionales</Text>
              <Text style={styles.boardCount}>24 pins</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Colecciones pequeñas */}
          <View style={styles.smallBoardsRow}>
            <TouchableOpacity style={styles.smallBoard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=200&h=150&fit=crop' }}
                style={styles.smallBoardImage}
              />
              <Text style={styles.smallBoardTitle}>Minimalistas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBoard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop' }}
                style={styles.smallBoardImage}
              />
              <Text style={styles.smallBoardTitle}>Geométricos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.smallBoardsRow}>
            <TouchableOpacity style={styles.smallBoard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=200&h=150&fit=crop' }}
                style={styles.smallBoardImage}
              />
              <Text style={styles.smallBoardTitle}>Acuarela</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBoard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop' }}
                style={styles.smallBoardImage}
              />
              <Text style={styles.smallBoardTitle}>Japoneses</Text>
            </TouchableOpacity>
          </View>

          {/* Botón para crear nueva colección */}
          <TouchableOpacity style={styles.createBoardButton}>
            <Ionicons name="add-circle-outline" size={48} color="#666" />
            <Text style={styles.createBoardText}>Crear nueva colección</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  boardsGrid: {
    paddingTop: 20,
  },
  featuredBoard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  boardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  boardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  boardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  boardCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  smallBoardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  smallBoard: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  smallBoardImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  smallBoardTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  createBoardButton: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  createBoardText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
