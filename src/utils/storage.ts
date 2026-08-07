import type { Lesson, StudentProgress } from '../types/lesson';
const LESSONS_STORAGE_KEY = 'antigravity_english_lessons';
const PROGRESS_STORAGE_KEY = 'antigravity_english_progress';

export function getStoredLessons(): Lesson[] {
  try {
    const data = localStorage.getItem(LESSONS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function cacheLessonsLocally(lessons: Lesson[]): void {
  try {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
  } catch (err) {
    console.error('Failed to save lessons', err);
  }
}

export function saveStoredLessons(lessons: Lesson[]): void {
  cacheLessonsLocally(lessons);
  void import('./supabase')
    .then(({ saveAllLessonsToSupabase }) => saveAllLessonsToSupabase(lessons))
    .catch((err) => console.error('Failed to sync lessons', err));
}

export function saveSingleStoredLesson(lesson: Lesson): void {
  try {
    const current = getStoredLessons();
    const idx = current.findIndex((l) => l.lesson_id === lesson.lesson_id);
    let updated: Lesson[];
    if (idx !== -1) {
      updated = [...current];
      updated[idx] = lesson;
    } else {
      updated = [...current, lesson];
    }
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(updated));
    void import('./supabase')
      .then(({ saveLessonToSupabase }) => saveLessonToSupabase(lesson))
      .catch((err) => console.error('Failed to sync lesson', err));
  } catch (err) {
    console.error('Failed to save single lesson', err);
  }
}

export function deleteStoredLesson(lessonId: string): void {
  try {
    const current = getStoredLessons();
    const updated = current.filter((l) => l.lesson_id !== lessonId);
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(updated));
    void import('./supabase')
      .then(({ deleteLessonFromSupabase }) => deleteLessonFromSupabase(lessonId))
      .catch((err) => console.error('Failed to sync lesson deletion', err));
  } catch (err) {
    console.error('Failed to delete lesson', err);
  }
}

export function getStoredProgress(): StudentProgress {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!data) return { completedLessons: {} };
    return JSON.parse(data);
  } catch {
    return { completedLessons: {} };
  }
}

export function saveStudentLessonProgress(
  lessonId: string,
  score: number,
  totalGames: number,
  timeSeconds: number,
  accuracyPercent: number = 100
): void {
  const current = getStoredProgress();
  const existing = current.completedLessons[lessonId];
  const newHighScore = Math.max(existing?.highScore || 0, score);
  
  // Calculate 1 to 10 star rating based on accuracy
  const starsCount = Math.min(10, Math.max(1, Math.round((accuracyPercent / 100) * 10)));
  const newStars = Math.max(existing?.stars || 0, starsCount);

  const bestTime = existing
    ? Math.min(existing.bestTimeSeconds, timeSeconds)
    : timeSeconds;

  current.completedLessons[lessonId] = {
    highScore: newHighScore,
    stars: newStars,
    totalGames,
    bestTimeSeconds: bestTime,
    completedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save progress', err);
  }
}
