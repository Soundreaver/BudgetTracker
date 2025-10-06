// Enums
export type TransactionType = 'expense' | 'income';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

// Category Interface
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget_limit: number | null;
  created_at: string;
}

export interface CategoryInsert {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget_limit?: number | null;
}

// Transaction Interface
export interface Transaction {
  id: number;
  category_id: number;
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
  category_id: number;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  payment_method: string;
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency | null;
}

export interface TransactionUpdate {
  category_id?: number;
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
  id: number;
  category_id: number | null; // null means "All Categories"
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold?: number; // Percentage threshold for alerts (e.g., 80)
  created_at: string;
}

export interface BudgetInsert {
  category_id: number | null; // null means "All Categories"
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold?: number;
}

// Savings Goal Interface
export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface SavingsGoalInsert {
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
