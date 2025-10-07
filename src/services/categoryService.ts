import { supabase } from './supabase';
import type { Category, CategoryInsert } from '@/types/database';

// Get all categories for the current user
export const getAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

// Get categories by type for the current user
export const getCategoriesByType = async (type: 'expense' | 'income'): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories by type:', error);
    throw error;
  }

  return data || [];
};

// Get category by ID for the current user
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
};

// Create new category
export const createCategory = async (category: Omit<CategoryInsert, 'user_id'>): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data.id;
};

// Update category
export const updateCategory = async (
  id: string,
  updates: Partial<Omit<CategoryInsert, 'user_id'>>
): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Get category count for the current user
export const getCategoryCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting category count:', error);
    return 0;
  }

  return count || 0;
};

// Seed default categories (called automatically by Supabase trigger on user creation)
// This function is kept for compatibility but is not needed with Supabase
export const seedDefaultCategories = async (): Promise<void> => {
  // Default categories are automatically seeded by Supabase trigger
  // when a new user signs up. This function is kept for backwards compatibility.
  console.log('Default categories are automatically seeded on user signup');
};
