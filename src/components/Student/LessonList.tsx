import React, { useState } from 'react';
import type { Lesson } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { getStoredProgress } from '../../utils/storage';
import { BookOpen, Play, Search, Trophy, CheckCircle2, Clock, Layers } from 'lucide-react';

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

          return (
            <div key={lesson.lesson_id} className="lesson-card shadow-sm">
              <div className="lesson-card-header">
                <span className="category-pill">{lesson.category || 'English Topic'}</span>
                {isCompleted && (
                  <span className="completed-pill">
                    <CheckCircle2 size={14} /> {t.completed}
                  </span>
                )}
              </div>

              <h3 className="lesson-card-title">{lesson.title}</h3>
              <p className="lesson-card-description">{lesson.description}</p>

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
                  className="btn-primary full-width"
                  onClick={() => onSelectLesson(lesson)}
                >
                  <Play size={16} /> {t.startLearning}
                </button>
              </div>
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="empty-state-box">
            <BookOpen size={44} className="empty-icon" />
            <p>{t.noTopicsFound}</p>
          </div>
        )}
      </div>
    </div>
  );
};
