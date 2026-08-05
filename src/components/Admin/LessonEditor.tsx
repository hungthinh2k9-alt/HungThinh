import React, { useState } from 'react';
import type { Lesson, Game, GameType } from '../../types/lesson';
import { GameEditor } from './GameEditor';
import { Save, ArrowLeft, Plus, AlertCircle } from 'lucide-react';

interface LessonEditorProps {
  lesson: Lesson;
  onSave: (savedLesson: Lesson) => void;
  onCancel: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  lesson: initialLesson,
  onSave,
  onCancel,
}) => {
  const [lesson, setLesson] = useState<Lesson>(initialLesson);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFieldChange = (field: keyof Lesson, value: string) => {
    setLesson((prev) => ({ ...prev, [field]: value }));
  };

  const handleGameChange = (index: number, updatedGame: Game) => {
    const updatedGames = [...lesson.games];
    updatedGames[index] = updatedGame;
    setLesson((prev) => ({ ...prev, games: updatedGames }));
  };

  const handleAddGame = (type: GameType = 'cloze') => {
    const newGame: Game = {
      id: `g-${Date.now()}`,
      type,
      instruction: 'Điền từ thích hợp vào chỗ trống.',
      items: ['She is feeling very [happy|vui vẻ] today.'],
    };
    setLesson((prev) => ({
      ...prev,
      games: [...prev.games, newGame],
    }));
  };

  const handleDeleteGame = (index: number) => {
    setLesson((prev) => ({
      ...prev,
      games: prev.games.filter((_, idx) => idx !== index),
    }));
  };

  const handleMoveGame = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= lesson.games.length) return;
    const newGames = [...lesson.games];
    [newGames[index], newGames[targetIdx]] = [newGames[targetIdx], newGames[index]];
    setLesson((prev) => ({ ...prev, games: newGames }));
  };

  const handleSaveClick = () => {
    if (!lesson.lesson_id.trim()) {
      setErrorMsg('Mã bài học không được để trống.');
      return;
    }
    if (!lesson.title.trim()) {
      setErrorMsg('Tiêu đề bài học không được để trống.');
      return;
    }
    if (lesson.games.length === 0) {
      setErrorMsg('Bài học phải có ít nhất 1 bài tập.');
      return;
    }

    setErrorMsg(null);
    onSave(lesson);
  };

  return (
    <div className="lesson-editor-container animate-fade-in">
      <div className="admin-editor-header shadow-sm">
        <button className="btn-secondary" onClick={onCancel}>
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>
        <h2 className="editor-title">
          {initialLesson.lesson_id ? 'Chỉnh Sửa Bài Học' : 'Tạo Bài Học Mới'}
        </h2>
        <button className="btn-primary" onClick={handleSaveClick}>
          <Save size={18} /> Lưu bài học
        </button>
      </div>

      {errorMsg && (
        <div className="alert-banner error mt-4">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lesson Metadata Form */}
      <div className="metadata-card shadow-sm mt-4">
        <h3 className="card-section-title">Thông tin bài học</h3>
        <div className="grid-2-cols mt-3">
          <div className="form-group">
            <label className="form-label">Mã bài học:</label>
            <input
              type="text"
              value={lesson.lesson_id}
              onChange={(e) => handleFieldChange('lesson_id', e.target.value)}
              placeholder="e.g. topic-01"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phân loại:</label>
            <input
              type="text"
              value={lesson.category || ''}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              placeholder="e.g. Từ vựng & Ngữ pháp"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group mt-3">
          <label className="form-label">Tiêu đề bài học:</label>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="e.g. Simple Present & Daily Routines"
            className="form-input"
          />
        </div>

        <div className="form-group mt-3">
          <label className="form-label">Mô tả ngắn:</label>
          <textarea
            value={lesson.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Mô tả nội dung bài học cho học sinh..."
            rows={2}
            className="form-textarea"
          />
        </div>
      </div>

      {/* Games List Builder */}
      <div className="games-builder-section mt-6">
        <div className="section-header">
          <h3>Danh sách bài tập ({lesson.games.length})</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('cloze')}
            >
              <Plus size={14} /> Điền từ
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('matching')}
            >
              <Plus size={14} /> Nối từ
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('sentence_builder')}
            >
              <Plus size={14} /> Xếp câu
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('error_spotter')}
            >
              <Plus size={14} /> Sửa lỗi
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('word_scramble')}
            >
              <Plus size={14} /> Xếp chữ
            </button>
          </div>
        </div>

        <div className="games-stack mt-4">
          {lesson.games.map((g, idx) => (
            <GameEditor
              key={`game-editor-${g.id || idx}`}
              game={g}
              onChange={(updated) => handleGameChange(idx, updated)}
              onDelete={() => handleDeleteGame(idx)}
              onMoveUp={() => handleMoveGame(idx, 'up')}
              onMoveDown={() => handleMoveGame(idx, 'down')}
              gameIndex={idx}
              totalGames={lesson.games.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
