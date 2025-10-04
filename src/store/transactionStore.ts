import { create } from 'zustand';
import type { Transaction, TransactionType } from '@/types/database';
import {
  getAllTransactions,
  getTransactionsByDateRange,
  getTransactionsByType,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTotalExpenses,
  getTotalIncome,
} from '@/services';

type SortBy = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

interface TransactionFilters {
  type: TransactionType | 'all';
  categoryId: number | null;
  startDate: string | null;
  endDate: string | null;
  minAmount: number | null;
  maxAmount: number | null;
}

interface TransactionState {
  // State
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  filters: TransactionFilters;
  selectedTransactionId: number | null;

  // Actions
  loadTransactions: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
  editTransaction: (id: number, updates: Partial<Transaction>) => void;
  removeTransaction: (id: number) => void;
  selectTransaction: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  applyFiltersAndSearch: () => void;
  loadTransactionsByDateRange: (startDate: string, endDate: string) => void;
  getTotals: () => { expenses: number; income: number; balance: number };
  refreshTransactions: () => void;
}

const initialFilters: TransactionFilters = {
  type: 'all',
  categoryId: null,
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
};

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  // Initial state
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
  filters: initialFilters,
  selectedTransactionId: null,

  // Actions
  loadTransactions: () => {
    set({ isLoading: true });
    try {
      const transactions = getAllTransactions();
      set({ transactions, isLoading: false });
      get().applyFiltersAndSearch();
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({ isLoading: false });
    }
  },

  addTransaction: (transaction) => {
    try {
      createTransaction(transaction);
      get().refreshTransactions();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  },

  editTransaction: (id, updates) => {
    try {
      updateTransaction(id, updates);
      get().refreshTransactions();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  },

  removeTransaction: (id) => {
    try {
      deleteTransaction(id);
      get().refreshTransactions();
      if (get().selectedTransactionId === id) {
        set({ selectedTransactionId: null });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  },

  selectTransaction: (id) => {
    set({ selectedTransactionId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFiltersAndSearch();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().applyFiltersAndSearch();
  },

  setSortOrder: (order) => {
    set({ sortOrder: order });
    get().applyFiltersAndSearch();
  },

  toggleSortOrder: () => {
    set((state) => ({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' }));
    get().applyFiltersAndSearch();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFiltersAndSearch();
  },

  resetFilters: () => {
    set({ filters: initialFilters, searchQuery: '' });
    get().applyFiltersAndSearch();
  },

  applyFiltersAndSearch: () => {
    const { transactions, filters, searchQuery, sortBy, sortOrder } = get();
    let filtered = [...transactions];

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Apply category filter
    if (filters.categoryId !== null) {
      filtered = filtered.filter((t) => t.category_id === filters.categoryId);
    }

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(
        (t) => t.date >= filters.startDate! && t.date <= filters.endDate!
      );
    }

    // Apply amount range filter
    if (filters.minAmount !== null) {
      filtered = filtered.filter((t) => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== null) {
      filtered = filtered.filter((t) => t.amount <= filters.maxAmount!);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.payment_method.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category_id - b.category_id;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    set({ filteredTransactions: filtered });
  },

  loadTransactionsByDateRange: (startDate, endDate) => {
    set({ isLoading: true });
    try {
      const transactions = getTransactionsByDateRange(startDate, endDate);
      set({ transactions, isLoading: false });
      get().applyFiltersAndSearch();
    } catch (error) {
      console.error('Failed to load transactions by date range:', error);
      set({ isLoading: false });
    }
  },

  getTotals: () => {
    const { filters } = get();
    const expenses = getTotalExpenses(filters.startDate ?? undefined, filters.endDate ?? undefined);
    const income = getTotalIncome(filters.startDate ?? undefined, filters.endDate ?? undefined);
    const balance = income - expenses;

    return { expenses, income, balance };
  },

  refreshTransactions: () => {
    get().loadTransactions();
  },
}));
