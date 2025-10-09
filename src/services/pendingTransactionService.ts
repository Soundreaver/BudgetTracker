import { supabase } from './supabase';
import { createTransaction } from './transactionService';
import type {
  PendingTransaction,
  PendingTransactionUpdate,
  TransactionInsert,
} from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Get all pending transactions for the current user
export const getPendingTransactions = async (): Promise<PendingTransaction[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('pending_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending transactions:', error);
    throw error;
  }

  return data || [];
};

// Get count of pending transactions
export const getPendingTransactionCount = async (): Promise<number> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { count, error } = await supabase
    .from('pending_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending transaction count:', error);
    throw error;
  }

  return count || 0;
};

// Update a pending transaction (for editing before approval)
export const updatePendingTransaction = async (
  id: string,
  updates: PendingTransactionUpdate
): Promise<void> => {
  const { error } = await supabase
    .from('pending_transactions')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating pending transaction:', error);
    throw error;
  }
};

// Approve a pending transaction (move to transactions table)
export const approvePendingTransaction = async (
  id: string,
  finalData?: Partial<TransactionInsert>
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the pending transaction
  const { data: pendingTransaction, error: fetchError } = await supabase
    .from('pending_transactions')
    .select('*')
    .eq('id', id)
    .single<PendingTransaction>();

  if (fetchError || !pendingTransaction) {
    console.error('Error fetching pending transaction:', fetchError);
    throw fetchError || new Error('Pending transaction not found');
  }

  // Create a new transaction in the transactions table
  const transactionData: Omit<TransactionInsert, 'user_id'> = {
    category_id: finalData?.category_id || pendingTransaction.suggested_category_id || '',
    amount: finalData?.amount ?? pendingTransaction.suggested_amount,
    description: finalData?.description || pendingTransaction.suggested_description,
    date: finalData?.date || pendingTransaction.suggested_date,
    type: finalData?.type || pendingTransaction.suggested_type,
    payment_method: finalData?.payment_method || pendingTransaction.suggested_payment_method || 'card',
    is_recurring: finalData?.is_recurring ?? false,
    recurring_frequency: finalData?.recurring_frequency ?? null,
  };

  // Create the transaction
  await createTransaction(transactionData);

  // Update the pending transaction status to 'approved'
  const updateData: PendingTransactionUpdate = {
    status: 'approved',
    reviewed_at: new Date().toISOString(),
  };
  
  const { error: updateError } = await supabase
    .from('pending_transactions')
    .update(updateData as any)
    .eq('id', id);

  if (updateError) {
    console.error('Error updating pending transaction status:', updateError);
    throw updateError;
  }
};

// Reject a pending transaction
export const rejectPendingTransaction = async (id: string): Promise<void> => {
  const updateData: PendingTransactionUpdate = {
    status: 'rejected',
    reviewed_at: new Date().toISOString(),
  };
  
  const { error } = await supabase
    .from('pending_transactions')
    .update(updateData as any)
    .eq('id', id);

  if (error) {
    console.error('Error rejecting pending transaction:', error);
    throw error;
  }
};

// Subscribe to new pending transactions (realtime)
export const subscribeToPendingTransactions = (
  userId: string,
  callback: (payload: PendingTransaction) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('pending_transactions_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pending_transactions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New pending transaction detected:', payload);
        callback(payload.new as PendingTransaction);
      }
    )
    .subscribe();

  return channel;
};

// Get user email configuration
export const getUserEmailConfig = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_email_config')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error('Error fetching user email config:', error);
    throw error;
  }

  return data;
};

// Save or update user email configuration
export const saveUserEmailConfig = async (
  emailAddress: string,
  isActive: boolean = true
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if config exists
  const existing = await getUserEmailConfig();

  if (existing) {
    // Update existing config
    const updateData = {
      email_address: emailAddress,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('user_email_config')
      .update(updateData as any)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating user email config:', error);
      throw error;
    }
  } else {
    // Insert new config
    const insertData = {
      user_id: user.id,
      email_address: emailAddress,
      is_active: isActive,
    };
    
    const { error } = await supabase
      .from('user_email_config')
      .insert(insertData as any);

    if (error) {
      console.error('Error creating user email config:', error);
      throw error;
    }
  }
};
