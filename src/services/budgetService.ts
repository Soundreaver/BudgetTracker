import { supabase } from './supabase';
import type { Budget, BudgetInsert } from '@/types/database';

// Get all budgets for the current user
export const getAllBudgets = async (): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }

  return data || [];
};

// Get budget by ID
export const getBudgetById = async (id: string): Promise<Budget | null> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching budget:', error);
    return null;
  }

  return data;
};

// Get budgets by category
export const getBudgetsByCategory = async (categoryId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets by category:', error);
    throw error;
  }

  return data || [];
};

// Get active budgets (current date falls within start_date and end_date)
export const getActiveBudgets = async (): Promise<Budget[]> => {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .lte('start_date', currentDate)
    .gte('end_date', currentDate)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active budgets:', error);
    throw error;
  }

  return data || [];
};

// Get budgets by period
export const getBudgetsByPeriod = async (period: 'weekly' | 'monthly' | 'yearly'): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('period', period)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets by period:', error);
    throw error;
  }

  return data || [];
};

// Create new budget
export const createBudget = async (budget: Omit<BudgetInsert, 'user_id'>): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      ...budget,
      user_id: user.id,
      alert_threshold: budget.alert_threshold ?? 80,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating budget:', error);
    throw error;
  }

  return data.id;
};

// Update budget
export const updateBudget = async (id: string, updates: Partial<Omit<BudgetInsert, 'user_id'>>): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

// Delete budget
export const deleteBudget = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Get budget spending for a specific budget
export const getBudgetSpending = async (budget: Budget): Promise<number> => {
  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'expense')
    .gte('date', budget.start_date)
    .lte('date', budget.end_date)
    .gte('created_at', budget.created_at);

  if (budget.category_id !== null) {
    query = query.eq('category_id', budget.category_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting budget spending:', error);
    return 0;
  }

  const total = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  // Debug logging
  console.log('Budget Spending Debug:', {
    budget_id: budget.id,
    category_id: budget.category_id,
    start_date: budget.start_date,
    end_date: budget.end_date,
    budget_created_at: budget.created_at,
    total_spent: total,
  });

  return total;
};

// Get budget progress (percentage)
export const getBudgetProgress = async (budgetId: string): Promise<number> => {
  const budget = await getBudgetById(budgetId);
  if (!budget) return 0;

  const spending = await getBudgetSpending(budget);
  return (spending / budget.amount) * 100;
};
