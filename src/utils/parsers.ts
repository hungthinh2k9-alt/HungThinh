import type {
  ParsedClozeItem,
  MatchingPair,
  ParsedSentenceBuilderItem,
  ParsedErrorSpotterItem,
  ParsedWordScrambleItem,
  ClozeSegment,
} from '../types/lesson';

/**
 * Fisher-Yates shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Parse Cloze Test item string
 * Examples:
 * - "She is feeling very [happy|vui vẻ] today." -> Full word mask with hint "vui vẻ"
 * - "They h[av]e breakfast at 7 AM." -> Partial character mask inside word "have"
 */
export function parseClozeItem(rawString: string, itemId: string): ParsedClozeItem {
  const segments: ClozeSegment[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blankCounter = 0;
  let fullSentenceText = '';

  while ((match = regex.exec(rawString)) !== null) {
    // Text before bracket
    if (match.index > lastIndex) {
      const textChunk = rawString.slice(lastIndex, match.index);
      segments.push({ type: 'text', content: textChunk });
      fullSentenceText += textChunk;
    }

    const insideBracket = match[1].trim();
    blankCounter++;
    const blankId = `${itemId}-b${blankCounter}`;

    if (insideBracket.includes('|')) {
      // Case A: [target|hint]
      const [target, hint] = insideBracket.split('|').map((s) => s.trim());
      segments.push({
        type: 'blank',
        id: blankId,
        target,
        hint,
        isPartial: false,
      });
      fullSentenceText += target;
    } else {
      // Case B: partial word mask like h[av]e or full word [target]
      const target = insideBracket;
      segments.push({
        type: 'blank',
        id: blankId,
        target,
        isPartial: true,
      });
      fullSentenceText += target;
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawString.length) {
    const remainingText = rawString.slice(lastIndex);
    segments.push({ type: 'text', content: remainingText });
    fullSentenceText += remainingText;
  }

  return {
    segments,
    fullTargetSentence: fullSentenceText,
  };
}

/**
 * Parse Matching items list
 * Item format: "Always => Luôn luôn"
 */
export function parseMatchingItems(items: string[]): MatchingPair[] {
  return items
    .map((item, index) => {
      const parts = item.split('=>');
      if (parts.length < 2) return null;
      return {
        id: `match-${index}-${Date.now()}`,
        left: parts[0].trim(),
        right: parts[1].trim(),
      };
    })
    .filter((pair): pair is MatchingPair => pair !== null);
}

/**
 * Parse Sentence Builder item string
 * Examples: "She | usually gets up | early in the morning."
 */
export function parseSentenceBuilderItem(rawString: string, itemId: string): ParsedSentenceBuilderItem {
  let blocks: string[];

  if (rawString.includes('|')) {
    blocks = rawString
      .split('|')
      .map((b) => b.trim())
      .filter(Boolean);
  } else {
    blocks = rawString
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  // Shuffle blocks, ensuring order changes if length > 1
  let shuffled = shuffleArray(blocks);
  if (blocks.length > 1 && shuffled.join(' ') === blocks.join(' ')) {
    shuffled = [...shuffled].reverse();
  }

  return {
    id: itemId,
    correctBlocks: blocks,
    shuffledBlocks: shuffled,
  };
}

/**
 * Parse Error Spotter item string
 * Example: "She [go -> goes] to school every day."
 */
export function parseErrorSpotterItem(rawString: string, itemId: string): ParsedErrorSpotterItem {
  // Regex to find [wrong -> right]
  const pattern = /\[([^\]]+?)\s*->\s*([^\]]+?)\]/g;
  let match = pattern.exec(rawString);
  
  const tokens: ParsedErrorSpotterItem['tokens'] = [];
  let fullSentence = rawString;

  if (match) {
    const wrongWord = match[1].trim();
    const correctWord = match[2].trim();
    
    const beforeText = rawString.slice(0, match.index);
    const afterText = rawString.slice(match.index + match[0].length);

    fullSentence = `${beforeText}${correctWord}${afterText}`;

    // Tokenize before text
    const beforeWords = beforeText.split(/(\s+)/).filter(Boolean);
    beforeWords.forEach((w, idx) => {
      if (w.trim()) {
        tokens.push({
          id: `${itemId}-tok-b-${idx}`,
          text: w,
          isErrorTarget: false,
        });
      } else {
        // preserve whitespace if needed or attach to token
      }
    });

    // The error token
    tokens.push({
      id: `${itemId}-tok-err`,
      text: wrongWord,
      isErrorTarget: true,
      wrongWord,
      correctWord,
    });

    // Tokenize after text
    const afterWords = afterText.split(/(\s+)/).filter(Boolean);
    afterWords.forEach((w, idx) => {
      if (w.trim()) {
        tokens.push({
          id: `${itemId}-tok-a-${idx}`,
          text: w,
          isErrorTarget: false,
        });
      }
    });
  } else {
    // Fallback if formatting was simple text
    const words = rawString.split(/\s+/);
    words.forEach((w, idx) => {
      tokens.push({
        id: `${itemId}-tok-${idx}`,
        text: w,
        isErrorTarget: false,
      });
    });
  }

  return {
    id: itemId,
    tokens,
    fullSentence,
  };
}

/**
 * Parse Word Scramble item string
 * Format: "beautiful" or "beautiful|A pretty appearance"
 */
export function parseWordScrambleItem(rawString: string, itemId: string): ParsedWordScrambleItem {
  let word = rawString.trim();
  let hint: string | undefined;

  if (rawString.includes('|')) {
    const parts = rawString.split('|');
    word = parts[0].trim();
    hint = parts[1].trim();
  }

  const cleanWord = word.replace(/\s+/g, '');
  const letters = cleanWord.split('');

  let scrambled = shuffleArray(letters);
  if (cleanWord.length > 1 && scrambled.join('') === cleanWord) {
    scrambled = [...scrambled].reverse();
  }

  return {
    id: itemId,
    originalWord: word,
    hint,
    scrambledLetters: scrambled,
  };
}
