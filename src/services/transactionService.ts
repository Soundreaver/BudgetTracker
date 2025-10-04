import { openDatabase } from './database';
import type { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database';

// Get all transactions
export const getAllTransactions = (): Transaction[] => {
  const db = openDatabase();
  const result = db.getAllSync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
  );
  return result;
};

// Get transactions by date range
export const getTransactionsByDateRange = (
  startDate: string,
  endDate: string
): Transaction[] => {
  const db = openDatabase();
  const result = db.getAllSync<Transaction>(
    'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
    [startDate, endDate]
  );
  return result;
};

// Get transactions by category
export const getTransactionsByCategory = (categoryId: number): Transaction[] => {
  const db = openDatabase();
  const result = db.getAllSync<Transaction>(
    'SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC',
    [categoryId]
  );
  return result;
};

// Get transactions by type
export const getTransactionsByType = (type: 'expense' | 'income'): Transaction[] => {
  const db = openDatabase();
  const result = db.getAllSync<Transaction>(
    'SELECT * FROM transactions WHERE type = ? ORDER BY date DESC',
    [type]
  );
  return result;
};

// Get transaction by ID
export const getTransactionById = (id: number): Transaction | null => {
  const db = openDatabase();
  const result = db.getFirstSync<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
  return result;
};

// Create new transaction
export const createTransaction = (transaction: TransactionInsert): number => {
  const db = openDatabase();
  const result = db.runSync(
    `INSERT INTO transactions (category_id, amount, description, date, type, payment_method, is_recurring, recurring_frequency) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.category_id,
      transaction.amount,
      transaction.description,
      transaction.date,
      transaction.type,
      transaction.payment_method,
      transaction.is_recurring ? 1 : 0,
      transaction.recurring_frequency ?? null,
    ]
  );
  return result.lastInsertRowId;
};

// Update transaction
export const updateTransaction = (id: number, updates: TransactionUpdate): void => {
  const db = openDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(updates.category_id);
  }
  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.payment_method !== undefined) {
    fields.push('payment_method = ?');
    values.push(updates.payment_method);
  }
  if (updates.is_recurring !== undefined) {
    fields.push('is_recurring = ?');
    values.push(updates.is_recurring ? 1 : 0);
  }
  if (updates.recurring_frequency !== undefined) {
    fields.push('recurring_frequency = ?');
    values.push(updates.recurring_frequency);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = datetime("now")');
  values.push(id);

  db.runSync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);
};

// Delete transaction
export const deleteTransaction = (id: number): void => {
  const db = openDatabase();
  db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
};

// Get total expenses
export const getTotalExpenses = (startDate?: string, endDate?: string): number => {
  const db = openDatabase();
  let query = 'SELECT SUM(amount) as total FROM transactions WHERE type = "expense"';
  const params: string[] = [];

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  const result = db.getFirstSync<{ total: number | null }>(query, params);
  return result?.total ?? 0;
};

// Get total income
export const getTotalIncome = (startDate?: string, endDate?: string): number => {
  const db = openDatabase();
  let query = 'SELECT SUM(amount) as total FROM transactions WHERE type = "income"';
  const params: string[] = [];

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  const result = db.getFirstSync<{ total: number | null }>(query, params);
  return result?.total ?? 0;
};

// Get recurring transactions
export const getRecurringTransactions = (): Transaction[] => {
  const db = openDatabase();
  const result = db.getAllSync<Transaction>(
    'SELECT * FROM transactions WHERE is_recurring = 1 ORDER BY date DESC'
  );
  return result;
};
