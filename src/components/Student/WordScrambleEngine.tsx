import React, { useState, useEffect } from 'react';
import type { Game } from '../../types/lesson';
import { parseWordScrambleItem } from '../../utils/parsers';
import { CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';

interface WordScrambleEngineProps {
  game: Game;
  lang: Language;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
}

interface LetterTile {
  id: string;
  char: string;
}

export const WordScrambleEngine: React.FC<WordScrambleEngineProps> = ({
  game,
  lang,
  onItemCompleted,
  onGameFinished,
}) => {
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankTiles, setBankTiles] = useState<LetterTile[]>([]);
  const [chosenTiles, setChosenTiles] = useState<LetterTile[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentRawItem = game.items[currentIndex];
  const parsed = parseWordScrambleItem(currentRawItem, `ws-${currentIndex}`);

  useEffect(() => {
    const nextParsed = parseWordScrambleItem(game.items[currentIndex], `ws-${currentIndex}`);
    const tiles: LetterTile[] = nextParsed.scrambledLetters.map((char, idx) => ({
      id: `tile-${idx}-${Date.now()}`,
      char,
    }));
    setBankTiles(tiles);
    setChosenTiles([]);
    setShowHint(false);
    setSubmitted(false);
    setIsCorrect(false);
  }, [currentIndex, game]);

  // Support typing on physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted) return;
      const key = e.key.toLowerCase();

      if (key === 'backspace') {
        if (chosenTiles.length > 0) {
          const lastTile = chosenTiles[chosenTiles.length - 1];
          setChosenTiles((prev) => prev.slice(0, prev.length - 1));
          setBankTiles((prev) => [...prev, lastTile]);
        }
      } else if (key.length === 1 && key >= 'a' && key <= 'z') {
        const matchingIndex = bankTiles.findIndex((t) => t.char.toLowerCase() === key);
        if (matchingIndex !== -1) {
          const tile = bankTiles[matchingIndex];
          setBankTiles((prev) => prev.filter((_, idx) => idx !== matchingIndex));
          setChosenTiles((prev) => [...prev, tile]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bankTiles, chosenTiles, submitted]);

  const handleBankTileClick = (tile: LetterTile) => {
    if (submitted) return;
    setBankTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setChosenTiles((prev) => [...prev, tile]);
  };

  const handleChosenTileClick = (tile: LetterTile) => {
    if (submitted) return;
    setChosenTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setBankTiles((prev) => [...prev, tile]);
  };

  const handleReset = () => {
    if (submitted) return;
    setBankTiles([...bankTiles, ...chosenTiles]);
    setChosenTiles([]);
  };

  const handleCheck = () => {
    if (submitted) return;
    const constructedWord = chosenTiles.map((t) => t.char).join('').toLowerCase();
    const targetWord = parsed.originalWord.replace(/\s+/g, '').toLowerCase();
    const matched = constructedWord === targetWord;

    setSubmitted(true);
    setIsCorrect(matched);
    onItemCompleted(matched);
  };

  const handleNext = () => {
    if (currentIndex < game.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameFinished();
    }
  };

  return (
    <div className="game-card shadow-lg animate-fade-in">
      <div className="game-item-header">
        <span className="step-badge">{t.question} {currentIndex + 1}/{game.items.length}</span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      {parsed.hint && (
        <div className="hint-banner mt-2">
          <button className="hint-btn" onClick={() => setShowHint(!showHint)}>
            <HelpCircle size={16} /> {showHint ? t.hideHint : t.showHint}
          </button>
          {showHint && <span className="hint-text">{parsed.hint}</span>}
        </div>
      )}

      {/* Target construction slots */}
      <div className="scramble-slots-container mt-4">
        <div className="scramble-slots">
          {Array.from({ length: parsed.scrambledLetters.length }).map((_, idx) => {
            const tile = chosenTiles[idx];
            return (
              <button
                key={`slot-${idx}`}
                onClick={() => tile && handleChosenTileClick(tile)}
                disabled={submitted}
                className={`letter-slot ${tile ? 'filled animate-pop' : 'empty'}`}
              >
                {tile ? tile.char : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Letter Bank */}
      <div className="letter-bank-container mt-4">
        <div className="bank-header">
          <span>{t.chooseLetters}</span>
          {chosenTiles.length > 0 && !submitted && (
            <button className="btn-text" onClick={handleReset}>
              <RotateCcw size={14} /> {t.clearAll}
            </button>
          )}
        </div>
        <div className="letter-bank">
          {bankTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleBankTileClick(tile)}
              disabled={submitted}
              className="letter-tile animate-pop"
            >
              {tile.char}
            </button>
          ))}
        </div>
      </div>

      {submitted && (
        <div className={`feedback-banner ${isCorrect ? 'success' : 'error'} animate-slide-up mt-4`}>
          <div className="feedback-content">
            <CheckCircle2 size={24} />
            <div>
              <p className="feedback-title">{isCorrect ? t.correctSpelling : t.incorrectSpelling}</p>
              {!isCorrect && (
                <p className="feedback-detail">
                  {t.correctWord} <strong>{parsed.originalWord}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="game-actions mt-4">
        {!submitted ? (
          <button
            className="btn-primary"
            onClick={handleCheck}
            disabled={bankTiles.length > 0}
          >
            {t.checkWord}
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}>
            {currentIndex < game.items.length - 1 ? t.nextQuestion : t.finishSection}
          </button>
        )}
      </div>
    </div>
  );
};
