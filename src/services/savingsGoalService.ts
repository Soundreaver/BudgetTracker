import { supabase } from './supabase';
import type { SavingsGoal, SavingsGoalInsert, SavingsGoalUpdate } from '@/types/database';

// Get all savings goals for the current user
export const getAllSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings goals:', error);
    throw error;
  }

  return data || [];
};

// Get savings goal by ID
export const getSavingsGoalById = async (id: string): Promise<SavingsGoal | null> => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching savings goal:', error);
    return null;
  }

  return data;
};

// Get active savings goals (deadline not passed)
export const getActiveSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .gte('deadline', currentDate)
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching active savings goals:', error);
    throw error;
  }

  return data || [];
};

// Get completed savings goals (current_amount >= target_amount)
export const getCompletedSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching completed savings goals:', error);
    throw error;
  }

  // Filter completed goals on client side (Supabase doesn't support column comparisons in filters easily)
  return data?.filter(goal => goal.current_amount >= goal.target_amount) || [];
};

// Create new savings goal
export const createSavingsGoal = async (goal: Omit<SavingsGoalInsert, 'user_id'>): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      ...goal,
      user_id: user.id,
      current_amount: goal.current_amount ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating savings goal:', error);
    throw error;
  }

  return data.id;
};

// Update savings goal
export const updateSavingsGoal = async (id: string, updates: SavingsGoalUpdate): Promise<void> => {
  const { error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating savings goal:', error);
    throw error;
  }
};

// Add amount to savings goal
export const addToSavingsGoal = async (id: string, amount: number): Promise<void> => {
  const goal = await getSavingsGoalById(id);
  if (!goal) {
    throw new Error('Savings goal not found');
  }

  const { error } = await supabase
    .from('savings_goals')
    .update({ current_amount: goal.current_amount + amount })
    .eq('id', id);

  if (error) {
    console.error('Error adding to savings goal:', error);
    throw error;
  }
};

// Subtract amount from savings goal
export const subtractFromSavingsGoal = async (id: string, amount: number): Promise<void> => {
  const goal = await getSavingsGoalById(id);
  if (!goal) {
    throw new Error('Savings goal not found');
  }

  const { error } = await supabase
    .from('savings_goals')
    .update({ current_amount: Math.max(0, goal.current_amount - amount) })
    .eq('id', id);

  if (error) {
    console.error('Error subtracting from savings goal:', error);
    throw error;
  }
};

// Delete savings goal
export const deleteSavingsGoal = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }
};

// Get savings goal progress (percentage)
export const getSavingsGoalProgress = async (id: string): Promise<number> => {
  const goal = await getSavingsGoalById(id);
  if (!goal) return 0;

  return (goal.current_amount / goal.target_amount) * 100;
};

// Get remaining amount for savings goal
export const getRemainingAmount = async (id: string): Promise<number> => {
  const goal = await getSavingsGoalById(id);
  if (!goal) return 0;

  return Math.max(0, goal.target_amount - goal.current_amount);
};

// Check if savings goal is completed
export const isSavingsGoalCompleted = async (id: string): Promise<boolean> => {
  const goal = await getSavingsGoalById(id);
  if (!goal) return false;

  return goal.current_amount >= goal.target_amount;
};

// Get total savings across all goals
export const getTotalSavings = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('current_amount');

  if (error) {
    console.error('Error getting total savings:', error);
    return 0;
  }

  return data?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0;
};
