import * as SQLite from 'expo-sqlite';
import { seedDefaultCategories } from './categoryService';

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

  // Migrate budgets table to support nullable category_id
  // Check if budgets table exists with old schema
  const tableInfo = db.getAllSync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'"
  );
  
  if (tableInfo.length > 0) {
    // Check if category_id is nullable
    const columns = db.getAllSync<{ name: string; notnull: number }>(
      "PRAGMA table_info(budgets)"
    );
    const categoryIdColumn = columns.find(col => col.name === 'category_id');
    
    // If category_id has NOT NULL constraint, migrate the table
    if (categoryIdColumn && categoryIdColumn.notnull === 1) {
      console.log('Migrating budgets table to support nullable category_id...');
      
      // Create new table with correct schema
      db.execSync(`
        CREATE TABLE budgets_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER,
          amount REAL NOT NULL,
          period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly', 'yearly')),
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          alert_threshold INTEGER DEFAULT 80,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        );
      `);
      
      // Copy existing data
      db.execSync(`
        INSERT INTO budgets_new (id, category_id, amount, period, start_date, end_date, created_at)
        SELECT id, category_id, amount, period, start_date, end_date, created_at
        FROM budgets;
      `);
      
      // Drop old table
      db.execSync('DROP TABLE budgets;');
      
      // Rename new table
      db.execSync('ALTER TABLE budgets_new RENAME TO budgets;');
      
      console.log('Budgets table migration complete');
    }
  } else {
    // Create budgets table with new schema
    db.execSync(`
      CREATE TABLE budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        amount REAL NOT NULL,
        period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly', 'yearly')),
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        alert_threshold INTEGER DEFAULT 80,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      );
    `);
  }

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

  // Seed default categories if none exist
  seedDefaultCategories();

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
