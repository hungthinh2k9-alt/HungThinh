import React, { useState } from 'react';
import type { Lesson } from '../../types/lesson';
import { getStoredProgress } from '../../utils/storage';
import { BookOpen, Play, Search, Trophy, CheckCircle2, Clock, Layers } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  onSelectLesson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const progressData = getStoredProgress();

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.category && l.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="hero-banner shadow-lg">
        <div className="hero-content">
          <h1 className="hero-title">Master English Text Games</h1>
          <p className="hero-subtitle">
            Interactive cloze tests, sentence builders, matching pairs, and error spotters. Zero fluff, 100% dynamic learning.
          </p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="filter-bar mt-6">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search topics, grammar rules, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="lessons-count-tag">
          {filteredLessons.length} {filteredLessons.length === 1 ? 'Topic' : 'Topics'} Available
        </div>
      </div>

      {/* Lesson Grid */}
      <div className="lessons-grid mt-6">
        {filteredLessons.map((lesson) => {
          const stats = progressData.completedLessons[lesson.lesson_id];
          const isCompleted = !!stats;

          return (
            <div key={lesson.lesson_id} className="lesson-card shadow-md">
              <div className="lesson-card-header">
                <span className="category-pill">{lesson.category || 'English Lesson'}</span>
                {isCompleted && (
                  <span className="completed-pill">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>

              <h3 className="lesson-card-title">{lesson.title}</h3>
              <p className="lesson-card-description">{lesson.description}</p>

              <div className="lesson-meta-row">
                <span className="meta-item">
                  <Layers size={14} /> {lesson.games.length} Interactive Games
                </span>
                {stats && (
                  <>
                    <span className="meta-item">
                      <Trophy size={14} /> High: {stats.highScore}
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
                    {g.type.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="lesson-card-footer mt-4">
                <button
                  className="btn-primary full-width"
                  onClick={() => onSelectLesson(lesson)}
                >
                  <Play size={16} /> Start Learning
                </button>
              </div>
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="empty-state-box">
            <BookOpen size={48} className="empty-icon" />
            <p>No topics match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
