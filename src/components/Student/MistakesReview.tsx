import React, { useState } from 'react';
import type { MissedQuestion } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { ClozeEngine } from './ClozeEngine';
import { MatchingEngine } from './MatchingEngine';
import { SentenceBuilderEngine } from './SentenceBuilderEngine';
import { ErrorSpotterEngine } from './ErrorSpotterEngine';
import { WordScrambleEngine } from './WordScrambleEngine';
import { ArrowLeft, RefreshCw, CheckCircle2, Home } from 'lucide-react';

interface MistakesReviewProps {
  missedQuestions: MissedQuestion[];
  lang: Language;
  onBack: () => void;
  onClearMistakes: () => void;
  onBackToDashboard: () => void;
}

export const MistakesReview: React.FC<MistakesReviewProps> = ({
  missedQuestions,
  lang,
  onBack,
  onClearMistakes,
  onBackToDashboard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean>(false);
  const t = translations[lang];

  const remainingQuestions = missedQuestions.filter((q) => !resolvedIds.includes(q.id));

  if (remainingQuestions.length === 0) {
    return (
      <div className="summary-card shadow-xl animate-scale-up">
        <div className="summary-header">
          <div className="trophy-badge animate-bounce-subtle">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="summary-title">{t.noMistakes}</h2>
          <p className="summary-subtitle">
            {lang === 'vi' ? 'Bạn đã làm lại thành công tất cả các câu hỏi bị sai!' : 'You have successfully resolved all missed questions!'}
          </p>
        </div>
        <div className="summary-actions mt-6 flex justify-center gap-3">
          <button className="btn-primary" onClick={() => { onClearMistakes(); onBack(); }}>
            <ArrowLeft size={18} /> {lang === 'vi' ? 'Trở lại bài học' : 'Back to Lesson'}
          </button>
          <button className="btn-secondary" onClick={() => { onClearMistakes(); onBackToDashboard(); }}>
            <Home size={18} /> {t.backToTopics}
          </button>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, remainingQuestions.length - 1);
  const currentQ = remainingQuestions[safeIndex];

  const tempGame = {
    id: currentQ.id,
    type: currentQ.gameType,
    instruction: currentQ.gameInstruction,
    items: [currentQ.rawItem],
  };

  const handleCompleted = (isCorrect: boolean) => {
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setResolvedIds((prev) => [...prev, currentQ.id]);
    }
  };

  const handleNext = () => {
    if (!lastAnswerCorrect) {
      // If student got it wrong, move to next question in remaining
      setCurrentIndex((prev) => (prev + 1) % remainingQuestions.length);
    } else {
      // If student resolved it, remaining Questions shrinks by 1. Keep currentIndex within bounds.
      const newRemainingCount = remainingQuestions.length - 1;
      if (newRemainingCount > 0) {
        setCurrentIndex((prev) => prev % newRemainingCount);
      }
    }
  };

  return (
    <div className="game-container-layout">
      <div className="game-header-bar">
        <button className="btn-icon" onClick={onBack} title={t.backToTopics}>
          <ArrowLeft size={20} />
        </button>

        <div className="header-info">
          <h2 className="lesson-header-title">{t.reviewMistakes}</h2>
        </div>

        <button className="btn-secondary-small" onClick={onClearMistakes}>
          <RefreshCw size={14} /> {t.clearAll}
        </button>
      </div>

      <div className="engine-viewport mt-4">
        {currentQ.gameType === 'cloze' && (
          <ClozeEngine
            key={`review-${currentQ.id}`}
            game={tempGame}
            onItemCompleted={handleCompleted}
            onGameFinished={handleNext}
          />
        )}
        {currentQ.gameType === 'matching' && (
          <MatchingEngine
            key={`review-${currentQ.id}`}
            game={tempGame}
            onItemCompleted={handleCompleted}
            onGameFinished={handleNext}
          />
        )}
        {currentQ.gameType === 'sentence_builder' && (
          <SentenceBuilderEngine
            key={`review-${currentQ.id}`}
            game={tempGame}
            onItemCompleted={handleCompleted}
            onGameFinished={handleNext}
          />
        )}
        {currentQ.gameType === 'error_spotter' && (
          <ErrorSpotterEngine
            key={`review-${currentQ.id}`}
            game={tempGame}
            onItemCompleted={handleCompleted}
            onGameFinished={handleNext}
          />
        )}
        {currentQ.gameType === 'word_scramble' && (
          <WordScrambleEngine
            key={`review-${currentQ.id}`}
            game={tempGame}
            onItemCompleted={handleCompleted}
            onGameFinished={handleNext}
          />
        )}
      </div>
    </div>
  );
};
