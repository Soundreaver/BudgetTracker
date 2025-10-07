// Enums
export type TransactionType = 'expense' | 'income';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

// Supabase Database Type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: Partial<CategoryInsert>;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      budgets: {
        Row: Budget;
        Insert: BudgetInsert;
        Update: Partial<BudgetInsert>;
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: SavingsGoalInsert;
        Update: SavingsGoalUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_type: TransactionType;
      recurring_frequency: RecurringFrequency;
      budget_period: BudgetPeriod;
    };
  };
}

// Category Interface
export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget_limit: number | null;
  created_at: string;
}

export interface CategoryInsert {
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget_limit?: number | null;
}

// Transaction Interface
export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  payment_method: string;
  is_recurring: boolean;
  recurring_frequency: RecurringFrequency | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionInsert {
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  payment_method: string;
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency | null;
}

export interface TransactionUpdate {
  category_id?: string;
  amount?: number;
  description?: string;
  date?: string;
  type?: TransactionType;
  payment_method?: string;
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency | null;
}

// Budget Interface
export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null; // null means "All Categories"
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold: number; // Percentage threshold for alerts (e.g., 80)
  created_at: string;
}

export interface BudgetInsert {
  user_id: string;
  category_id: string | null; // null means "All Categories"
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold?: number;
}

// Savings Goal Interface
export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface SavingsGoalInsert {
  user_id: string;
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface SavingsGoalUpdate {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
}
