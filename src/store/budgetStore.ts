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
  budgetId: string;
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
  selectedBudgetId: string | null;

  // Actions
  loadBudgets: () => Promise<void>;
  loadActiveBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  selectBudget: (id: string | null) => void;
  calculateBudgetSpending: (budget: Budget) => Promise<number>;
  calculateBudgetProgress: (budgetId: string) => Promise<number>;
  checkBudgetAlerts: () => Promise<void>;
  clearAlerts: () => void;
  refreshBudgets: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  // Initial state
  budgets: [],
  activeBudgets: [],
  isLoading: false,
  alerts: [],
  selectedBudgetId: null,

  // Actions
  loadBudgets: async () => {
    set({ isLoading: true });
    try {
      const budgets = await getAllBudgets();
      set({ budgets, isLoading: false });
      await get().checkBudgetAlerts();
    } catch (error) {
      console.error('Failed to load budgets:', error);
      set({ isLoading: false });
    }
  },

  loadActiveBudgets: async () => {
    set({ isLoading: true });
    try {
      const activeBudgets = await getActiveBudgets();
      set({ activeBudgets, isLoading: false });
      await get().checkBudgetAlerts();
    } catch (error) {
      console.error('Failed to load active budgets:', error);
      set({ isLoading: false });
    }
  },

  addBudget: async (budget) => {
    try {
      await createBudget(budget);
      await get().refreshBudgets();
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  },

  editBudget: async (id, updates) => {
    try {
      await updateBudget(id, updates);
      await get().refreshBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  },

  removeBudget: async (id) => {
    try {
      await deleteBudget(id);
      await get().refreshBudgets();
      if (get().selectedBudgetId === id) {
        set({ selectedBudgetId: null });
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  },

  selectBudget: (id) => {
    set({ selectedBudgetId: id });
  },

  calculateBudgetSpending: async (budget) => {
    try {
      return await getBudgetSpending(budget);
    } catch (error) {
      console.error('Failed to calculate budget spending:', error);
      return 0;
    }
  },

  calculateBudgetProgress: async (budgetId) => {
    try {
      return await getBudgetProgress(budgetId);
    } catch (error) {
      console.error('Failed to calculate budget progress:', error);
      return 0;
    }
  },

  checkBudgetAlerts: async () => {
    const alerts: BudgetAlert[] = [];
    const { activeBudgets } = get();

    for (const budget of activeBudgets) {
      try {
        const progress = await getBudgetProgress(budget.id);

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
      } catch (error) {
        console.error('Failed to check budget alert:', error);
      }
    }

    set({ alerts });
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },

  refreshBudgets: async () => {
    await get().loadBudgets();
    await get().loadActiveBudgets();
  },
}));
