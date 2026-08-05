export type GameType = 'cloze' | 'matching' | 'sentence_builder' | 'error_spotter' | 'word_scramble';

export interface Game {
  id: string;
  type: GameType;
  instruction: string;
  items: string[];
}

export interface Lesson {
  lesson_id: string;
  title: string;
  description: string;
  category?: string;
  games: Game[];
}

export interface StudentProgress {
  completedLessons: Record<string, {
    highScore: number;
    totalGames: number;
    bestTimeSeconds: number;
    completedAt: string;
  }>;
}

// Parsed Data Structures for Game Engines

// Cloze item segment
export type ClozeSegment = 
  | { type: 'text'; content: string }
  | { type: 'blank'; id: string; target: string; hint?: string; isPartial: boolean; prefix?: string; suffix?: string };

export interface ParsedClozeItem {
  segments: ClozeSegment[];
  fullTargetSentence: string;
}

// Matching item pair
export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

// Sentence builder item
export interface ParsedSentenceBuilderItem {
  id: string;
  correctBlocks: string[];
  shuffledBlocks: string[];
}

// Error spotter item
export interface ParsedErrorSpotterItem {
  id: string;
  tokens: Array<{
    id: string;
    text: string;
    isErrorTarget: boolean;
    wrongWord?: string;
    correctWord?: string;
  }>;
  fullSentence: string;
}

// Word scramble item
export interface ParsedWordScrambleItem {
  id: string;
  originalWord: string;
  hint?: string;
  scrambledLetters: string[];
}
