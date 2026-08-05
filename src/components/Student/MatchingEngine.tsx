import React, { useState, useEffect } from 'react';
import type { Game, MatchingPair } from '../../types/lesson';
import { parseMatchingItems, shuffleArray } from '../../utils/parsers';
import { CheckCircle2 } from 'lucide-react';

interface MatchingEngineProps {
  game: Game;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
}

export const MatchingEngine: React.FC<MatchingEngineProps> = ({
  game,
  onItemCompleted,
  onGameFinished,
}) => {
  const [pairs, setPairs] = useState<MatchingPair[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mismatch, setMismatch] = useState<boolean>(false);
  const [mismatchedLeft, setMismatchedLeft] = useState<string | null>(null);
  const [mismatchedRight, setMismatchedRight] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const parsedPairs = parseMatchingItems(game.items);
    setPairs(parsedPairs);
    const rights = parsedPairs.map((p) => ({ id: p.id, text: p.right }));
    setRightItems(shuffleArray(rights));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds([]);
    setAttempts(0);
    setIsFinished(false);
  }, [game]);

  const handleLeftClick = (pairId: string) => {
    if (matchedIds.includes(pairId) || mismatch || isFinished) return;
    setSelectedLeft(pairId);
    if (selectedRight) {
      checkMatch(pairId, selectedRight);
    }
  };

  const handleRightClick = (pairId: string) => {
    if (matchedIds.includes(pairId) || mismatch || isFinished) return;
    setSelectedRight(pairId);
    if (selectedLeft) {
      checkMatch(selectedLeft, pairId);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    setAttempts((prev) => prev + 1);
    if (leftId === rightId) {
      // Match found!
      const newMatched = [...matchedIds, leftId];
      setMatchedIds(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (newMatched.length === pairs.length) {
        setIsFinished(true);
        const cleanSuccess = attempts <= pairs.length;
        onItemCompleted(cleanSuccess);
      }
    } else {
      // Mismatch!
      setMismatch(true);
      setMismatchedLeft(leftId);
      setMismatchedRight(rightId);
      setTimeout(() => {
        setMismatch(false);
        setMismatchedLeft(null);
        setMismatchedRight(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleNext = () => {
    onGameFinished();
  };

  return (
    <div className="game-card shadow-lg animate-fade-in">
      <div className="game-item-header">
        <span className="step-badge">Matching Exercise</span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      <div className="matching-grid">
        {/* Left Column */}
        <div className="matching-column">
          <div className="column-header">Terms</div>
          {pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedLeft === p.id;
            const isMismatched = mismatchedLeft === p.id;

            return (
              <button
                key={`left-${p.id}`}
                onClick={() => handleLeftClick(p.id)}
                disabled={isMatched || isFinished}
                className={`matching-card ${
                  isMatched
                    ? 'matched'
                    : isMismatched
                    ? 'mismatched shake'
                    : isSelected
                    ? 'selected'
                    : ''
                }`}
              >
                {p.left}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="matching-column">
          <div className="column-header">Meanings</div>
          {rightItems.map((r) => {
            const isMatched = matchedIds.includes(r.id);
            const isSelected = selectedRight === r.id;
            const isMismatched = mismatchedRight === r.id;

            return (
              <button
                key={`right-${r.id}`}
                onClick={() => handleRightClick(r.id)}
                disabled={isMatched || isFinished}
                className={`matching-card ${
                  isMatched
                    ? 'matched'
                    : isMismatched
                    ? 'mismatched shake'
                    : isSelected
                    ? 'selected'
                    : ''
                }`}
              >
                {r.text}
              </button>
            );
          })}
        </div>
      </div>

      {isFinished && (
        <div className="feedback-banner success animate-slide-up mt-4">
          <div className="feedback-content">
            <CheckCircle2 size={24} />
            <div>
              <p className="feedback-title">All pairs matched!</p>
              <p className="feedback-detail">Total attempts: {attempts}</p>
            </div>
          </div>
        </div>
      )}

      <div className="game-actions mt-4">
        {isFinished && (
          <button className="btn-primary" onClick={handleNext}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
