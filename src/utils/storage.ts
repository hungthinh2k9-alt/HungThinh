import type { Lesson, StudentProgress } from '../types/lesson';
import { saveLessonsToSupabase } from './supabase';

const LESSONS_STORAGE_KEY = 'antigravity_english_lessons';
const PROGRESS_STORAGE_KEY = 'antigravity_english_progress';

export const INITIAL_LESSONS: Lesson[] = [
  {
    lesson_id: 'topic-01',
    title: 'Simple Present & Daily Routines',
    description: 'Learn basic daily verbs, simple present structures, and routine vocabulary.',
    category: 'Grammar & Vocabulary',
    games: [
      {
        id: 'g1',
        type: 'cloze',
        instruction: 'Fill in the missing letters or words.',
        items: [
          'She is feeling very [happy|vui vẻ] today.',
          'They h[av]e breakfast at 7 AM.',
          'He [likes|thích] to read books before sleeping.'
        ]
      },
      {
        id: 'g2',
        type: 'matching',
        instruction: 'Match the English frequency adverbs with their correct meanings.',
        items: [
          'Always => Luôn luôn',
          'Usually => Thường xuyên',
          'Never => Không bao giờ',
          'Sometimes => Thỉnh thoảng',
          'Rarely => Hiếm khi'
        ]
      },
      {
        id: 'g3',
        type: 'sentence_builder',
        instruction: 'Arrange the word blocks to form a correct sentence.',
        items: [
          'She | usually gets up | early in the morning.',
          'They | do not like | fast food.',
          'My brother | plays football | every weekend.'
        ]
      },
      {
        id: 'g4',
        type: 'error_spotter',
        instruction: 'Click the incorrect word in the sentence and type the correct word.',
        items: [
          'She [go -> goes] to school every day.',
          'He [do not -> does not] like eating spicy food.',
          'They [is -> are] watching a football match.'
        ]
      },
      {
        id: 'g5',
        type: 'word_scramble',
        instruction: 'Reorder the letters to spell the target word correctly.',
        items: [
          'beautiful|Very pleasing to look at',
          'challenge|A demanding task or situation',
          'routine|A sequence of actions regularly followed'
        ]
      }
    ]
  },
  {
    lesson_id: 'topic-02',
    title: 'Travel & Vacation Expressions',
    description: 'Master key phrases for traveling, airport situations, and hotel reservations.',
    category: 'Conversational English',
    games: [
      {
        id: 't1',
        type: 'cloze',
        instruction: 'Complete the travel sentences with the correct words or letters.',
        items: [
          'I need to renew my [passport|hộ chiếu] before traveling.',
          'What time does our fl[ig]ht depart?',
          'She booked a luxury [hotel|khách sạn] room by the beach.'
        ]
      },
      {
        id: 't2',
        type: 'matching',
        instruction: 'Match travel terms with their meanings.',
        items: [
          'Boarding Pass => Thẻ lên máy bay',
          'Luggage => Hành lý',
          'Sightseeing => Tham quan ngắm cảnh',
          'Reservation => Đặt chỗ trước'
        ]
      },
      {
        id: 't3',
        type: 'sentence_builder',
        instruction: 'Unscramble the blocks to build travel sentences.',
        items: [
          'Could you tell me | where the passport control | is located?',
          'We arrived at | the international airport | two hours early.'
        ]
      },
      {
        id: 't4',
        type: 'error_spotter',
        instruction: 'Find the mistake in each travel phrase and correct it.',
        items: [
          'I would like to [reservation -> reserve] a window seat.',
          'Where [is -> are] my suitcases?'
        ]
      },
      {
        id: 't5',
        type: 'word_scramble',
        instruction: 'Unscramble the letters to reveal travel vocabulary words.',
        items: [
          'vacation|A period of recreation spent away from home',
          'destination|The place to which someone is going',
          'souvenir|A thing kept as a reminder of a place'
        ]
      }
    ]
  }
];

export function getStoredLessons(): Lesson[] {
  try {
    const data = localStorage.getItem(LESSONS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(INITIAL_LESSONS));
      saveLessonsToSupabase(INITIAL_LESSONS);
      return INITIAL_LESSONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse lessons from localStorage', err);
    return INITIAL_LESSONS;
  }
}

export function saveStoredLessons(lessons: Lesson[]): void {
  try {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
    saveLessonsToSupabase(lessons);
  } catch (err) {
    console.error('Failed to save lessons to localStorage', err);
  }
}

export function getStoredProgress(): StudentProgress {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!data) {
      return { completedLessons: {} };
    }
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

export function resetAllStorage(): void {
  localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(INITIAL_LESSONS));
  saveLessonsToSupabase(INITIAL_LESSONS);
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}
