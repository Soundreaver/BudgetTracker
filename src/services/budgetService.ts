import { openDatabase } from './database';
import type { Budget, BudgetInsert } from '@/types/database';

// Get all budgets
export const getAllBudgets = (): Budget[] => {
  const db = openDatabase();
  const result = db.getAllSync<Budget>('SELECT * FROM budgets ORDER BY created_at DESC');
  return result;
};

// Get budget by ID
export const getBudgetById = (id: number): Budget | null => {
  const db = openDatabase();
  const result = db.getFirstSync<Budget>('SELECT * FROM budgets WHERE id = ?', [id]);
  return result;
};

// Get budgets by category
export const getBudgetsByCategory = (categoryId: number): Budget[] => {
  const db = openDatabase();
  const result = db.getAllSync<Budget>(
    'SELECT * FROM budgets WHERE category_id = ? ORDER BY created_at DESC',
    [categoryId]
  );
  return result;
};

// Get active budgets (current date falls within start_date and end_date)
export const getActiveBudgets = (): Budget[] => {
  const db = openDatabase();
  const currentDate = new Date().toISOString();
  const result = db.getAllSync<Budget>(
    'SELECT * FROM budgets WHERE ? BETWEEN start_date AND end_date ORDER BY created_at DESC',
    [currentDate]
  );
  return result;
};

// Get budgets by period
export const getBudgetsByPeriod = (period: 'weekly' | 'monthly' | 'yearly'): Budget[] => {
  const db = openDatabase();
  const result = db.getAllSync<Budget>(
    'SELECT * FROM budgets WHERE period = ? ORDER BY created_at DESC',
    [period]
  );
  return result;
};

// Create new budget
export const createBudget = (budget: BudgetInsert): number => {
  const db = openDatabase();
  const result = db.runSync(
    `INSERT INTO budgets (category_id, amount, period, start_date, end_date, alert_threshold) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      budget.category_id,
      budget.amount,
      budget.period,
      budget.start_date,
      budget.end_date,
      budget.alert_threshold ?? 80
    ]
  );
  return result.lastInsertRowId;
};

// Update budget
export const updateBudget = (id: number, updates: Partial<BudgetInsert>): void => {
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
  if (updates.period !== undefined) {
    fields.push('period = ?');
    values.push(updates.period);
  }
  if (updates.start_date !== undefined) {
    fields.push('start_date = ?');
    values.push(updates.start_date);
  }
  if (updates.end_date !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.end_date);
  }
  if (updates.alert_threshold !== undefined) {
    fields.push('alert_threshold = ?');
    values.push(updates.alert_threshold);
  }

  if (fields.length === 0) return;

  values.push(id);
  db.runSync(`UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`, values);
};

// Delete budget
export const deleteBudget = (id: number): void => {
  const db = openDatabase();
  db.runSync('DELETE FROM budgets WHERE id = ?', [id]);
};

// Get budget spending for a specific budget
export const getBudgetSpending = (budget: Budget): number => {
  const db = openDatabase();
  
  // Only count transactions created AFTER the budget was created
  // This ensures budgets start fresh and don't count old transactions
  let query = `SELECT SUM(amount) as total FROM transactions 
               WHERE type = 'expense' 
               AND date(date) >= date(?) 
               AND date(date) <= date(?)
               AND datetime(created_at) >= datetime(?)`;
  const params: any[] = [budget.start_date, budget.end_date, budget.created_at];

  if (budget.category_id !== null) {
    query += ` AND category_id = ?`;
    params.push(budget.category_id);
  }

  const result = db.getFirstSync<{ total: number | null }>(query, params);
  
  // Debug logging
  console.log('Budget Spending Debug:', {
    budget_id: budget.id,
    category_id: budget.category_id,
    start_date: budget.start_date,
    end_date: budget.end_date,
    budget_created_at: budget.created_at,
    total_spent: result?.total ?? 0,
  });

  return result?.total ?? 0;
};

// Get budget progress (percentage)
export const getBudgetProgress = (budgetId: number): number => {
  const budget = getBudgetById(budgetId);
  if (!budget) return 0;

  const spending = getBudgetSpending(budget);
  return (spending / budget.amount) * 100;
};
