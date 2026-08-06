import React, { useState, useEffect, useCallback } from 'react';
import type { Game } from '../../types/lesson';
import { parseSentenceBuilderItem } from '../../utils/parsers';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface SentenceBuilderEngineProps {
  game: Game;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
  onRecordMistake?: (rawItem: string) => void;
}

export const SentenceBuilderEngine: React.FC<SentenceBuilderEngineProps> = ({
  game,
  onItemCompleted,
  onGameFinished,
  onRecordMistake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankBlocks, setBankBlocks] = useState<{ id: string; text: string }[]>([]);
  const [constructedBlocks, setConstructedBlocks] = useState<{ id: string; text: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentRawItem = game.items[currentIndex];
  const parsed = parseSentenceBuilderItem(currentRawItem, `sb-${currentIndex}`);

  useEffect(() => {
    const blocksWithId = parsed.shuffledBlocks.map((b, idx) => ({
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

  const handleCheck = useCallback(() => {
    if (submitted) return;
    const userSentence = constructedBlocks.map((b) => b.text).join(' ');
    const correctSentence = parsed.correctBlocks.join(' ');
    const matched = userSentence === correctSentence;

    setSubmitted(true);
    setIsCorrect(matched);
    onItemCompleted(matched);

    if (!matched && onRecordMistake) {
      onRecordMistake(currentRawItem);
    }
  }, [submitted, constructedBlocks, parsed, currentRawItem, onItemCompleted, onRecordMistake]);

  const handleNext = useCallback(() => {
    if (currentIndex < game.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameFinished();
    }
  }, [currentIndex, game.items.length, onGameFinished]);

  // Enter key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!submitted && bankBlocks.length === 0 && constructedBlocks.length > 0) {
          handleCheck();
        } else if (submitted) {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitted, bankBlocks, constructedBlocks, handleCheck, handleNext]);

  return (
    <div className="game-card shadow-lg animate-fade-in">
      <div className="game-item-header">
        <span className="step-badge">{currentIndex + 1} / {game.items.length}</span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      <div className="drop-zone-container">
        <div className="drop-zone-label">Câu trả lời của bạn:</div>
        <div className={`drop-zone ${constructedBlocks.length === 0 ? 'empty' : ''}`}>
          {constructedBlocks.length === 0 ? (
            <span className="placeholder-text">Bấm vào các khối từ bên dưới để ghép câu</span>
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

      <div className="word-bank-container mt-4">
        <div className="bank-header">
          <span>Các khối từ:</span>
          {constructedBlocks.length > 0 && !submitted && (
            <button className="btn-text" onClick={handleReset}>
              <RotateCcw size={14} /> Xóa lại
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
            {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            <div>
              <p className="feedback-title">{isCorrect ? '✅ Ghép hoàn toàn chính xác!' : '❌ Thứ tự chưa đúng!'}</p>
              <p className="feedback-detail">
                <strong>{parsed.correctBlocks.join(' ')}</strong>
              </p>
              {parsed.translation && (
                <p className="feedback-translation mt-1">
                  🇻🇳 <strong>{parsed.translation}</strong>
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
            disabled={bankBlocks.length > 0 || constructedBlocks.length === 0}
          >
            Kiểm tra ↵
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}>
            {currentIndex < game.items.length - 1 ? 'Câu tiếp →' : 'Hoàn thành →'}
          </button>
        )}
      </div>
    </div>
  );
};
