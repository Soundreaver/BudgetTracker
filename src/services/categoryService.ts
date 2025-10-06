import { openDatabase } from './database';
import type { Category, CategoryInsert } from '@/types/database';

// Get all categories
export const getAllCategories = (): Category[] => {
  const db = openDatabase();
  const result = db.getAllSync<Category>('SELECT * FROM categories ORDER BY created_at DESC');
  return result;
};

// Get categories by type
export const getCategoriesByType = (type: 'expense' | 'income'): Category[] => {
  const db = openDatabase();
  const result = db.getAllSync<Category>(
    'SELECT * FROM categories WHERE type = ? ORDER BY created_at DESC',
    [type]
  );
  return result;
};

// Get category by ID
export const getCategoryById = (id: number): Category | null => {
  const db = openDatabase();
  const result = db.getFirstSync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  return result;
};

// Create new category
export const createCategory = (category: CategoryInsert): number => {
  const db = openDatabase();
  const result = db.runSync(
    `INSERT INTO categories (name, icon, color, type, budget_limit) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      category.name,
      category.icon,
      category.color,
      category.type,
      category.budget_limit ?? null,
    ]
  );
  return result.lastInsertRowId;
};

// Update category
export const updateCategory = (
  id: number,
  updates: Partial<CategoryInsert>
): void => {
  const db = openDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.icon !== undefined) {
    fields.push('icon = ?');
    values.push(updates.icon);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.budget_limit !== undefined) {
    fields.push('budget_limit = ?');
    values.push(updates.budget_limit);
  }

  if (fields.length === 0) return;

  values.push(id);
  db.runSync(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
};

// Delete category
export const deleteCategory = (id: number): void => {
  const db = openDatabase();
  db.runSync('DELETE FROM categories WHERE id = ?', [id]);
};

// Get category count
export const getCategoryCount = (): number => {
  const db = openDatabase();
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  return result?.count ?? 0;
};

// Seed default categories if none exist
export const seedDefaultCategories = (): void => {
  const count = getCategoryCount();
  if (count > 0) return; // Categories already exist

  const defaultCategories: CategoryInsert[] = [
    { name: 'Food', icon: '🍔', color: '#FF6B6B', type: 'expense' },
    { name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense' },
    { name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
    { name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
    { name: 'Bills', icon: '📄', color: '#F7DC6F', type: 'expense' },
    { name: 'Healthcare', icon: '🏥', color: '#BB8FCE', type: 'expense' },
    { name: 'Salary', icon: '💰', color: '#58D68D', type: 'income' },
    { name: 'Freelance', icon: '💼', color: '#5DADE2', type: 'income' },
  ];

  defaultCategories.forEach(category => {
    createCategory(category);
  });

  console.log('Default categories seeded');
};
