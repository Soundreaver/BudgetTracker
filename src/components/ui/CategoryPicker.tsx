import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedId?: number;
  onSelect: (category: Category) => void;
  columns?: number;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedId,
  onSelect,
  columns = 3,
}) => {
  const handleSelect = async (category: Category) => {
    await triggerHaptic('selection');
    onSelect(category);
  };

  // Split categories into rows
  const rows: Category[][] = [];
  for (let i = 0; i < categories.length; i += columns) {
    rows.push(categories.slice(i, i + columns));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((item, itemIndex) => {
            const isSelected = item.id === selectedId;
            const index = rowIndex * columns + itemIndex;

            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 200, delay: index * 50 }}
                style={styles.itemWrapper}
              >
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.selectedItem,
                    { borderColor: item.color },
                    isSelected && { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && styles.selectedText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemWrapper: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  categoryItem: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  selectedItem: {
    borderWidth: 2,
    ...shadows.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  categoryName: {
    ...typography.small,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  selectedText: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[900],
  },
});
