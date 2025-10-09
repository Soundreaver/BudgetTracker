import { create } from 'zustand';
import type { PendingTransaction, PendingTransactionUpdate, TransactionInsert } from '@/types/database';
import {
  getPendingTransactions,
  getPendingTransactionCount,
  updatePendingTransaction as updatePendingTransactionService,
  approvePendingTransaction as approvePendingTransactionService,
  rejectPendingTransaction as rejectPendingTransactionService,
} from '@/services/pendingTransactionService';
import { useTransactionStore } from './transactionStore';

interface PendingTransactionState {
  // State
  pendingTransactions: PendingTransaction[];
  pendingCount: number;
  isLoading: boolean;
  selectedPendingTransactionId: string | null;

  // Actions
  loadPendingTransactions: () => Promise<void>;
  loadPendingCount: () => Promise<void>;
  updatePendingCount: (count: number) => void;
  approvePendingTransaction: (id: string, finalData?: Partial<TransactionInsert>) => Promise<void>;
  rejectPendingTransaction: (id: string) => Promise<void>;
  updatePendingTransaction: (id: string, updates: PendingTransactionUpdate) => Promise<void>;
  selectPendingTransaction: (id: string | null) => void;
  refreshPendingTransactions: () => Promise<void>;
}

export const usePendingTransactionStore = create<PendingTransactionState>()((set, get) => ({
  // Initial state
  pendingTransactions: [],
  pendingCount: 0,
  isLoading: false,
  selectedPendingTransactionId: null,

  // Actions
  loadPendingTransactions: async () => {
    set({ isLoading: true });
    try {
      const transactions = await getPendingTransactions();
      set({ 
        pendingTransactions: transactions, 
        pendingCount: transactions.length,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load pending transactions:', error);
      set({ isLoading: false });
    }
  },

  loadPendingCount: async () => {
    try {
      const count = await getPendingTransactionCount();
      set({ pendingCount: count });
    } catch (error) {
      console.error('Failed to load pending transaction count:', error);
    }
  },

  updatePendingCount: (count: number) => {
    set({ pendingCount: count });
  },

  approvePendingTransaction: async (id: string, finalData?: Partial<TransactionInsert>) => {
    try {
      await approvePendingTransactionService(id, finalData);
      
      // Remove from pending transactions
      set((state) => ({
        pendingTransactions: state.pendingTransactions.filter((t) => t.id !== id),
        pendingCount: Math.max(0, state.pendingCount - 1),
      }));

      // Refresh the main transactions list
      await useTransactionStore.getState().refreshTransactions();

      // Clear selection if this was selected
      if (get().selectedPendingTransactionId === id) {
        set({ selectedPendingTransactionId: null });
      }
    } catch (error) {
      console.error('Failed to approve pending transaction:', error);
      throw error;
    }
  },

  rejectPendingTransaction: async (id: string) => {
    try {
      await rejectPendingTransactionService(id);
      
      // Remove from pending transactions
      set((state) => ({
        pendingTransactions: state.pendingTransactions.filter((t) => t.id !== id),
        pendingCount: Math.max(0, state.pendingCount - 1),
      }));

      // Clear selection if this was selected
      if (get().selectedPendingTransactionId === id) {
        set({ selectedPendingTransactionId: null });
      }
    } catch (error) {
      console.error('Failed to reject pending transaction:', error);
      throw error;
    }
  },

  updatePendingTransaction: async (id: string, updates: PendingTransactionUpdate) => {
    try {
      await updatePendingTransactionService(id, updates);
      
      // Update in local state
      set((state) => ({
        pendingTransactions: state.pendingTransactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update pending transaction:', error);
      throw error;
    }
  },

  selectPendingTransaction: (id: string | null) => {
    set({ selectedPendingTransactionId: id });
  },

  refreshPendingTransactions: async () => {
    await get().loadPendingTransactions();
  },
}));
