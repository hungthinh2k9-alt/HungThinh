import React, { useState, useEffect } from 'react';
import type { Game } from '../../types/lesson';
import { parseSentenceBuilderItem } from '../../utils/parsers';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';

interface SentenceBuilderEngineProps {
  game: Game;
  lang: Language;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
}

export const SentenceBuilderEngine: React.FC<SentenceBuilderEngineProps> = ({
  game,
  lang,
  onItemCompleted,
  onGameFinished,
}) => {
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankBlocks, setBankBlocks] = useState<{ id: string; text: string }[]>([]);
  const [constructedBlocks, setConstructedBlocks] = useState<{ id: string; text: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentRawItem = game.items[currentIndex];
  const parsed = parseSentenceBuilderItem(currentRawItem, `sb-${currentIndex}`);

  useEffect(() => {
    const nextParsed = parseSentenceBuilderItem(game.items[currentIndex], `sb-${currentIndex}`);
    const blocksWithId = nextParsed.shuffledBlocks.map((b, idx) => ({
      id: `block-${idx}-${Date.now()}`,
      text: b,
    }));
    setBankBlocks(blocksWithId);
    setConstructedBlocks([]);
    setSubmitted(false);
    setIsCorrect(false);
  }, [currentIndex, game]);

  const handleBankBlockClick = (block: { id: string; text: string }) => {
    if (submitted) return;
    setBankBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setConstructedBlocks((prev) => [...prev, block]);
  };

  const handleConstructedBlockClick = (block: { id: string; text: string }) => {
    if (submitted) return;
    setConstructedBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setBankBlocks((prev) => [...prev, block]);
  };

  const handleReset = () => {
    if (submitted) return;
    setBankBlocks([...bankBlocks, ...constructedBlocks]);
    setConstructedBlocks([]);
  };

  const handleCheck = () => {
    if (submitted) return;
    const userSentence = constructedBlocks.map((b) => b.text).join(' ');
    const correctSentence = parsed.correctBlocks.join(' ');
    const matched = userSentence === correctSentence;

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

      {/* Target drop zone / sentence line */}
      <div className="drop-zone-container">
        <div className="drop-zone-label">{t.yourSentence}</div>
        <div className={`drop-zone ${constructedBlocks.length === 0 ? 'empty' : ''}`}>
          {constructedBlocks.length === 0 ? (
            <span className="placeholder-text">{t.clickBlocks}</span>
          ) : (
            constructedBlocks.map((b) => (
              <button
                key={b.id}
                onClick={() => handleConstructedBlockClick(b)}
                disabled={submitted}
                className="tile-block constructed-tile animate-pop"
              >
                {b.text}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Word bank */}
      <div className="word-bank-container mt-4">
        <div className="bank-header">
          <span>{t.availableBlocks}</span>
          {constructedBlocks.length > 0 && !submitted && (
            <button className="btn-text" onClick={handleReset}>
              <RotateCcw size={14} /> {t.clearAll}
            </button>
          )}
        </div>
        <div className="word-bank">
          {bankBlocks.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBankBlockClick(b)}
              disabled={submitted}
              className="tile-block bank-tile animate-pop"
            >
              {b.text}
            </button>
          ))}
        </div>
      </div>

      {submitted && (
        <div className={`feedback-banner ${isCorrect ? 'success' : 'error'} animate-slide-up mt-4`}>
          <div className="feedback-content">
            <CheckCircle2 size={24} />
            <div>
              <p className="feedback-title">{isCorrect ? t.perfectArrangement : t.incorrectOrder}</p>
              {!isCorrect && (
                <p className="feedback-detail">
                  {t.correctSentence} <strong>{parsed.correctBlocks.join(' ')}</strong>
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
            disabled={bankBlocks.length > 0 && constructedBlocks.length === 0}
          >
            {t.checkAnswer}
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
