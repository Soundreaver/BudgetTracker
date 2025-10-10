import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { PendingTransactionCard } from './PendingTransactionCard';
import { PendingTransactionReviewModal } from './PendingTransactionReviewModal';
import { EmptyState } from './EmptyState';
import { colors, spacing } from '@/constants/theme';
import { usePendingTransactionStore } from '@/store/pendingTransactionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getAllCategories } from '@/services/categoryService';
import type { PendingTransaction, Category } from '@/types/database';

interface PendingTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PendingTransactionsModal: React.FC<PendingTransactionsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    pendingTransactions,
    isLoading,
    loadPendingTransactions,
    approvePendingTransaction,
    rejectPendingTransaction,
  } = usePendingTransactionStore();
  const { currency: currencyCode } = useSettingsStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Load pending transactions when modal opens
  useEffect(() => {
    if (visible) {
      loadPendingTransactions();
    }
  }, [visible, loadPendingTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingTransactions();
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    try {
      await approvePendingTransaction(id);
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const handleEdit = (id: string) => {
    const transaction = pendingTransactions.find((t) => t.id === id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsReviewModalVisible(true);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPendingTransaction(id);
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  const handleReviewApprove = async (id: string, finalData: any) => {
    await approvePendingTransaction(id, finalData);
    setIsReviewModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleReviewReject = async (id: string) => {
    await rejectPendingTransaction(id);
    setIsReviewModalVisible(false);
    setSelectedTransaction(null);
  };

  const getCategoryForTransaction = (transaction: PendingTransaction) => {
    if (!transaction.suggested_category_id) return undefined;
    const category = categories.find((cat) => cat.id === transaction.suggested_category_id);
    return category
      ? {
          name: category.name,
          icon: category.icon,
          color: category.color,
        }
      : undefined;
  };

  const renderTransaction = ({ item }: { item: PendingTransaction }) => (
    <PendingTransactionCard
      transaction={item}
      category={getCategoryForTransaction(item)}
      currencyCode={currencyCode}
      onApprove={handleApprove}
      onEdit={handleEdit}
      onReject={handleReject}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="✅"
      title="No Pending Transactions"
      message="All caught up! You don't have any transactions to review."
    />
  );

  return (
    <>
      <BottomSheet
        visible={visible && !isReviewModalVisible}
        onClose={onClose}
        title={`Pending Transactions (${pendingTransactions.length})`}
        snapPoint={75}
      >
        {pendingTransactions.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            {pendingTransactions.map((transaction) => (
              <PendingTransactionCard
                key={transaction.id}
                transaction={transaction}
                category={getCategoryForTransaction(transaction)}
                currencyCode={currencyCode}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onReject={handleReject}
              />
            ))}
          </>
        )}
      </BottomSheet>

      <PendingTransactionReviewModal
        visible={isReviewModalVisible}
        onClose={() => {
          setIsReviewModalVisible(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onApprove={handleReviewApprove}
        onReject={handleReviewReject}
      />
    </>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
});
