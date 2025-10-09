import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePendingTransactionStore } from '@/store/pendingTransactionStore';
import { subscribeToPendingTransactions } from '@/services/pendingTransactionService';
import { schedulePendingTransactionAlert } from '@/services/notificationService';
import type { PendingTransaction } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook that subscribes to Supabase realtime for new pending transactions
 * - Triggers local notification when new transaction detected
 * - Updates the pending count in the store
 * - Auto-loads pending transactions on mount
 */
export function usePendingTransactions() {
  const user = useAuthStore((state) => state.user);
  const { loadPendingTransactions, loadPendingCount, updatePendingCount, pendingCount } =
    usePendingTransactionStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // Load pending transactions on mount
    loadPendingTransactions();

    // Subscribe to realtime changes
    const handleNewPendingTransaction = async (transaction: PendingTransaction) => {
      console.log('New pending transaction received:', transaction);

      // Schedule a notification
      try {
        await schedulePendingTransactionAlert(transaction);
      } catch (error) {
        console.error('Failed to schedule pending transaction notification:', error);
      }

      // Update pending count
      const newCount = pendingCount + 1;
      updatePendingCount(newCount);

      // Reload pending transactions to get the latest data
      await loadPendingTransactions();
    };

    channelRef.current = subscribeToPendingTransactions(user.id, handleNewPendingTransaction);

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, loadPendingTransactions, loadPendingCount, updatePendingCount, pendingCount]);

  return {
    pendingCount,
    loadPendingTransactions,
    loadPendingCount,
  };
}
