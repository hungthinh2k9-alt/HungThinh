import React, { useState, useEffect } from 'react';
import type { Game } from '../../types/lesson';
import { parseClozeItem } from '../../utils/parsers';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';

interface ClozeEngineProps {
  game: Game;
  lang: Language;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
}

export const ClozeEngine: React.FC<ClozeEngineProps> = ({
  game,
  lang,
  onItemCompleted,
  onGameFinished,
}) => {
  const t = translations[lang];
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
  }, [currentIndex, game]);

  const handleInputChange = (blankId: string, val: string) => {
    if (submitted) return;
    setUserInputs((prev) => ({ ...prev, [blankId]: val }));
  };

  const handleCheck = () => {
    if (submitted) return;

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
  };

  const handleNext = () => {
    if (currentIndex < game.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameFinished();
    }
  };

  const isFormComplete = parsed.segments
    .filter((seg) => seg.type === 'blank')
    .every((seg) => (userInputs[seg.id] || '').trim().length > 0);

  return (
    <div className="game-card shadow-lg animate-fade-in">
      <div className="game-item-header">
        <span className="step-badge">{t.question} {currentIndex + 1}/{game.items.length}</span>
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

          return (
            <span key={seg.id} className="cloze-blank-wrapper">
              <input
                type="text"
                value={blankVal}
                onChange={(e) => handleInputChange(seg.id, e.target.value)}
                disabled={submitted}
                placeholder={'_'.repeat(targetLen)}
                maxLength={targetLen + 5}
                className={`cloze-underline-input ${
                  isBlankCorrect ? 'correct' : isBlankError ? 'incorrect' : ''
                }`}
                style={{ width: `${Math.max(targetLen * 14 + 20, 60)}px` }}
              />

              {seg.hint && (
                <button
                  type="button"
                  className="hint-toggle-btn"
                  onClick={() =>
                    setShowHint((prev) => ({ ...prev, [seg.id]: !prev[seg.id] }))
                  }
                  title={t.showHint}
                >
                  <HelpCircle size={14} />
                  {showHint[seg.id] && <span className="hint-pill">{seg.hint}</span>}
                </button>
              )}
            </span>
          );
        })}
      </div>

      {submitted && (
        <div className={`feedback-banner ${isCorrect ? 'success' : 'error'} animate-slide-up`}>
          <div className="feedback-content">
            <CheckCircle2 size={24} />
            <div>
              <p className="feedback-title">{isCorrect ? t.wellDone : t.keepPracticing}</p>
              {!isCorrect && (
                <p className="feedback-detail">
                  {t.correctSentence} <strong>{parsed.fullTargetSentence}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="game-actions">
        {!submitted ? (
          <button
            className="btn-primary"
            onClick={handleCheck}
            disabled={!isFormComplete}
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
