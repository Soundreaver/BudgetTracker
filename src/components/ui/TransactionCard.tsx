import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Swipeable } from 'react-native-gesture-handler';
import { triggerHaptic } from '@/utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { format } from 'date-fns';
import { useSettingsStore } from '@/store';
import { formatCurrency } from '@/utils/currency';

interface TransactionCardProps {
  id: number;
  amount: number;
  description: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  type: 'expense' | 'income';
  onPress?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  id,
  amount,
  description,
  category,
  date,
  type,
  onPress,
  onEdit,
  onDelete,
}) => {
  const handlePress = async () => {
    await triggerHaptic('light');
    onPress?.();
  };

  const handleEdit = async () => {
    await triggerHaptic('medium');
    onEdit?.(id);
  };

  const handleDelete = async () => {
    await triggerHaptic('heavy');
    onDelete?.(id);
  };

  const renderRightActions = () => {
    return (
      <View style={styles.actionsContainer}>
        {onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const { currency: currencyCode } = useSettingsStore();
  const formattedAmount = type === 'expense' 
    ? `-${formatCurrency(amount, currencyCode)}` 
    : `+${formatCurrency(amount, currencyCode)}`;
  const amountColor = type === 'expense' ? colors.error[500] : colors.success[500];

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 250 }}
    >
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={[styles.container, { borderLeftColor: category.color }, shadows.sm]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.category}>{category.name}</Text>
              <Text style={styles.date}>{format(new Date(date), 'MMM dd')}</Text>
            </View>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {formattedAmount}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  category: {
    ...typography.small,
    color: colors.neutral[600],
  },
  date: {
    ...typography.small,
    color: colors.neutral[500],
  },
  amount: {
    ...typography.heading6,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 76,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  deleteIcon: {
    fontSize: 24,
  },
});
