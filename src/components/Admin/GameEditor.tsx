import React, { useState } from 'react';
import type { Game, GameType } from '../../types/lesson';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, HelpCircle, X } from 'lucide-react';
import { ClozeEngine } from '../Student/ClozeEngine';
import { MatchingEngine } from '../Student/MatchingEngine';
import { SentenceBuilderEngine } from '../Student/SentenceBuilderEngine';
import { ErrorSpotterEngine } from '../Student/ErrorSpotterEngine';
import { WordScrambleEngine } from '../Student/WordScrambleEngine';

interface GameEditorProps {
  game: Game;
  onChange: (updatedGame: Game) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  gameIndex: number;
  totalGames: number;
}

const GAME_SYNTAX_GUIDES: Record<GameType, { label: string; placeholder: string; example: string }> = {
  cloze: {
    label: 'Cloze Test Syntax',
    placeholder: 'Full mask: [word|hint] or Partial mask: p[ar]tial',
    example: 'She is feeling very [happy|vui vẻ] today.\nThey h[av]e breakfast at 7 AM.',
  },
  matching: {
    label: 'Matching Pair Syntax',
    placeholder: 'Term => Meaning',
    example: 'Always => Luôn luôn\nUsually => Thường xuyên\nNever => Không bao giờ',
  },
  sentence_builder: {
    label: 'Sentence Builder Syntax',
    placeholder: 'Block 1 | Block 2 | Block 3',
    example: 'She | usually gets up | early in the morning.\nThey | do not like | fast food.',
  },
  error_spotter: {
    label: 'Error Spotter Syntax',
    placeholder: 'Prefix [wrong_word -> correct_word] Suffix',
    example: 'She [go -> goes] to school every day.\nThey [is -> are] watching a match.',
  },
  word_scramble: {
    label: 'Word Scramble Syntax',
    placeholder: 'word or word|hint',
    example: 'beautiful|Very pleasing to look at\nchallenge|A demanding task',
  },
};

export const GameEditor: React.FC<GameEditorProps> = ({
  game,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  gameIndex,
  totalGames,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleTypeChange = (newType: GameType) => {
    onChange({
      ...game,
      type: newType,
    });
  };

  const handleInstructionChange = (instruction: string) => {
    onChange({
      ...game,
      instruction,
    });
  };

  const handleItemChange = (index: number, value: string) => {
    const updatedItems = [...game.items];
    updatedItems[index] = value;
    onChange({
      ...game,
      items: updatedItems,
    });
  };

  const handleAddItem = () => {
    onChange({
      ...game,
      items: [...game.items, ''],
    });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = game.items.filter((_, idx) => idx !== index);
    onChange({
      ...game,
      items: updatedItems,
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...game.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    [newItems[index], newItems[targetIdx]] = [newItems[targetIdx], newItems[index]];
    onChange({
      ...game,
      items: newItems,
    });
  };

  const syntaxInfo = GAME_SYNTAX_GUIDES[game.type];

  return (
    <div className="game-editor-card shadow-md">
      <div className="game-editor-header">
        <div className="flex items-center gap-2">
          <span className="game-number-badge">Game #{gameIndex + 1}</span>
          <select
            value={game.type}
            onChange={(e) => handleTypeChange(e.target.value as GameType)}
            className="game-type-select"
          >
            <option value="cloze">Cloze Test</option>
            <option value="matching">Matching Pairs</option>
            <option value="sentence_builder">Sentence Builder</option>
            <option value="error_spotter">Error Spotter</option>
            <option value="word_scramble">Word Scramble</option>
          </select>
        </div>

        <div className="game-editor-controls">
          <button
            type="button"
            className="btn-icon-small"
            onClick={() => setShowPreview(true)}
            title="Live Preview Game"
          >
            <Eye size={16} /> Preview
          </button>
          {onMoveUp && (
            <button
              type="button"
              className="btn-icon-small"
              onClick={onMoveUp}
              disabled={gameIndex === 0}
              title="Move Up"
            >
              <ArrowUp size={16} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              className="btn-icon-small"
              onClick={onMoveDown}
              disabled={gameIndex === totalGames - 1}
              title="Move Down"
            >
              <ArrowDown size={16} />
            </button>
          )}
          <button
            type="button"
            className="btn-icon-small danger"
            onClick={onDelete}
            title="Delete Game"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Instruction Text for Student:</label>
        <input
          type="text"
          value={game.instruction}
          onChange={(e) => handleInstructionChange(e.target.value)}
          placeholder="e.g. Fill in the missing letters or words."
          className="form-input"
        />
      </div>

      <div className="syntax-helper-box mt-3">
        <div className="syntax-title">
          <HelpCircle size={15} /> {syntaxInfo.label}
        </div>
        <p className="syntax-desc">{syntaxInfo.placeholder}</p>
        <pre className="syntax-example">{syntaxInfo.example}</pre>
      </div>

      <div className="items-list-container mt-4">
        <div className="items-list-header">
          <label className="form-label">Game Items ({game.items.length}):</label>
          <button type="button" className="btn-text-small" onClick={handleAddItem}>
            <Plus size={14} /> Add Item
          </button>
        </div>

        {game.items.map((item, idx) => (
          <div key={`item-${idx}`} className="item-row mt-2">
            <span className="item-index">{idx + 1}.</span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              placeholder={syntaxInfo.placeholder}
              className="form-input flex-1"
            />
            <div className="item-row-actions">
              <button
                type="button"
                className="btn-icon-tiny"
                onClick={() => handleMoveItem(idx, 'up')}
                disabled={idx === 0}
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                className="btn-icon-tiny"
                onClick={() => handleMoveItem(idx, 'down')}
                disabled={idx === game.items.length - 1}
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                className="btn-icon-tiny danger"
                onClick={() => handleDeleteItem(idx)}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="modal-backdrop">
          <div className="modal-content large shadow-2xl">
            <div className="modal-header">
              <h3>Live Game Preview</h3>
              <button className="btn-icon" onClick={() => setShowPreview(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {game.type === 'cloze' && (
                <ClozeEngine
                  game={game}
                  onItemCompleted={() => {}}
                  onGameFinished={() => setShowPreview(false)}
                />
              )}
              {game.type === 'matching' && (
                <MatchingEngine
                  game={game}
                  onItemCompleted={() => {}}
                  onGameFinished={() => setShowPreview(false)}
                />
              )}
              {game.type === 'sentence_builder' && (
                <SentenceBuilderEngine
                  game={game}
                  onItemCompleted={() => {}}
                  onGameFinished={() => setShowPreview(false)}
                />
              )}
              {game.type === 'error_spotter' && (
                <ErrorSpotterEngine
                  game={game}
                  onItemCompleted={() => {}}
                  onGameFinished={() => setShowPreview(false)}
                />
              )}
              {game.type === 'word_scramble' && (
                <WordScrambleEngine
                  game={game}
                  onItemCompleted={() => {}}
                  onGameFinished={() => setShowPreview(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
