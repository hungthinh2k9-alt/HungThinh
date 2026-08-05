import { createClient } from '@supabase/supabase-js';
import type { Lesson } from '../types/lesson';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ulvvevcpyhoaupxxsrxq.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_QznwztW8Ib0gshNpeI5Ilg_6qyUSOpm';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch lessons from Supabase table 'lessons'
 */
export async function fetchLessonsFromSupabase(): Promise<Lesson[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch notice, using LocalStorage:', error.message);
      return null;
    }
    return data as Lesson[];
  } catch (err) {
    console.warn('Supabase request error:', err);
    return null;
  }
}

/**
 * Save / Upsert lessons array to Supabase
 */
export async function saveLessonsToSupabase(lessons: Lesson[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const records = lessons.map((l) => ({
      lesson_id: l.lesson_id,
      title: l.title,
      description: l.description,
      category: l.category || 'General',
      games: l.games,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('lessons').upsert(records, {
      onConflict: 'lesson_id',
    });

    if (error) {
      console.warn('Supabase upsert warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save error:', err);
    return false;
  }
}
