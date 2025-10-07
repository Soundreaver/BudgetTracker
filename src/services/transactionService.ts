import { supabase } from './supabase';
import type { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database';

// Get all transactions for the current user
export const getAllTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data || [];
};

// Get transactions by date range
export const getTransactionsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }

  return data || [];
};

// Get transactions by category
export const getTransactionsByCategory = async (categoryId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('category_id', categoryId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by category:', error);
    throw error;
  }

  return data || [];
};

// Get transactions by type
export const getTransactionsByType = async (type: 'expense' | 'income'): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', type)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by type:', error);
    throw error;
  }

  return data || [];
};

// Get transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return data;
};

// Create new transaction
export const createTransaction = async (transaction: Omit<TransactionInsert, 'user_id'>): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      user_id: user.id,
      is_recurring: transaction.is_recurring ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return data.id;
};

// Update transaction
export const updateTransaction = async (id: string, updates: TransactionUpdate): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Get total expenses
export const getTotalExpenses = async (startDate?: string, endDate?: string): Promise<number> => {
  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'expense');

  if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting total expenses:', error);
    return 0;
  }

  return data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
};

// Get total income
export const getTotalIncome = async (startDate?: string, endDate?: string): Promise<number> => {
  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'income');

  if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting total income:', error);
    return 0;
  }

  return data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
};

// Get recurring transactions
export const getRecurringTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('is_recurring', true)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching recurring transactions:', error);
    throw error;
  }

  return data || [];
};
