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
 * Fetch all lessons directly from Supabase
 */
export async function fetchLessonsFromSupabase(): Promise<Lesson[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error.message);
      return [];
    }
    return (data as Lesson[]) || [];
  } catch (err) {
    console.error('Supabase request exception:', err);
    return [];
  }
}

/**
 * Upsert / Save a single lesson into Supabase
 */
export async function saveLessonToSupabase(lesson: Lesson): Promise<boolean> {
  if (!supabase) return false;
  try {
    const record = {
      lesson_id: lesson.lesson_id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category || 'General',
      games: lesson.games,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('lessons')
      .upsert(record, { onConflict: 'lesson_id' });

    if (error) {
      console.error('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save exception:', err);
    return false;
  }
}

/**
 * Delete a lesson from Supabase
 */
export async function deleteLessonFromSupabase(lesson_id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('lesson_id', lesson_id);

    if (error) {
      console.error('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete exception:', err);
    return false;
  }
}

/**
 * Save full array of lessons to Supabase
 */
export async function saveAllLessonsToSupabase(lessons: Lesson[]): Promise<boolean> {
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

    const { error } = await supabase
      .from('lessons')
      .upsert(records, { onConflict: 'lesson_id' });

    if (error) {
      console.error('Supabase bulk upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase bulk save exception:', err);
    return false;
  }
}
