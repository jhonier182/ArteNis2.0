import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BrandColors, TextColors, NeutralColors, StateColors } from '../constants/Colors';

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
    backgroundColor: NeutralColors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
    shadowColor: NeutralColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: NeutralColors.gray100,
    borderWidth: 1,
    borderColor: NeutralColors.gray200,
    position: 'relative',
    shadowColor: NeutralColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategory: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
    shadowColor: BrandColors.primary,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: TextColors.secondary,
  },
  selectedCategoryText: {
    color: TextColors.inverse,
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
    backgroundColor: BrandColors.primary,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
});
