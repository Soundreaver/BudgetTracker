import { create } from 'zustand';
import type { Budget } from '@/types/database';
import {
  getAllBudgets,
  getActiveBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSpending,
  getBudgetProgress,
} from '@/services';

interface BudgetAlert {
  budgetId: number;
  budgetName: string;
  percentage: number;
  type: 'warning' | 'exceeded';
  message: string;
}

interface BudgetState {
  // State
  budgets: Budget[];
  activeBudgets: Budget[];
  isLoading: boolean;
  alerts: BudgetAlert[];
  selectedBudgetId: number | null;

  // Actions
  loadBudgets: () => void;
  loadActiveBudgets: () => void;
  addBudget: (budget: Omit<Budget, 'id' | 'created_at'>) => void;
  editBudget: (id: number, updates: Partial<Budget>) => void;
  removeBudget: (id: number) => void;
  selectBudget: (id: number | null) => void;
  calculateBudgetSpending: (budgetId: number) => number;
  calculateBudgetProgress: (budgetId: number) => number;
  checkBudgetAlerts: () => void;
  clearAlerts: () => void;
  refreshBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  // Initial state
  budgets: [],
  activeBudgets: [],
  isLoading: false,
  alerts: [],
  selectedBudgetId: null,

  // Actions
  loadBudgets: () => {
    set({ isLoading: true });
    try {
      const budgets = getAllBudgets();
      set({ budgets, isLoading: false });
      get().checkBudgetAlerts();
    } catch (error) {
      console.error('Failed to load budgets:', error);
      set({ isLoading: false });
    }
  },

  loadActiveBudgets: () => {
    set({ isLoading: true });
    try {
      const activeBudgets = getActiveBudgets();
      set({ activeBudgets, isLoading: false });
      get().checkBudgetAlerts();
    } catch (error) {
      console.error('Failed to load active budgets:', error);
      set({ isLoading: false });
    }
  },

  addBudget: (budget) => {
    try {
      createBudget(budget);
      get().refreshBudgets();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  },

  editBudget: (id, updates) => {
    try {
      updateBudget(id, updates);
      get().refreshBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  },

  removeBudget: (id) => {
    try {
      deleteBudget(id);
      get().refreshBudgets();
      if (get().selectedBudgetId === id) {
        set({ selectedBudgetId: null });
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  },

  selectBudget: (id) => {
    set({ selectedBudgetId: id });
  },

  calculateBudgetSpending: (budgetId) => {
    try {
      return getBudgetSpending(budgetId);
    } catch (error) {
      console.error('Failed to calculate budget spending:', error);
      return 0;
    }
  },

  calculateBudgetProgress: (budgetId) => {
    try {
      return getBudgetProgress(budgetId);
    } catch (error) {
      console.error('Failed to calculate budget progress:', error);
      return 0;
    }
  },

  checkBudgetAlerts: () => {
    const alerts: BudgetAlert[] = [];
    const { activeBudgets } = get();

    activeBudgets.forEach((budget) => {
      const progress = getBudgetProgress(budget.id);

      if (progress >= 100) {
        alerts.push({
          budgetId: budget.id,
          budgetName: `Budget ${budget.id}`,
          percentage: progress,
          type: 'exceeded',
          message: `You've exceeded your budget by ${(progress - 100).toFixed(1)}%`,
        });
      } else if (progress >= 80) {
        alerts.push({
          budgetId: budget.id,
          budgetName: `Budget ${budget.id}`,
          percentage: progress,
          type: 'warning',
          message: `You've used ${progress.toFixed(1)}% of your budget`,
        });
      }
    });

    set({ alerts });
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },

  refreshBudgets: () => {
    get().loadBudgets();
    get().loadActiveBudgets();
  },
}));
