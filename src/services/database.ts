import * as SQLite from 'expo-sqlite';

const DB_NAME = 'budget_tracker.db';

// Open database
export const openDatabase = () => {
  return SQLite.openDatabaseSync(DB_NAME);
};

// Initialize database with all tables
export const initDatabase = async () => {
  const db = openDatabase();

  // Create categories table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      budget_limit REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create transactions table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      payment_method TEXT NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      recurring_frequency TEXT CHECK(recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

  // Create budgets table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly', 'yearly')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

  // Create savings_goals table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create indexes for better performance
  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
  `);

  console.log('Database initialized successfully');
};

// Drop all tables (for development/testing)
export const resetDatabase = async () => {
  const db = openDatabase();
  
  db.execSync('DROP TABLE IF EXISTS transactions;');
  db.execSync('DROP TABLE IF EXISTS budgets;');
  db.execSync('DROP TABLE IF EXISTS savings_goals;');
  db.execSync('DROP TABLE IF EXISTS categories;');
  
  await initDatabase();
  console.log('Database reset successfully');
};
