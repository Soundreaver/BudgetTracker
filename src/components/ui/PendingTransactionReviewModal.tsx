import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { AmountInput } from './AmountInput';
import { CategoryPicker } from './CategoryPicker';
import { CustomInput } from './CustomInput';
import { DateTimePicker } from './DateTimePicker';
import { CustomButton } from './CustomButton';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { getAllCategories } from '@/services/categoryService';
import type { PendingTransaction, Category, TransactionInsert } from '@/types/database';

interface PendingTransactionReviewModalProps {
  visible: boolean;
  onClose: () => void;
  transaction: PendingTransaction | null;
  onApprove: (id: string, finalData: Partial<TransactionInsert>) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const PendingTransactionReviewModal: React.FC<PendingTransactionReviewModalProps> = ({
  visible,
  onClose,
  transaction,
  onApprove,
  onReject,
}) => {
  const { currency: currencyCode } = useSettingsStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Initialize form with transaction data
  useEffect(() => {
    if (transaction && visible) {
      setAmount(transaction.suggested_amount.toString());
      setDescription(transaction.suggested_description);
      setSelectedCategoryId(transaction.suggested_category_id);
      setSelectedDate(new Date(transaction.suggested_date));
      setPaymentMethod(transaction.suggested_payment_method || 'card');
    }
  }, [transaction, visible]);

  const handleApprove = async () => {
    if (!transaction) return;

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Missing Category', 'Please select a category');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description');
      return;
    }

    setIsApproving(true);
    try {
      const finalData: Partial<TransactionInsert> = {
        amount: parseFloat(amount),
        description: description.trim(),
        category_id: selectedCategoryId,
        date: selectedDate.toISOString(),
        type: transaction.suggested_type,
        payment_method: paymentMethod || 'card',
      };

      await onApprove(transaction.id, finalData);
      onClose();
    } catch (error) {
      console.error('Error approving transaction:', error);
      Alert.alert('Error', 'Failed to approve transaction. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!transaction) return;

    Alert.alert('Reject Transaction', 'Are you sure you want to reject this transaction?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setIsRejecting(true);
          try {
            await onReject(transaction.id);
            onClose();
          } catch (error) {
            console.error('Error rejecting transaction:', error);
            Alert.alert('Error', 'Failed to reject transaction. Please try again.');
          } finally {
            setIsRejecting(false);
          }
        },
      },
    ]);
  };

  if (!transaction) return null;

  const merchantName = transaction.merchant_name || 'Unknown Merchant';
  const confidenceScore = transaction.confidence_score || 0;
  const confidencePercentage = Math.round(confidenceScore * 100);

  let confidenceBadgeColor: string;
  if (confidenceScore > 0.8) {
    confidenceBadgeColor = colors.success[500];
  } else if (confidenceScore >= 0.5) {
    confidenceBadgeColor = colors.warning[500];
  } else {
    confidenceBadgeColor = colors.error[500];
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Review Transaction" snapPoint={85}>
      {/* Merchant Info - Read Only */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionLabel}>Merchant</Text>
        <View style={styles.merchantCard}>
          <Text style={styles.merchantName}>{merchantName}</Text>
          <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceBadgeColor}20` }]}>
            <View style={[styles.confidenceDot, { backgroundColor: confidenceBadgeColor }]} />
            <Text style={[styles.confidenceText, { color: confidenceBadgeColor }]}>
              {confidencePercentage}% Confidence
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.fieldSection}>
        <AmountInput
          value={amount}
          onChangeValue={setAmount}
          label="Amount"
          currency={currencyCode}
          suggestedAmounts={[]}
        />
      </View>

      {/* Category Picker */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Category</Text>
        <CategoryPicker
          categories={categories
            .filter(cat => cat.type === transaction.suggested_type)
            .map((cat, idx) => ({
              id: idx,
              name: cat.name,
              icon: cat.icon,
              color: cat.color,
            }))}
          selectedId={selectedCategoryId ? categories
            .filter(cat => cat.type === transaction.suggested_type)
            .findIndex(c => c.id === selectedCategoryId) : undefined}
          onSelect={cat => {
            const filteredCats = categories.filter(c => c.type === transaction.suggested_type);
            setSelectedCategoryId(filteredCats[cat.id].id);
          }}
          columns={4}
        />
      </View>

      {/* Description Input */}
      <View style={styles.fieldSection}>
        <CustomInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          label="Description"
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Date Picker */}
      <View style={styles.fieldSection}>
        <DateTimePicker value={selectedDate} onChange={setSelectedDate} label="Date" mode="date" />
      </View>

      {/* Payment Method Input */}
      <View style={styles.fieldSection}>
        <CustomInput
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          placeholder="e.g., Credit Card, Cash, Debit Card"
          label="Payment Method"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionButton}>
          <CustomButton
            onPress={handleReject}
            variant="danger"
            size="lg"
            fullWidth
            loading={isRejecting}
            disabled={isApproving}
          >
            Reject
          </CustomButton>
        </View>
        <View style={styles.actionButton}>
          <CustomButton
            onPress={handleApprove}
            variant="primary"
            size="lg"
            fullWidth
            loading={isApproving}
            disabled={isRejecting}
          >
            Approve
          </CustomButton>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  infoSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  merchantCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  merchantName: {
    ...typography.heading5,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing.sm,
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
  fieldSection: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  categoryItem: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    width: 80,
    marginRight: spacing.sm,
  },
  categoryItemSelected: {
    borderWidth: 2,
    backgroundColor: colors.neutral[50],
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    ...typography.tiny,
    color: colors.neutral[700],
    textAlign: 'center',
  },
});
