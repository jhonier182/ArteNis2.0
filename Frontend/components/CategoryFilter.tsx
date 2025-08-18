import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface Category {
  id: string;
  name: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All', label: 'All' },
  { id: 'traditional', name: 'Traditional', label: 'Traditional' },
  { id: 'realistic', name: 'Realistic', label: 'Realistic' },
  { id: 'minimalist', name: 'Minimalist', label: 'Minimalist' },
  { id: 'color', name: 'Color', label: 'Color' },
  { id: 'blackgray', name: 'Black & Gray', label: 'Black & Gray' },
  { id: 'japanese', name: 'Japanese', label: 'Japanese' },
  { id: 'tribal', name: 'Tribal', label: 'Tribal' },
];

export default function CategoryFilter({
  categories = defaultCategories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory,
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.label}
            </Text>
            {selectedCategory === category.id && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#333',
    position: 'relative',
  },
  selectedCategory: {
    backgroundColor: '#ff6b9d',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b9d',
  },
});
