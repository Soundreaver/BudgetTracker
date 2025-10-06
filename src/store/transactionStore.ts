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
import { getActiveBudgets, getBudgetSpending } from '@/services/budgetService';
import { getCategoryById } from '@/services/categoryService';
import { scheduleBudgetAlert } from '@/services/notificationService';

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
  checkBudgetThresholds: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
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

  addTransaction: async (transaction) => {
    try {
      // Check budget thresholds BEFORE adding transaction
      // This allows us to compare before/after spending
      if (transaction.type === 'expense') {
        await get().checkBudgetThresholds(transaction);
      }
      
      createTransaction(transaction);
      get().refreshTransactions();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  },

  checkBudgetThresholds: async (newTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const budgets = getActiveBudgets();
      
      for (const budget of budgets) {
        // Check if this transaction affects this budget
        const affectsBudget = budget.category_id === null || budget.category_id === newTransaction.category_id;
        
        if (!affectsBudget) continue;
        
        // Get current spending BEFORE this transaction
        const currentSpent = getBudgetSpending(budget);
        
        // Calculate what spending will be AFTER this transaction
        const totalSpent = currentSpent + newTransaction.amount;
        const percentage = (totalSpent / budget.amount) * 100;
        const previousPercentage = (currentSpent / budget.amount) * 100;
        const threshold = budget.alert_threshold || 80;
        
        console.log('Threshold Check Debug:', {
          budget_amount: budget.amount,
          current_spent: currentSpent,
          new_transaction_amount: newTransaction.amount,
          total_will_be: totalSpent,
          percentage: percentage.toFixed(1) + '%',
          threshold: threshold + '%',
        });
        
        // Get category name
        let categoryName = 'All Categories';
        if (budget.category_id !== null) {
          const category = getCategoryById(budget.category_id);
          categoryName = category?.name || 'Category';
        }
        
        // Check if threshold is crossed (was below, now at or above)
        if (percentage >= threshold && previousPercentage < threshold) {
          await scheduleBudgetAlert({
            budgetId: budget.id,
            categoryName,
            percentage,
            spent: totalSpent,
            total: budget.amount,
          });
        }
        
        // Also check 100% threshold
        if (percentage >= 100 && previousPercentage < 100) {
          await scheduleBudgetAlert({
            budgetId: budget.id,
            categoryName,
            percentage,
            spent: totalSpent,
            total: budget.amount,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check budget thresholds:', error);
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
