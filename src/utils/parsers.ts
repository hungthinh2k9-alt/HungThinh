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
 */
export function parseClozeItem(rawString: string, itemId: string): ParsedClozeItem {
  let mainText = rawString;
  let translation: string | undefined;

  if (rawString.includes('=>')) {
    const parts = rawString.split('=>');
    mainText = parts[0].trim();
    translation = parts[1].trim();
  }

  const segments: ClozeSegment[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blankCounter = 0;
  let fullSentenceText = '';

  while ((match = regex.exec(mainText)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = mainText.slice(lastIndex, match.index);
      segments.push({ type: 'text', content: textChunk });
      fullSentenceText += textChunk;
    }

    const insideBracket = match[1].trim();
    blankCounter++;
    const blankId = `${itemId}-b${blankCounter}`;

    if (insideBracket.includes('|')) {
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

  if (lastIndex < mainText.length) {
    const remainingText = mainText.slice(lastIndex);
    segments.push({ type: 'text', content: remainingText });
    fullSentenceText += remainingText;
  }

  return {
    segments,
    fullTargetSentence: fullSentenceText,
    translation,
  };
}

/**
 * Parse Matching items list
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
 */
export function parseSentenceBuilderItem(rawString: string, itemId: string): ParsedSentenceBuilderItem {
  let mainText = rawString;
  let translation: string | undefined;

  if (rawString.includes('=>')) {
    const parts = rawString.split('=>');
    mainText = parts[0].trim();
    translation = parts[1].trim();
  }

  let blocks: string[];
  if (mainText.includes('|')) {
    blocks = mainText
      .split('|')
      .map((b) => b.trim())
      .filter(Boolean);
  } else {
    blocks = mainText
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  let shuffled = shuffleArray(blocks);
  if (blocks.length > 1 && shuffled.join(' ') === blocks.join(' ')) {
    shuffled = [...shuffled].reverse();
  }

  return {
    id: itemId,
    correctBlocks: blocks,
    shuffledBlocks: shuffled,
    translation,
  };
}

/**
 * Parse Error Spotter item string
 */
export function parseErrorSpotterItem(rawString: string, itemId: string): ParsedErrorSpotterItem {
  let mainText = rawString;
  let translation: string | undefined;

  if (rawString.includes('=>')) {
    const parts = rawString.split('=>');
    mainText = parts[0].trim();
    translation = parts[1].trim();
  }

  const pattern = /\[([^\]]+?)\s*->\s*([^\]]+?)\]/g;
  let match = pattern.exec(mainText);
  
  const tokens: ParsedErrorSpotterItem['tokens'] = [];
  let fullSentence = mainText;

  if (match) {
    const wrongWord = match[1].trim();
    const correctWord = match[2].trim();
    
    const beforeText = mainText.slice(0, match.index);
    const afterText = mainText.slice(match.index + match[0].length);

    fullSentence = `${beforeText}${correctWord}${afterText}`;

    const beforeWords = beforeText.split(/(\s+)/).filter(Boolean);
    beforeWords.forEach((w, idx) => {
      if (w.trim()) {
        tokens.push({
          id: `${itemId}-tok-b-${idx}`,
          text: w,
          isErrorTarget: false,
        });
      }
    });

    tokens.push({
      id: `${itemId}-tok-err`,
      text: wrongWord,
      isErrorTarget: true,
      wrongWord,
      correctWord,
    });

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
    const words = mainText.split(/\s+/);
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
    translation,
  };
}

/**
 * Parse Word Scramble item string
 */
export function parseWordScrambleItem(rawString: string, itemId: string): ParsedWordScrambleItem {
  let mainText = rawString.trim();
  let translation: string | undefined;

  if (rawString.includes('=>')) {
    const parts = rawString.split('=>');
    mainText = parts[0].trim();
    translation = parts[1].trim();
  }

  let word = mainText;
  let hint: string | undefined;

  if (mainText.includes('|')) {
    const parts = mainText.split('|');
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
    translation,
    scrambledLetters: scrambled,
  };
}
