import { openDatabase } from '@/services/database';

/**
 * Debug utility to check all transactions in the database
 */
export const debugTransactions = () => {
  const db = openDatabase();
  const transactions = db.getAllSync('SELECT * FROM transactions ORDER BY date DESC');
  console.log('=== ALL TRANSACTIONS IN DATABASE ===');
  console.log(`Total: ${transactions.length} transactions`);
  transactions.forEach((t: any) => {
    console.log({
      id: t.id,
      amount: t.amount,
      type: t.type,
      date: t.date,
      category_id: t.category_id,
      description: t.description,
    });
  });
  console.log('=== END TRANSACTIONS ===');
};

/**
 * Clear all transactions from the database
 */
export const clearAllTransactions = () => {
  const db = openDatabase();
  db.runSync('DELETE FROM transactions');
  console.log('✅ All transactions deleted!');
};

/**
 * Clear all budgets from the database
 */
export const clearAllBudgets = () => {
  const db = openDatabase();
  db.runSync('DELETE FROM budgets');
  console.log('✅ All budgets deleted!');
};

/**
 * Reset everything - use with caution!
 */
export const clearAllData = () => {
  const db = openDatabase();
  db.runSync('DELETE FROM transactions');
  db.runSync('DELETE FROM budgets');
  db.runSync('DELETE FROM savings_goals');
  console.log('✅ All data cleared!');
};
