import { openDatabase } from './database';
import type { SavingsGoal, SavingsGoalInsert, SavingsGoalUpdate } from '@/types/database';

// Get all savings goals
export const getAllSavingsGoals = (): SavingsGoal[] => {
  const db = openDatabase();
  const result = db.getAllSync<SavingsGoal>(
    'SELECT * FROM savings_goals ORDER BY created_at DESC'
  );
  return result;
};

// Get savings goal by ID
export const getSavingsGoalById = (id: number): SavingsGoal | null => {
  const db = openDatabase();
  const result = db.getFirstSync<SavingsGoal>('SELECT * FROM savings_goals WHERE id = ?', [id]);
  return result;
};

// Get active savings goals (deadline not passed)
export const getActiveSavingsGoals = (): SavingsGoal[] => {
  const db = openDatabase();
  const currentDate = new Date().toISOString();
  const result = db.getAllSync<SavingsGoal>(
    'SELECT * FROM savings_goals WHERE deadline >= ? ORDER BY deadline ASC',
    [currentDate]
  );
  return result;
};

// Get completed savings goals (current_amount >= target_amount)
export const getCompletedSavingsGoals = (): SavingsGoal[] => {
  const db = openDatabase();
  const result = db.getAllSync<SavingsGoal>(
    'SELECT * FROM savings_goals WHERE current_amount >= target_amount ORDER BY created_at DESC'
  );
  return result;
};

// Create new savings goal
export const createSavingsGoal = (goal: SavingsGoalInsert): number => {
  const db = openDatabase();
  const result = db.runSync(
    `INSERT INTO savings_goals (name, target_amount, current_amount, deadline, icon, color) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      goal.name,
      goal.target_amount,
      goal.current_amount ?? 0,
      goal.deadline,
      goal.icon,
      goal.color,
    ]
  );
  return result.lastInsertRowId;
};

// Update savings goal
export const updateSavingsGoal = (id: number, updates: SavingsGoalUpdate): void => {
  const db = openDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.target_amount !== undefined) {
    fields.push('target_amount = ?');
    values.push(updates.target_amount);
  }
  if (updates.current_amount !== undefined) {
    fields.push('current_amount = ?');
    values.push(updates.current_amount);
  }
  if (updates.deadline !== undefined) {
    fields.push('deadline = ?');
    values.push(updates.deadline);
  }
  if (updates.icon !== undefined) {
    fields.push('icon = ?');
    values.push(updates.icon);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }

  if (fields.length === 0) return;

  values.push(id);
  db.runSync(`UPDATE savings_goals SET ${fields.join(', ')} WHERE id = ?`, values);
};

// Add amount to savings goal
export const addToSavingsGoal = (id: number, amount: number): void => {
  const db = openDatabase();
  db.runSync('UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?', [
    amount,
    id,
  ]);
};

// Subtract amount from savings goal
export const subtractFromSavingsGoal = (id: number, amount: number): void => {
  const db = openDatabase();
  db.runSync(
    'UPDATE savings_goals SET current_amount = MAX(0, current_amount - ?) WHERE id = ?',
    [amount, id]
  );
};

// Delete savings goal
export const deleteSavingsGoal = (id: number): void => {
  const db = openDatabase();
  db.runSync('DELETE FROM savings_goals WHERE id = ?', [id]);
};

// Get savings goal progress (percentage)
export const getSavingsGoalProgress = (id: number): number => {
  const goal = getSavingsGoalById(id);
  if (!goal) return 0;

  return (goal.current_amount / goal.target_amount) * 100;
};

// Get remaining amount for savings goal
export const getRemainingAmount = (id: number): number => {
  const goal = getSavingsGoalById(id);
  if (!goal) return 0;

  return Math.max(0, goal.target_amount - goal.current_amount);
};

// Check if savings goal is completed
export const isSavingsGoalCompleted = (id: number): boolean => {
  const goal = getSavingsGoalById(id);
  if (!goal) return false;

  return goal.current_amount >= goal.target_amount;
};

// Get total savings across all goals
export const getTotalSavings = (): number => {
  const db = openDatabase();
  const result = db.getFirstSync<{ total: number | null }>(
    'SELECT SUM(current_amount) as total FROM savings_goals'
  );
  return result?.total ?? 0;
};
