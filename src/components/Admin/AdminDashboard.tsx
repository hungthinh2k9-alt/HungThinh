import React, { useState } from 'react';
import type { Lesson } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { LessonEditor } from './LessonEditor';
import { JsonImportExportModal } from './JsonImportExportModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  FileCode,
  BookOpen,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { saveSingleStoredLesson, deleteStoredLesson, saveStoredLessons } from '../../utils/storage';

interface AdminDashboardProps {
  lessons: Lesson[];
  lang: Language;
  onLessonsUpdated: (updatedLessons: Lesson[]) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lessons,
  lang,
  onLessonsUpdated,
  onLogout,
}) => {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const t = translations[lang];

  const handleCreateNewLesson = () => {
    const newLesson: Lesson = {
      lesson_id: `topic-${Date.now().toString().slice(-4)}`,
      title: lang === 'vi' ? 'Chủ đề mới' : 'New Custom Topic',
      description: lang === 'vi' ? 'Nhập nội dung bài tập...' : 'Enter exercise description...',
      category: lang === 'vi' ? 'Từ vựng & Ngữ pháp' : 'Grammar & Vocabulary',
      games: [
        {
          id: `g1-${Date.now()}`,
          type: 'cloze',
          instruction: lang === 'vi' ? 'Điền từ thích hợp vào chỗ trống.' : 'Fill in the missing words.',
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

    saveSingleStoredLesson(savedLesson);
    onLessonsUpdated(updated);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm(t.confirmDelete)) {
      const updated = lessons.filter((l) => l.lesson_id !== lessonId);
      deleteStoredLesson(lessonId);
      onLessonsUpdated(updated);
    }
  };

  const handleDuplicateLesson = (lesson: Lesson) => {
    const duplicated: Lesson = {
      ...lesson,
      lesson_id: `${lesson.lesson_id}-copy-${Date.now().toString().slice(-4)}`,
      title: `${lesson.title} (${lang === 'vi' ? 'Bản sao' : 'Copy'})`,
    };
    saveSingleStoredLesson(duplicated);
    onLessonsUpdated([...lessons, duplicated]);
  };

  const handleMoveLesson = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const updated = [...lessons];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    saveStoredLessons(updated);
    onLessonsUpdated(updated);
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
      <div className="admin-header-banner shadow-sm">
        <div>
          <h1 className="admin-title">{t.adminTitle}</h1>
          <p className="admin-subtitle">{t.adminSubtitle}</p>
        </div>

        <div className="admin-header-actions flex-wrap">
          <button className="btn-secondary-small" onClick={() => setShowPasswordModal(true)}>
            <KeyRound size={16} /> {t.changePassword}
          </button>
          <button className="btn-secondary-small danger" onClick={onLogout}>
            <LogOut size={16} /> {t.logOut}
          </button>
          <button className="btn-secondary-small" onClick={() => setShowJsonModal(true)}>
            <FileCode size={16} /> {t.jsonImportExport}
          </button>
          <button className="btn-primary" onClick={handleCreateNewLesson}>
            <Plus size={16} /> {t.createLesson}
          </button>
        </div>
      </div>

      <div className="admin-lessons-list mt-6 shadow-sm">
        <div className="table-header-row">
          <span>{t.topicTitle}</span>
          <span>{t.category}</span>
          <span>{t.gamesCount}</span>
          <span>{t.actions}</span>
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
              <span className="count-badge">{lesson.games.length} {t.gamesCount}</span>
            </div>

            <div className="lesson-actions-cell">
              <button
                className="btn-icon-action"
                onClick={() => setEditingLesson(lesson)}
                title={t.edit}
              >
                <Edit3 size={15} /> {t.edit}
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleDuplicateLesson(lesson)}
                title={t.copy}
              >
                <Copy size={15} /> {t.copy}
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleMoveLesson(idx, 'up')}
                disabled={idx === 0}
                title={t.moveUp}
              >
                <ArrowUp size={15} />
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleMoveLesson(idx, 'down')}
                disabled={idx === lessons.length - 1}
                title={t.moveDown}
              >
                <ArrowDown size={15} />
              </button>
              <button
                className="btn-icon-action danger"
                onClick={() => handleDeleteLesson(lesson.lesson_id)}
                title={t.delete}
              >
                <Trash2 size={15} /> {t.delete}
              </button>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="empty-state-box">
            <BookOpen size={44} className="empty-icon" />
            <p>{t.noTopicsFound}</p>
          </div>
        )}
      </div>

      {showJsonModal && (
        <JsonImportExportModal
          initialData={lessons}
          onImport={handleApplyJsonImport}
          onClose={() => setShowJsonModal(false)}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          lang={lang}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};
