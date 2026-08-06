import React, { useState, useEffect, useCallback } from 'react';
import type { Game } from '../../types/lesson';
import { parseErrorSpotterItem } from '../../utils/parsers';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ErrorSpotterEngineProps {
  game: Game;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
  onRecordMistake?: (rawItem: string) => void;
}

export const ErrorSpotterEngine: React.FC<ErrorSpotterEngineProps> = ({
  game,
  onItemCompleted,
  onGameFinished,
  onRecordMistake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [correctionInput, setCorrectionInput] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const currentRawItem = game.items[currentIndex];
  const parsed = parseErrorSpotterItem(currentRawItem, `es-${currentIndex}`);

  useEffect(() => {
    setSelectedTokenId(null);
    setCorrectionInput('');
    setSubmitted(false);
    setIsCorrect(false);
  }, [currentIndex, game]);

  const handleTokenClick = (tokenId: string) => {
    if (submitted) return;
    setSelectedTokenId(tokenId);
    setCorrectionInput('');
  };

  const canSubmit = !!selectedTokenId && correctionInput.trim().length > 0;

  const handleCheck = useCallback(() => {
    if (submitted || !canSubmit) return;

    const selectedToken = parsed.tokens.find((t) => t.id === selectedTokenId);
    let matched = false;

    if (selectedToken && selectedToken.isErrorTarget) {
      const userVal = correctionInput.trim().toLowerCase();
      const expectedVal = (selectedToken.correctWord || '').trim().toLowerCase();
      if (userVal === expectedVal) {
        matched = true;
      }
    }

    setSubmitted(true);
    setIsCorrect(matched);
    onItemCompleted(matched);

    if (!matched && onRecordMistake) {
      onRecordMistake(currentRawItem);
    }
  }, [submitted, canSubmit, parsed, selectedTokenId, correctionInput, currentRawItem, onItemCompleted, onRecordMistake]);

  const handleNext = useCallback(() => {
    if (currentIndex < game.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameFinished();
    }
  }, [currentIndex, game.items.length, onGameFinished]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!submitted && canSubmit) {
        handleCheck();
      } else if (submitted) {
        handleNext();
      }
    }
  };

  return (
    <div className="game-card shadow-lg animate-fade-in">
      <div className="game-item-header">
        <span className="step-badge">{currentIndex + 1} / {game.items.length}</span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      <div className="error-sentence-box" onKeyDown={handleKeyDown}>
        {parsed.tokens.map((token) => {
          const isSelected = selectedTokenId === token.id;

          if (isSelected) {
            return (
              <span key={token.id} className="error-token-active">
                <input
                  type="text"
                  value={correctionInput}
                  onChange={(e) => setCorrectionInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Sửa '${token.text}'`}
                  disabled={submitted}
                  autoFocus
                  autoComplete="off"
                  className="error-correction-input"
                />
              </span>
            );
          }

          return (
            <button
              key={token.id}
              onClick={() => handleTokenClick(token.id)}
              disabled={submitted}
              className={`error-token-btn ${
                submitted && token.isErrorTarget ? 'target-error' : ''
              }`}
            >
              {token.text}
            </button>
          );
        })}
      </div>

      <div className="hint-subtext mt-2">
        💡 Bấm vào từ sai trong câu rồi nhập từ đúng để sửa.
      </div>

      {submitted && (
        <div className={`feedback-banner ${isCorrect ? 'success' : 'error'} animate-slide-up mt-4`}>
          <div className="feedback-content">
            {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            <div>
              <p className="feedback-title">
                {isCorrect ? '✅ Phát hiện và sửa đúng lỗi sai!' : '❌ Chưa chính xác!'}
              </p>
              <p className="feedback-detail">
                <strong>{parsed.fullSentence}</strong>
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
            disabled={!canSubmit}
          >
            Gửi đáp án ↵
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
