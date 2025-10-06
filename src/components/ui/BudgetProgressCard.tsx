import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { ProgressBar } from './ProgressBar';
import { useSettingsStore } from '@/store';
import { formatCurrency } from '@/utils/currency';

interface BudgetProgressCardProps {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetAmount: number;
  spentAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  progressType?: 'linear' | 'circular';
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  categoryName,
  categoryIcon,
  categoryColor,
  budgetAmount,
  spentAmount,
  period,
  progressType = 'linear',
}) => {
  const { currency: currencyCode } = useSettingsStore();
  const percentage = (spentAmount / budgetAmount) * 100;
  const remaining = budgetAmount - spentAmount;
  const isOverBudget = spentAmount > budgetAmount;

  const getVariant = () => {
    if (isOverBudget) return 'error';
    if (percentage >= 90) return 'warning';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const variant = getVariant();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={[styles.container, shadows.md]}>
        <View style={styles.header}>
          <View style={styles.categoryInfo}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Text style={styles.icon}>{categoryIcon}</Text>
            </View>
            <View>
              <Text style={styles.categoryName}>{categoryName}</Text>
              <Text style={styles.period}>{period}</Text>
            </View>
          </View>
        </View>

        <View style={styles.amounts}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Spent</Text>
            <Text
              style={[
                styles.amountValue,
                { color: isOverBudget ? colors.error[500] : colors.neutral[900] },
              ]}
            >
              {formatCurrency(spentAmount, currencyCode)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>
              {isOverBudget ? 'Over' : 'Remaining'}
            </Text>
            <Text
              style={[
                styles.amountValue,
                {
                  color: isOverBudget
                    ? colors.error[500]
                    : remaining <= budgetAmount * 0.1
                    ? colors.warning[500]
                    : colors.success[500],
                },
              ]}
            >
              {formatCurrency(Math.abs(remaining), currencyCode)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Budget</Text>
            <Text style={styles.amountValue}>{formatCurrency(budgetAmount, currencyCode)}</Text>
          </View>
        </View>

        <ProgressBar
          progress={Math.min(percentage, 100)}
          variant={variant}
          showPercentage
          animated
          height={12}
        />

        {isOverBudget && (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <View style={styles.warningBanner}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                You've exceeded your budget by {(percentage - 100).toFixed(1)}%
              </Text>
            </View>
          </MotiView>
        )}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  categoryName: {
    ...typography.heading6,
    color: colors.neutral[900],
  },
  period: {
    ...typography.small,
    color: colors.neutral[500],
    textTransform: 'capitalize',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  amountValue: {
    ...typography.bodyBold,
    color: colors.neutral[900],
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    ...typography.caption,
    color: colors.error[700],
    flex: 1,
  },
});
