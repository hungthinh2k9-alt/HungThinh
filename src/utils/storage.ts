import type { Lesson, StudentProgress } from '../types/lesson';
import {
  saveAllLessonsToSupabase,
  saveLessonToSupabase,
  deleteLessonFromSupabase,
} from './supabase';

const LESSONS_STORAGE_KEY = 'antigravity_english_lessons';
const PROGRESS_STORAGE_KEY = 'antigravity_english_progress';

export function getStoredLessons(): Lesson[] {
  try {
    const data = localStorage.getItem(LESSONS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function saveStoredLessons(lessons: Lesson[]): void {
  try {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
    saveAllLessonsToSupabase(lessons);
  } catch (err) {
    console.error('Failed to save lessons', err);
  }
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
    saveLessonToSupabase(lesson);
  } catch (err) {
    console.error('Failed to save single lesson', err);
  }
}

export function deleteStoredLesson(lessonId: string): void {
  try {
    const current = getStoredLessons();
    const updated = current.filter((l) => l.lesson_id !== lessonId);
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(updated));
    deleteLessonFromSupabase(lessonId);
  } catch (err) {
    console.error('Failed to delete lesson', err);
  }
}

export function getStoredProgress(): StudentProgress {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!data) return { completedLessons: {} };
    return JSON.parse(data);
  } catch (err) {
    return { completedLessons: {} };
  }
}

export function saveStudentLessonProgress(
  lessonId: string,
  score: number,
  totalGames: number,
  timeSeconds: number
): void {
  const current = getStoredProgress();
  const existing = current.completedLessons[lessonId];
  const newHighScore = Math.max(existing?.highScore || 0, score);
  const bestTime = existing
    ? Math.min(existing.bestTimeSeconds, timeSeconds)
    : timeSeconds;

  current.completedLessons[lessonId] = {
    highScore: newHighScore,
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
