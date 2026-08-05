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
      instruction: 'Fill in the missing fields correctly.',
      items: ['Sample item [target]'],
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
      setErrorMsg('Lesson ID is required.');
      return;
    }
    if (!lesson.title.trim()) {
      setErrorMsg('Lesson Title is required.');
      return;
    }
    if (lesson.games.length === 0) {
      setErrorMsg('At least one game is required in the lesson.');
      return;
    }

    setErrorMsg(null);
    onSave(lesson);
  };

  return (
    <div className="lesson-editor-container animate-fade-in">
      <div className="admin-editor-header shadow-sm">
        <button className="btn-secondary" onClick={onCancel}>
          <ArrowLeft size={18} /> Back to CMS
        </button>
        <h2 className="editor-title">
          {initialLesson.lesson_id ? 'Edit Lesson' : 'Create New Lesson'}
        </h2>
        <button className="btn-primary" onClick={handleSaveClick}>
          <Save size={18} /> Save Lesson
        </button>
      </div>

      {errorMsg && (
        <div className="alert-banner error mt-4">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lesson Metadata Form */}
      <div className="metadata-card shadow-md mt-4">
        <h3 className="card-section-title">Lesson Information</h3>
        <div className="grid-2-cols mt-3">
          <div className="form-group">
            <label className="form-label">Lesson ID (slug):</label>
            <input
              type="text"
              value={lesson.lesson_id}
              onChange={(e) => handleFieldChange('lesson_id', e.target.value)}
              placeholder="e.g. topic-01"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category / Module:</label>
            <input
              type="text"
              value={lesson.category || ''}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              placeholder="e.g. Grammar & Vocabulary"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group mt-3">
          <label className="form-label">Title:</label>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="e.g. Simple Present & Daily Routines"
            className="form-input"
          />
        </div>

        <div className="form-group mt-3">
          <label className="form-label">Description:</label>
          <textarea
            value={lesson.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="A short overview of what students will learn in this topic..."
            rows={2}
            className="form-textarea"
          />
        </div>
      </div>

      {/* Games List Builder */}
      <div className="games-builder-section mt-6">
        <div className="section-header">
          <h3>Interactive Games Builder ({lesson.games.length})</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('cloze')}
            >
              <Plus size={14} /> Cloze
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('matching')}
            >
              <Plus size={14} /> Matching
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('sentence_builder')}
            >
              <Plus size={14} /> Sentence
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('error_spotter')}
            >
              <Plus size={14} /> Error Spotter
            </button>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => handleAddGame('word_scramble')}
            >
              <Plus size={14} /> Scramble
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
