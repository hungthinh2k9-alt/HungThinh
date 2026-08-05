import React, { useEffect } from 'react';
import type { Lesson } from '../../types/lesson';
import { Trophy, Flame, Clock, Award, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';

interface LessonSummaryProps {
  lesson: Lesson;
  lang: Language;
  score: number;
  maxStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSeconds: number;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({
  lesson,
  lang,
  score,
  maxStreak,
  totalQuestions,
  correctAnswers,
  timeSeconds,
  onRestart,
  onBackToDashboard,
}) => {
  const t = translations[lang];
  const accuracyPercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="summary-card shadow-xl animate-scale-up">
      <div className="summary-header">
        <div className="trophy-badge animate-bounce-subtle">
          <Trophy size={48} className="text-yellow-400" />
        </div>
        <h2 className="summary-title">{t.lessonCompleted}</h2>
        <p className="summary-subtitle">{lesson.title}</p>
      </div>

      <div className="summary-stats-grid">
        <div className="stat-box">
          <Award size={24} className="stat-icon score-color" />
          <div className="stat-value">{score}</div>
          <div className="stat-label">{t.totalScore}</div>
        </div>

        <div className="stat-box">
          <Trophy size={24} className="stat-icon accuracy-color" />
          <div className="stat-value">{accuracyPercent}%</div>
          <div className="stat-label">{t.accuracy} ({correctAnswers}/{totalQuestions})</div>
        </div>

        <div className="stat-box">
          <Flame size={24} className="stat-icon streak-color" />
          <div className="stat-value">{maxStreak}🔥</div>
          <div className="stat-label">{t.peakStreak}</div>
        </div>

        <div className="stat-box">
          <Clock size={24} className="stat-icon time-color" />
          <div className="stat-value">{formatTime(timeSeconds)}</div>
          <div className="stat-label">{t.completionTime}</div>
        </div>
      </div>

      <div className="summary-actions">
        <button className="btn-secondary" onClick={onRestart}>
          <RotateCcw size={18} /> {t.tryAgain}
        </button>
        <button className="btn-primary" onClick={onBackToDashboard}>
          <Home size={18} /> {t.backToTopics}
        </button>
      </div>
    </div>
  );
};
