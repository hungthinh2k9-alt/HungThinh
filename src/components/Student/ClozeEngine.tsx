import React, { useState, useEffect, useCallback } from 'react';
import type { Game } from '../../types/lesson';
import { parseClozeItem } from '../../utils/parsers';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface ClozeEngineProps {
  game: Game;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
  onRecordMistake?: (rawItem: string) => void;
}

export const ClozeEngine: React.FC<ClozeEngineProps> = ({
  game,
  onItemCompleted,
  onGameFinished,
  onRecordMistake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const currentRawItem = game.items[currentIndex];
  const parsed = parseClozeItem(currentRawItem, `cloze-${currentIndex}`);

  useEffect(() => {
    setUserInputs({});
    setSubmitted(false);
    setIsCorrect(false);
    setShowHint({});
  }, [game.id]);

  const handleInputChange = (blankId: string, val: string) => {
    if (submitted) return;
    setUserInputs((prev) => ({ ...prev, [blankId]: val }));
  };

  const isFormComplete = parsed.segments
    .filter((seg) => seg.type === 'blank')
    .every((seg) => (userInputs[seg.id] || '').trim().length > 0);

  const handleCheck = useCallback(() => {
    if (submitted || !isFormComplete) return;

    let allBlanksCorrect = true;
    parsed.segments.forEach((seg) => {
      if (seg.type === 'blank') {
        const val = (userInputs[seg.id] || '').trim().toLowerCase();
        const expected = seg.target.trim().toLowerCase();
        if (val !== expected) {
          allBlanksCorrect = false;
        }
      }
    });

    setSubmitted(true);
    setIsCorrect(allBlanksCorrect);
    onItemCompleted(allBlanksCorrect);

    if (!allBlanksCorrect && onRecordMistake) {
      onRecordMistake(currentRawItem);
    }
  }, [submitted, isFormComplete, parsed, userInputs, currentRawItem, onItemCompleted, onRecordMistake]);

  const handleNext = useCallback(() => {
    if (currentIndex < game.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameFinished();
    }
  }, [currentIndex, game.items.length, onGameFinished]);

  // Enter key: submit answer or go to next question
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!submitted && isFormComplete) {
        handleCheck();
      } else if (submitted) {
        handleNext();
      }
    }
  }, [submitted, isFormComplete, handleCheck, handleNext]);

  return (
    <div className="game-card shadow-lg animate-fade-in" onKeyDown={handleKeyDown}>
      <div className="game-item-header">
        <span className="step-badge">
          {currentIndex + 1} / {game.items.length}
        </span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      <div className="cloze-sentence-box">
        {parsed.segments.map((seg, idx) => {
          if (seg.type === 'text') {
            return <span key={`t-${idx}`} className="sentence-text">{seg.content}</span>;
          }

          const blankVal = userInputs[seg.id] || '';
          const targetLen = seg.target.length;
          const expectedLower = seg.target.toLowerCase();
          const userLower = blankVal.trim().toLowerCase();
          const isBlankCorrect = submitted && userLower === expectedLower;
          const isBlankError = submitted && userLower !== expectedLower;

          // Create spaced underscores (_ _ _ _) for placeholder
          const spacedPlaceholder = Array.from({ length: targetLen }).map(() => '_').join(' ');
          // Dynamic width calculation based on larger of targetLen or typed input length to prevent text cut-off
          const activeLen = Math.max(blankVal.length, targetLen);
          const dynamicWidth = Math.max(activeLen * 18 + 24, 75);

          return (
            <span key={seg.id} className="cloze-blank-wrapper">
              <input
                type="text"
                value={blankVal}
                onChange={(e) => handleInputChange(seg.id, e.target.value)}
                disabled={submitted}
                placeholder={spacedPlaceholder}
                maxLength={targetLen + 20}
                autoComplete="off"
                className={`cloze-underline-input ${
                  isBlankCorrect ? 'correct' : isBlankError ? 'incorrect' : ''
                }`}
                style={{ width: `${dynamicWidth}px` }}
              />

              {seg.hint && (
                <button
                  type="button"
                  className="hint-toggle-btn"
                  onClick={() =>
                    setShowHint((prev) => ({ ...prev, [seg.id]: !prev[seg.id] }))
                  }
                  title="Toggle Hint"
                >
                  <HelpCircle size={14} />
                  {showHint[seg.id] && (
                    <span className="hint-pill bold-spaced-hint">
                      &nbsp;&nbsp;<strong>{seg.hint}</strong>
                    </span>
                  )}
                </button>
              )}
            </span>
          );
        })}
      </div>

      {submitted && (() => {
        // Collect Vietnamese hints from blanks
        const blankHints = parsed.segments
          .filter((seg): seg is Extract<typeof seg, { type: 'blank' }> => seg.type === 'blank' && !!seg.hint)
          .map((seg) => `${seg.target} = ${seg.hint}`);
        
        return (
          <div className={`feedback-banner ${isCorrect ? 'success' : 'error'} animate-slide-up`}>
            <div className="feedback-content">
              {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
              <div>
                <p className="feedback-title">{isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng!'}</p>
                <p className="feedback-detail">
                  <strong>{parsed.fullTargetSentence}</strong>
                </p>
                {parsed.translation && (
                  <p className="feedback-translation mt-2">
                    🇻🇳 <strong>{parsed.translation}</strong>
                  </p>
                )}
                {blankHints.length > 0 && !parsed.translation && (
                  <p className="feedback-translation mt-2">
                    🇻🇳 <strong>{blankHints.join(' · ')}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="game-actions">
        {!submitted ? (
          <button
            className="btn-primary"
            onClick={handleCheck}
            disabled={!isFormComplete}
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
