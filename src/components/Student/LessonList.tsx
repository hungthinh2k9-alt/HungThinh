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
      <div className="hero-banner shadow-sm">
        <div className="hero-content">
          <h1 className="hero-title">Học Tiếng Anh Tương Tác</h1>
          <p className="hero-subtitle">
            Luyện tập từ vựng, ngữ pháp và cấu trúc câu thông qua các bài tập tương tác sinh động.
          </p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="filter-bar mt-6">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề, từ khóa bài học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="lessons-count-tag">
          {filteredLessons.length} {filteredLessons.length === 1 ? 'Chủ đề' : 'Chủ đề'}
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
                <span className="category-pill">{lesson.category || 'Bài học Tiếng Anh'}</span>
                {isCompleted && (
                  <span className="completed-pill">
                    <CheckCircle2 size={14} /> Đã hoàn thành
                  </span>
                )}
              </div>

              <h3 className="lesson-card-title">{lesson.title}</h3>
              <p className="lesson-card-description">{lesson.description}</p>

              <div className="lesson-meta-row">
                <span className="meta-item">
                  <Layers size={14} /> {lesson.games.length} Bài tập
                </span>
                {stats && (
                  <>
                    <span className="meta-item">
                      <Trophy size={14} /> Điểm cao: {stats.highScore}
                    </span>
                    <span className="meta-item">
                      <Clock size={14} /> {Math.floor(stats.bestTimeSeconds / 60)}m {stats.bestTimeSeconds % 60}s
                    </span>
                  </>
                )}
              </div>

              <div className="game-types-tags mt-3">
                {lesson.games.map((g, idx) => (
                  <span key={idx} className={`game-type-tag ${g.type}`}>
                    {g.type === 'cloze' && 'Điền từ'}
                    {g.type === 'matching' && 'Nối từ'}
                    {g.type === 'sentence_builder' && 'Xếp câu'}
                    {g.type === 'error_spotter' && 'Sửa lỗi'}
                    {g.type === 'word_scramble' && 'Xếp chữ'}
                  </span>
                ))}
              </div>

              <div className="lesson-card-footer mt-4">
                <button
                  className="btn-primary full-width"
                  onClick={() => onSelectLesson(lesson)}
                >
                  <Play size={16} /> Bắt đầu học
                </button>
              </div>
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="empty-state-box">
            <BookOpen size={44} className="empty-icon" />
            <p>Không tìm thấy bài học nào phù hợp với từ khóa.</p>
          </div>
        )}
      </div>
    </div>
  );
};
