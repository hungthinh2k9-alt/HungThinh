import React, { useState, useEffect } from 'react';
import type { Game } from '../../types/lesson';
import { parseWordScrambleItem } from '../../utils/parsers';
import { CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react';

interface WordScrambleEngineProps {
  game: Game;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
  onRecordMistake?: (rawItem: string) => void;
}

interface LetterTile {
  id: string;
  char: string;
}

export const WordScrambleEngine: React.FC<WordScrambleEngineProps> = ({
  game,
  onItemCompleted,
  onGameFinished,
  onRecordMistake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankTiles, setBankTiles] = useState<LetterTile[]>([]);
  const [chosenTiles, setChosenTiles] = useState<LetterTile[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentRawItem = game.items[currentIndex];
  const parsed = parseWordScrambleItem(currentRawItem, `ws-${currentIndex}`);

  useEffect(() => {
    const tiles: LetterTile[] = parsed.scrambledLetters.map((char, idx) => ({
      id: `tile-${idx}-${Date.now()}`,
      char,
    }));
    setBankTiles(tiles);
    setChosenTiles([]);
    setShowHint(false);
    setSubmitted(false);
    setIsCorrect(false);
  }, [currentIndex, game]);

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

    if (!matched && onRecordMistake) {
      onRecordMistake(currentRawItem);
    }
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
        <span className="step-badge">Question {currentIndex + 1} of {game.items.length}</span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      {parsed.hint && (
        <div className="hint-banner mt-2">
          <button className="hint-btn" onClick={() => setShowHint(!showHint)}>
            <HelpCircle size={16} /> {showHint ? ' Hide Hint' : ' Show Hint'}
          </button>
          {showHint && (
            <span className="hint-text bold-spaced-hint">
              &nbsp;&nbsp;<strong>{parsed.hint}</strong>
            </span>
          )}
        </div>
      )}

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

      <div className="letter-bank-container mt-4">
        <div className="bank-header">
          <span>Click or type letters:</span>
          {chosenTiles.length > 0 && !submitted && (
            <button className="btn-text" onClick={handleReset}>
              <RotateCcw size={14} /> Clear
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
              <p className="feedback-title">{isCorrect ? 'Correct Spelling!' : 'Incorrect Spelling!'}</p>
              <p className="feedback-detail">
                Target word: <strong>{parsed.originalWord}</strong>
              </p>
              {parsed.translation && (
                <p className="feedback-translation mt-1">
                  🇻🇳 Nghĩa tiếng Việt: <strong>{parsed.translation}</strong>
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
            Check Word
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}>
            {currentIndex < game.items.length - 1 ? 'Next Question →' : 'Finish Section →'}
          </button>
        )}
      </div>
    </div>
  );
};
