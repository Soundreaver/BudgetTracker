import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { CustomButton } from './CustomButton';

type EmptyStateVariant = 
  | 'transactions'
  | 'budgets'
  | 'categories'
  | 'savings'
  | 'reports'
  | 'search';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: string;
  title: string;
  message: string;
  actionLabel: string;
}> = {
  transactions: {
    icon: '💸',
    title: 'No Transactions Yet',
    message: 'Start tracking your expenses and income by adding your first transaction.',
    actionLabel: 'Add Transaction',
  },
  budgets: {
    icon: '🎯',
    title: 'No Budgets Set',
    message: 'Create a budget to keep your spending on track and reach your financial goals.',
    actionLabel: 'Create Budget',
  },
  categories: {
    icon: '🏷️',
    title: 'No Categories',
    message: 'Add categories to organize your transactions better.',
    actionLabel: 'Add Category',
  },
  savings: {
    icon: '🏦',
    title: 'No Savings Goals',
    message: 'Set savings goals to help you save for what matters most.',
    actionLabel: 'Create Goal',
  },
  reports: {
    icon: '📊',
    title: 'No Data Available',
    message: 'Add some transactions to see your spending insights and reports.',
    actionLabel: 'Add Transaction',
  },
  search: {
    icon: '🔍',
    title: 'No Results Found',
    message: 'Try adjusting your search or filters to find what you\'re looking for.',
    actionLabel: 'Clear Filters',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'transactions',
  title,
  message,
  icon,
  actionLabel,
  onAction,
}) => {
  const config = variantConfig[variant];

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.container}
    >
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring', 
          damping: 15,
          stiffness: 150,
          delay: 100,
        }}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon || config.icon}</Text>
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 200 }}
      >
        <Text style={styles.title}>{title || config.title}</Text>
        <Text style={styles.message}>{message || config.message}</Text>
      </MotiView>

      {onAction && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 300 }}
        >
          <CustomButton
            onPress={onAction}
            variant="primary"
            size="lg"
            hapticFeedback="medium"
          >
            {actionLabel || config.actionLabel}
          </CustomButton>
        </MotiView>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    ...typography.heading3,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
});
