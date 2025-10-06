// Database initialization
export { initDatabase, resetDatabase, openDatabase } from './database';

// Category services
export {
  getAllCategories,
  getCategoriesByType,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryCount,
} from './categoryService';

// Transaction services
export {
  getAllTransactions,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  getTransactionsByType,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTotalExpenses,
  getTotalIncome,
  getRecurringTransactions,
} from './transactionService';

// Budget services
export {
  getAllBudgets,
  getBudgetById,
  getBudgetsByCategory,
  getActiveBudgets,
  getBudgetsByPeriod,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSpending,
  getBudgetProgress,
} from './budgetService';

// Savings goal services
export {
  getAllSavingsGoals,
  getSavingsGoalById,
  getActiveSavingsGoals,
  getCompletedSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  addToSavingsGoal,
  subtractFromSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoalProgress,
  getRemainingAmount,
  isSavingsGoalCompleted,
  getTotalSavings,
} from './savingsGoalService';

// Notification services
export {
  requestNotificationPermissions,
  scheduleBudgetAlert,
  checkBudgetThresholds,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
} from './notificationService';
