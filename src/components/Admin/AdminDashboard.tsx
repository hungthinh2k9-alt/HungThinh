import React, { useState } from 'react';
import type { Lesson } from '../../types/lesson';
import { LessonEditor } from './LessonEditor';
import { JsonImportExportModal } from './JsonImportExportModal';
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  FileCode,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { saveStoredLessons, resetAllStorage } from '../../utils/storage';

interface AdminDashboardProps {
  lessons: Lesson[];
  onLessonsUpdated: (updatedLessons: Lesson[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lessons,
  onLessonsUpdated,
}) => {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const handleCreateNewLesson = () => {
    const newLesson: Lesson = {
      lesson_id: `topic-0${lessons.length + 1}`,
      title: 'New Custom Topic',
      description: 'Master new English concepts with interactive games.',
      category: 'General English',
      games: [
        {
          id: `g1-${Date.now()}`,
          type: 'cloze',
          instruction: 'Fill in the missing words.',
          items: ['She is feeling very [happy|vui vẻ] today.'],
        },
      ],
    };
    setEditingLesson(newLesson);
  };

  const handleSaveLesson = (savedLesson: Lesson) => {
    const existingIndex = lessons.findIndex(
      (l) => l.lesson_id === savedLesson.lesson_id
    );
    let updated: Lesson[];
    if (existingIndex !== -1) {
      updated = [...lessons];
      updated[existingIndex] = savedLesson;
    } else {
      updated = [...lessons, savedLesson];
    }
    saveStoredLessons(updated);
    onLessonsUpdated(updated);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      const updated = lessons.filter((l) => l.lesson_id !== lessonId);
      saveStoredLessons(updated);
      onLessonsUpdated(updated);
    }
  };

  const handleDuplicateLesson = (lesson: Lesson) => {
    const duplicated: Lesson = {
      ...lesson,
      lesson_id: `${lesson.lesson_id}-copy-${Date.now()}`,
      title: `${lesson.title} (Copy)`,
    };
    const updated = [...lessons, duplicated];
    saveStoredLessons(updated);
    onLessonsUpdated(updated);
  };

  const handleMoveLesson = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const updated = [...lessons];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    saveStoredLessons(updated);
    onLessonsUpdated(updated);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all lessons to default seed data? Custom edits will be restored to original specs.')) {
      resetAllStorage();
      window.location.reload();
    }
  };

  const handleApplyJsonImport = (importedLessons: Lesson[]) => {
    saveStoredLessons(importedLessons);
    onLessonsUpdated(importedLessons);
    setShowJsonModal(false);
  };

  if (editingLesson) {
    return (
      <LessonEditor
        lesson={editingLesson}
        onSave={handleSaveLesson}
        onCancel={() => setEditingLesson(null)}
      />
    );
  }

  return (
    <div className="admin-dashboard-container animate-fade-in">
      <div className="admin-header-banner shadow-md">
        <div>
          <h1 className="admin-title">Teacher Admin CMS Panel</h1>
          <p className="admin-subtitle">
            100% data-driven lesson & game engine control panel. Edit rules, text, game types, and JSON directly.
          </p>
        </div>

        <div className="admin-header-actions">
          <button className="btn-secondary" onClick={() => setShowJsonModal(true)}>
            <FileCode size={18} /> JSON Import/Export
          </button>
          <button className="btn-primary" onClick={handleCreateNewLesson}>
            <Plus size={18} /> Create Lesson
          </button>
        </div>
      </div>

      <div className="admin-lessons-list mt-6 shadow-sm">
        <div className="table-header-row">
          <span>Topic Title & Info</span>
          <span>Category</span>
          <span>Games Count</span>
          <span>Actions</span>
        </div>

        {lessons.map((lesson, idx) => (
          <div key={lesson.lesson_id} className="table-data-row">
            <div className="lesson-info-cell">
              <span className="lesson-id-tag">{lesson.lesson_id}</span>
              <h4 className="lesson-row-title">{lesson.title}</h4>
              <p className="lesson-row-desc">{lesson.description}</p>
            </div>

            <div className="lesson-category-cell">
              <span className="category-pill-small">
                {lesson.category || 'General'}
              </span>
            </div>

            <div className="lesson-games-count-cell">
              <span className="count-badge">{lesson.games.length} Games</span>
              <div className="game-types-micro mt-1">
                {lesson.games.map((g) => g.type.charAt(0).toUpperCase()).join(' • ')}
              </div>
            </div>

            <div className="lesson-actions-cell">
              <button
                className="btn-icon-action"
                onClick={() => setEditingLesson(lesson)}
                title="Edit Lesson & Games"
              >
                <Edit3 size={16} /> Edit
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleDuplicateLesson(lesson)}
                title="Duplicate Lesson"
              >
                <Copy size={16} />
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleMoveLesson(idx, 'up')}
                disabled={idx === 0}
                title="Move Up"
              >
                <ArrowUp size={16} />
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleMoveLesson(idx, 'down')}
                disabled={idx === lessons.length - 1}
                title="Move Down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                className="btn-icon-action danger"
                onClick={() => handleDeleteLesson(lesson.lesson_id)}
                title="Delete Lesson"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="empty-state-box">
            <BookOpen size={48} className="empty-icon" />
            <p>No lessons configured yet. Click 'Create Lesson' to add one!</p>
          </div>
        )}
      </div>

      <div className="admin-footer-row mt-6">
        <button className="btn-text-danger" onClick={handleResetToDefault}>
          <RotateCcw size={14} /> Reset Storage to Sample Seed Lessons
        </button>
      </div>

      {showJsonModal && (
        <JsonImportExportModal
          initialData={lessons}
          onImport={handleApplyJsonImport}
          onClose={() => setShowJsonModal(false)}
        />
      )}
    </div>
  );
};
