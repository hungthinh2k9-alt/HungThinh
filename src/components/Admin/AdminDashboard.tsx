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
  BookOpen,
} from 'lucide-react';
import { saveSingleStoredLesson, deleteStoredLesson, saveStoredLessons } from '../../utils/storage';

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
      lesson_id: `topic-${Date.now().toString().slice(-4)}`,
      title: 'Chủ đề mới',
      description: 'Nhập nội dung và bài tập cho chủ đề này...',
      category: 'Từ vựng & Ngữ pháp',
      games: [
        {
          id: `g1-${Date.now()}`,
          type: 'cloze',
          instruction: 'Điền từ thích hợp vào chỗ trống.',
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
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này không?')) {
      const updated = lessons.filter((l) => l.lesson_id !== lessonId);
      deleteStoredLesson(lessonId);
      onLessonsUpdated(updated);
    }
  };

  const handleDuplicateLesson = (lesson: Lesson) => {
    const duplicated: Lesson = {
      ...lesson,
      lesson_id: `${lesson.lesson_id}-copy-${Date.now().toString().slice(-4)}`,
      title: `${lesson.title} (Bản sao)`,
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
          <h1 className="admin-title">Bảng Quản Lý Bài Học</h1>
          <p className="admin-subtitle">
            Tạo mới, chỉnh sửa bài tập và quản lý danh sách các chủ đề học tập cho học sinh.
          </p>
        </div>

        <div className="admin-header-actions">
          <button className="btn-secondary" onClick={() => setShowJsonModal(true)}>
            <FileCode size={18} /> Nhập / Xuất JSON
          </button>
          <button className="btn-primary" onClick={handleCreateNewLesson}>
            <Plus size={18} /> Tạo bài học mới
          </button>
        </div>
      </div>

      <div className="admin-lessons-list mt-6 shadow-sm">
        <div className="table-header-row">
          <span>Tên chủ đề</span>
          <span>Phân loại</span>
          <span>Số trò chơi</span>
          <span>Thao tác</span>
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
                {lesson.category || 'Chung'}
              </span>
            </div>

            <div className="lesson-games-count-cell">
              <span className="count-badge">{lesson.games.length} Trò chơi</span>
            </div>

            <div className="lesson-actions-cell">
              <button
                className="btn-icon-action"
                onClick={() => setEditingLesson(lesson)}
                title="Chỉnh sửa bài học"
              >
                <Edit3 size={15} /> Sửa
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleDuplicateLesson(lesson)}
                title="Nhân bản bài học"
              >
                <Copy size={15} /> Sao chép
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleMoveLesson(idx, 'up')}
                disabled={idx === 0}
                title="Di chuyển lên"
              >
                <ArrowUp size={15} />
              </button>
              <button
                className="btn-icon-action"
                onClick={() => handleMoveLesson(idx, 'down')}
                disabled={idx === lessons.length - 1}
                title="Di chuyển xuống"
              >
                <ArrowDown size={15} />
              </button>
              <button
                className="btn-icon-action danger"
                onClick={() => handleDeleteLesson(lesson.lesson_id)}
                title="Xóa bài học"
              >
                <Trash2 size={15} /> Xóa
              </button>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="empty-state-box">
            <BookOpen size={44} className="empty-icon" />
            <p>Chưa có bài học nào. Bấm 'Tạo bài học mới' để bắt đầu!</p>
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
    </div>
  );
};
