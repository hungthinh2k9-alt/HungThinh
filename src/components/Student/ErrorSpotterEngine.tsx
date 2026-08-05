import React, { useState, useEffect } from 'react';
import type { Game } from '../../types/lesson';
import { parseErrorSpotterItem } from '../../utils/parsers';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';

interface ErrorSpotterEngineProps {
  game: Game;
  lang: Language;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
}

export const ErrorSpotterEngine: React.FC<ErrorSpotterEngineProps> = ({
  game,
  lang,
  onItemCompleted,
  onGameFinished,
}) => {
  const t = translations[lang];
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

  const handleCheck = () => {
    if (submitted) return;

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

      <div className="error-sentence-box">
        {parsed.tokens.map((token) => {
          const isSelected = selectedTokenId === token.id;

          if (isSelected) {
            return (
              <span key={token.id} className="error-token-active">
                <input
                  type="text"
                  value={correctionInput}
                  onChange={(e) => setCorrectionInput(e.target.value)}
                  placeholder={lang === 'vi' ? `Sửa “${token.text}”` : `Fix “${token.text}”`}
                  disabled={submitted}
                  autoFocus
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
        {t.clickWrongWord}
      </div>

      {submitted && (
        <div className={`feedback-banner ${isCorrect ? 'success' : 'error'} animate-slide-up mt-4`}>
          <div className="feedback-content">
            {isCorrect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <div>
              <p className="feedback-title">
                {isCorrect ? t.greatEye : t.notQuiteRight}
              </p>
              {!isCorrect && (
                <p className="feedback-detail">
                  {t.correctSentence} <strong>{parsed.fullSentence}</strong>
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
            disabled={!selectedTokenId || correctionInput.trim().length === 0}
          >
            {t.submitCorrection}
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
