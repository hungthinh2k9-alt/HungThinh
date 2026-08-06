import React, { useState } from 'react';
import type { Lesson } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { getStoredProgress } from '../../utils/storage';
import { Play, Search, Trophy, CheckCircle2, Clock, Layers, Star } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  lang: Language;
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  lang,
  onSelectLesson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const progressData = getStoredProgress();
  const t = translations[lang];

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.category && l.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="hero-banner shadow-sm">
        <div className="hero-content">
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="filter-bar mt-6">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="lessons-count-tag">
          {filteredLessons.length} {t.topicsAvailable}
        </div>
      </div>

      {/* Lesson Grid */}
      <div className="lessons-grid mt-6">
        {filteredLessons.map((lesson) => {
          const stats = progressData.completedLessons[lesson.lesson_id];
          const isCompleted = !!stats;
          const starsCount = stats?.stars || 0;

          return (
            <div key={lesson.lesson_id} className="lesson-card topic-purple-card shadow-sm">
              <div className="lesson-card-header">
                <span className="category-pill">{lesson.category || 'English Topic'}</span>
                {isCompleted && (
                  <div className="flex items-center gap-1">
                    <span className="completed-pill green-check-badge">
                      <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-100" /> {t.completed}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="lesson-card-title">{lesson.title}</h3>
              <p className="lesson-card-description">{lesson.description}</p>

              {isCompleted && starsCount > 0 && (
                <div className="stars-rating-bar mt-2 mb-2">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span>{starsCount} / 10 {t.starsLabel}</span>
                  </div>
                </div>
              )}

              <div className="lesson-meta-row">
                <span className="meta-item">
                  <Layers size={14} /> {lesson.games.length} {t.gamesCount}
                </span>
                {stats && (
                  <>
                    <span className="meta-item">
                      <Trophy size={14} /> {t.highScore}: {stats.highScore}
                    </span>
                    <span className="meta-item">
                      <Clock size={14} /> {Math.floor(stats.bestTimeSeconds / 60)}m {stats.bestTimeSeconds % 60}s
                    </span>
                  </>
                )}
              </div>

              <div className="game-types-tags mt-3">
                {lesson.games.map((g, idx) => (
                  <span key={idx} className="game-type-tag">
                    {g.type === 'cloze' && t.clozeLabel}
                    {g.type === 'matching' && t.matchingLabel}
                    {g.type === 'sentence_builder' && t.sentenceLabel}
                    {g.type === 'error_spotter' && t.errorSpotterLabel}
                    {g.type === 'word_scramble' && t.wordScrambleLabel}
                  </span>
                ))}
              </div>

              <div className="lesson-card-footer mt-4">
                <button
                  className="btn-primary full-width play-btn-bounce"
                  onClick={() => onSelectLesson(lesson)}
                >
                  <Play size={18} className="fill-current" /> {t.startLearning}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
