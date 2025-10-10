import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { format } from 'date-fns';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { triggerHaptic } from '@/utils/haptics';
import { CustomButton } from './CustomButton';
import type { PendingTransaction } from '@/types/database';

interface PendingTransactionCardProps {
  transaction: PendingTransaction;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  currencyCode?: string;
  onApprove: (id: string) => void;
  onEdit: (id: string) => void;
  onReject: (id: string) => void;
}

export const PendingTransactionCard: React.FC<PendingTransactionCardProps> = ({
  transaction,
  category,
  currencyCode = 'USD',
  onApprove,
  onEdit,
  onReject,
}) => {
  const handleApprove = async () => {
    await triggerHaptic('success');
    onApprove(transaction.id);
  };

  const handleEdit = async () => {
    await triggerHaptic('light');
    onEdit(transaction.id);
  };

  const handleReject = async () => {
    await triggerHaptic('warning');
    onReject(transaction.id);
  };

  // Determine confidence badge color
  const confidenceScore = transaction.confidence_score || 0;
  let confidenceBadgeColor: string;
  let confidenceText: string;

  if (confidenceScore > 0.8) {
    confidenceBadgeColor = colors.success[500];
    confidenceText = 'High';
  } else if (confidenceScore >= 0.5) {
    confidenceBadgeColor = colors.warning[500];
    confidenceText = 'Medium';
  } else {
    confidenceBadgeColor = colors.error[500];
    confidenceText = 'Low';
  }

  const merchantName = transaction.merchant_name || 'Unknown Merchant';
  const formattedAmount = formatCurrency(transaction.suggested_amount, currencyCode);
  const formattedDate = format(new Date(transaction.suggested_date), 'MMM dd, yyyy');
  
  // Determine amount color based on transaction type
  const amountColor = transaction.suggested_type === 'income' 
    ? colors.success[500] 
    : colors.error[500];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[styles.container, shadows.md]}
    >
      {/* Header with merchant and amount */}
      <View style={styles.header}>
        <View style={styles.merchantContainer}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {merchantName}
          </Text>
          <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceBadgeColor}20` }]}>
            <View style={[styles.confidenceDot, { backgroundColor: confidenceBadgeColor }]} />
            <Text style={[styles.confidenceText, { color: confidenceBadgeColor }]}>
              {confidenceText}
            </Text>
          </View>
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>{formattedAmount}</Text>
      </View>

      {/* Category and Date */}
      <View style={styles.infoRow}>
        <View style={styles.categoryContainer}>
          {category ? (
            <>
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </>
          ) : (
            <Text style={styles.noCategoryText}>No category suggested</Text>
          )}
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {transaction.suggested_description}
      </Text>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionButton}>
          <CustomButton
            onPress={handleReject}
            variant="danger"
            size="sm"
            fullWidth
          >
            Reject
          </CustomButton>
        </View>
        <View style={styles.actionButton}>
          <CustomButton
            onPress={handleEdit}
            variant="outline"
            size="sm"
            fullWidth
          >
            Edit
          </CustomButton>
        </View>
        <View style={styles.actionButton}>
          <CustomButton
            onPress={handleApprove}
            variant="primary"
            size="sm"
            fullWidth
          >
            Approve
          </CustomButton>
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  merchantContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  merchantName: {
    ...typography.heading5,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    ...typography.caption,
    fontWeight: '600',
  },
  amount: {
    ...typography.heading4,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    ...typography.body,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  noCategoryText: {
    ...typography.body,
    color: colors.neutral[400],
    fontStyle: 'italic',
  },
  date: {
    ...typography.small,
    color: colors.neutral[500],
  },
  description: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
