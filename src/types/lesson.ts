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
    stars: number; // 1 to 10 stars rating
    totalGames: number;
    bestTimeSeconds: number;
    completedAt: string;
  }>;
}

// Parsed Data Structures for Game Engines

export type ClozeSegment = 
  | { type: 'text'; content: string }
  | { type: 'blank'; id: string; target: string; hint?: string; isPartial: boolean; prefix?: string; suffix?: string };

export interface ParsedClozeItem {
  segments: ClozeSegment[];
  fullTargetSentence: string;
  translation?: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface ParsedSentenceBuilderItem {
  id: string;
  correctBlocks: string[];
  shuffledBlocks: string[];
  translation?: string;
}

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
  translation?: string;
}

export interface ParsedWordScrambleItem {
  id: string;
  originalWord: string;
  hint?: string;
  translation?: string;
  scrambledLetters: string[];
}

// Missed Question Item for Review Mode
export interface MissedQuestion {
  id: string;
  gameType: GameType;
  gameInstruction: string;
  rawItem: string;
}
