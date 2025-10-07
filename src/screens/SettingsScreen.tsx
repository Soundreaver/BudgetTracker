import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  BottomSheet,
  CustomInput,
  CustomButton,
} from '@/components/ui';
import { getAllCategories, createCategory, deleteCategory } from '@/services/categoryService';
import { useSettingsStore, useAuthStore } from '@/store';
import { CURRENCIES, getCurrencyByCode, type Currency } from '@/utils/currency';
import type { Category } from '@/types/database';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export const SettingsScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  const { currency, setCurrency } = useSettingsStore();
  const selectedCurrency = getCurrencyByCode(currency);
  
  // Add category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(colors.primary[500]);
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  // Predefined color options
  const colorOptions = [
    colors.primary[500],
    colors.success[500],
    colors.error[500],
    colors.warning[500],
    colors.secondary[500],
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
  ];

  // Common emoji icons for categories
  const iconOptions = [
    '🍕', '🏠', '🚗', '🎬', '🏥', '💊', '🎓', '📚',
    '👕', '✈️', '🎮', '💼', '🏋️', '🍔', '☕', '🎵',
    '📱', '💡', '🛒', '🎁', '💰', '📊', '💳', '🏦',
  ];

  const { signOut, user } = useAuthStore();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!newCategoryIcon) {
      Alert.alert('Error', 'Please select an icon');
      return;
    }

    try {
      await triggerHaptic('success');

      await createCategory({
        name: newCategoryName,
        icon: newCategoryIcon,
        color: newCategoryColor,
        type: newCategoryType,
      });

      // Reset form
      setNewCategoryName('');
      setNewCategoryIcon('');
      setNewCategoryColor(colors.primary[500]);
      setNewCategoryType('expense');
      setShowAddCategoryModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await triggerHaptic('warning');
    
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
              loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await triggerHaptic('warning');
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => setShowAddCategoryModal(true)}>
              <Ionicons name="add-circle" size={28} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSpacer} />

          {categories.length > 0 ? (
            categories.map((category, index) => (
              <MotiView
                key={category.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 200, delay: index * 50 }}
                style={styles.categoryCard}
              >
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category.color },
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryType}>
                      {category.type === 'income' ? 'Income' : 'Expense'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(category.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                </TouchableOpacity>
              </MotiView>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first category</Text>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionSpacer} />
          
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceIcon}>👤</Text>
              <View>
                <Text style={styles.preferenceLabel}>Email</Text>
                <Text style={styles.preferenceValue}>
                  {user?.email || 'Not logged in'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutCard}
          >
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceIcon}>🚪</Text>
              <Text style={styles.signOutLabel}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error[500]} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionSpacer} />
          
          <TouchableOpacity
            onPress={() => setShowCurrencyModal(true)}
            style={styles.preferenceCard}
          >
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceIcon}>💱</Text>
              <View>
                <Text style={styles.preferenceLabel}>Currency</Text>
                <Text style={styles.preferenceValue}>
                  {selectedCurrency.code} - {selectedCurrency.name}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>


        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionSpacer} />
          <View style={styles.infoCard}>
            <Text style={styles.appName}>Budget Tracker</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Track your income and expenses with ease
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <BottomSheet
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        title="Add Category"
        snapPoint={85}
      >
        <CustomInput
          label="Category Name"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="e.g., Food, Transport, Salary..."
        />

        <View style={styles.typeSelector}>
          <TouchableOpacity
            onPress={() => setNewCategoryType('expense')}
            style={[
              styles.typeButton,
              newCategoryType === 'expense' && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                newCategoryType === 'expense' && styles.typeButtonTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNewCategoryType('income')}
            style={[
              styles.typeButton,
              newCategoryType === 'income' && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                newCategoryType === 'income' && styles.typeButtonTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Select Icon</Text>
          <View style={styles.sectionSpacer} />
          <View style={styles.iconGrid}>
            {iconOptions.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setNewCategoryIcon(icon)}
                style={[
                  styles.iconOption,
                  newCategoryIcon === icon && styles.iconOptionSelected,
                ]}
              >
                <Text style={styles.iconOptionText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Select Color</Text>
          <View style={styles.sectionSpacer} />
          <View style={styles.colorGrid}>
            {colorOptions.map((color, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setNewCategoryColor(color)}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newCategoryColor === color && styles.colorOptionSelected,
                ]}
              >
                {newCategoryColor === color && (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonSpacer} />
        <CustomButton
          onPress={handleAddCategory}
          variant="primary"
          size="lg"
          fullWidth
          hapticFeedback="medium"
        >
          Add Category
        </CustomButton>
      </BottomSheet>

      {/* Currency Picker Modal */}
      <BottomSheet
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Select Currency"
        snapPoint={75}
      >
        <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
          {CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              onPress={async () => {
                await triggerHaptic('selection');
                setCurrency(curr.code);
                setShowCurrencyModal(false);
              }}
              style={styles.currencyOption}
            >
              <View style={styles.currencyLeft}>
                <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                <View>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                  <Text style={styles.currencyCode}>{curr.code}</Text>
                </View>
              </View>
              {currency === curr.code && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSpacer: {
    height: spacing.md,
  },
  buttonSpacer: {
    height: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.neutral[900],
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  categoryType: {
    ...typography.small,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.heading6,
    color: colors.neutral[700],
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.small,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  appName: {
    ...typography.heading3,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  appVersion: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  appDescription: {
    ...typography.body,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  typeButtonText: {
    ...typography.body,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  modalSection: {
    marginTop: spacing.lg,
  },
  modalSectionTitle: {
    ...typography.captionBold,
    color: colors.neutral[700],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  iconOption: {
    width: Math.min(48, (width - spacing.xl * 2 - spacing.sm * 5) / 6),
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  iconOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  iconOptionText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.neutral[900],
  },
  preferenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  preferenceIcon: {
    fontSize: 28,
  },
  preferenceLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  preferenceValue: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  currencyList: {
    flex: 1,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currencySymbol: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  currencyName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  currencyCode: {
    ...typography.small,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  dangerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  dangerLabel: {
    ...typography.body,
    color: colors.error[700],
    fontWeight: '600',
  },
  dangerSubtext: {
    ...typography.caption,
    color: colors.error[600],
    marginTop: spacing.xs,
  },
  signOutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error[200],
    ...shadows.sm,
  },
  signOutLabel: {
    ...typography.body,
    color: colors.error[700],
    fontWeight: '600',
  },
});
