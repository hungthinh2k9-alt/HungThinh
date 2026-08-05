import { createClient } from '@supabase/supabase-js';
import type { Lesson } from '../types/lesson';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch lessons from Supabase (falls back to null if not configured)
 */
export async function fetchLessonsFromSupabase(): Promise<Lesson[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('lessons').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('Supabase fetch error, falling back to LocalStorage:', error.message);
      return null;
    }
    return data as Lesson[];
  } catch (err) {
    console.warn('Supabase request failed:', err);
    return null;
  }
}

/**
 * Sync lessons array to Supabase
 */
export async function saveLessonsToSupabase(lessons: Lesson[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('lessons').upsert(lessons, { onConflict: 'lesson_id' });
    if (error) {
      console.error('Failed to sync lessons to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save error:', err);
    return false;
  }
}
