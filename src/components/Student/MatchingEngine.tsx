import React, { useState, useEffect, useRef } from 'react';
import type { Game, MatchingPair } from '../../types/lesson';
import { parseMatchingItems, shuffleArray } from '../../utils/parsers';
import { CheckCircle2 } from 'lucide-react';

interface MatchingEngineProps {
  game: Game;
  onItemCompleted: (isCorrect: boolean) => void;
  onGameFinished: () => void;
  onPairCompleted?: (pairIndex: number, isCorrect: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

interface ConnectionLine {
  id: string;
  from: Point;
  to: Point;
  status: 'matched' | 'mismatched' | 'active';
}

export const MatchingEngine: React.FC<MatchingEngineProps> = ({
  game,
  onItemCompleted,
  onGameFinished,
  onPairCompleted,
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
  const [lines, setLines] = useState<ConnectionLine[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
    setLines([]);
  }, [game.id]);

  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: ConnectionLine[] = [];

    matchedIds.forEach((id) => {
      const leftEl = cardRefs.current[`left-${id}`];
      const rightEl = cardRefs.current[`right-${id}`];
      if (leftEl && rightEl) {
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();

        newLines.push({
          id: `line-${id}`,
          from: {
            x: lRect.right - containerRect.left,
            y: lRect.top + lRect.height / 2 - containerRect.top,
          },
          to: {
            x: rRect.left - containerRect.left,
            y: rRect.top + rRect.height / 2 - containerRect.top,
          },
          status: 'matched',
        });
      }
    });

    if (mismatchedLeft && mismatchedRight) {
      const leftEl = cardRefs.current[`left-${mismatchedLeft}`];
      const rightEl = cardRefs.current[`right-${mismatchedRight}`];
      if (leftEl && rightEl) {
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();

        newLines.push({
          id: 'line-mismatch',
          from: {
            x: lRect.right - containerRect.left,
            y: lRect.top + lRect.height / 2 - containerRect.top,
          },
          to: {
            x: rRect.left - containerRect.left,
            y: rRect.top + rRect.height / 2 - containerRect.top,
          },
          status: 'mismatched',
        });
      }
    }

    setLines(newLines);
  };

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [matchedIds, mismatchedLeft, mismatchedRight, selectedLeft, selectedRight]);

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
    const leftIndex = pairs.findIndex((p) => p.id === leftId);

    if (leftId === rightId) {
      const newMatched = [...matchedIds, leftId];
      setMatchedIds(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (onPairCompleted && leftIndex !== -1) {
        onPairCompleted(leftIndex, true);
      }

      if (newMatched.length === pairs.length) {
        setIsFinished(true);
        const cleanSuccess = attempts <= pairs.length;
        onItemCompleted(cleanSuccess);
      }
    } else {
      setMismatch(true);
      setMismatchedLeft(leftId);
      setMismatchedRight(rightId);

      if (onPairCompleted && leftIndex !== -1) {
        onPairCompleted(leftIndex, false);
      }

      setTimeout(() => {
        setMismatch(false);
        setMismatchedLeft(null);
        setMismatchedRight(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  return (
    <div className="game-card shadow-lg animate-fade-in">
      <div className="game-item-header">
        <span className="step-badge">Matching Pairs</span>
        <h3 className="game-instruction">{game.instruction}</h3>
      </div>

      <div className="matching-wrapper-relative mt-4" ref={containerRef}>
        {/* SVG Connection Lines */}
        <svg className="matching-svg-layer">
          {lines.map((line) => {
            const dx = Math.abs(line.to.x - line.from.x) * 0.4;
            const pathD = `M ${line.from.x} ${line.from.y} C ${line.from.x + dx} ${line.from.y}, ${line.to.x - dx} ${line.to.y}, ${line.to.x} ${line.to.y}`;

            return (
              <path
                key={line.id}
                d={pathD}
                className={`connection-rope ${line.status}`}
              />
            );
          })}
        </svg>

        {/* Forced 50/50 Side-by-Side Dual Columns */}
        <div className="matching-grid compact side-by-side-50">
          {/* Left Column (50% English) */}
          <div className="matching-column col-half">
            <div className="column-header">English</div>
            {pairs.map((p) => {
              const isMatched = matchedIds.includes(p.id);
              const isSelected = selectedLeft === p.id;
              const isMismatched = mismatchedLeft === p.id;

              return (
                <button
                  key={`left-${p.id}`}
                  ref={(el) => { cardRefs.current[`left-${p.id}`] = el; }}
                  onClick={() => handleLeftClick(p.id)}
                  disabled={isMatched || isFinished}
                  className={`matching-card compact ${
                    isMatched
                      ? 'matched'
                      : isMismatched
                      ? 'mismatched shake'
                      : isSelected
                      ? 'selected'
                      : ''
                  }`}
                >
                  <span className="card-dot left" />
                  <span className="card-text">{p.left}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column (50% Vietnamese) */}
          <div className="matching-column col-half">
            <div className="column-header">Tiếng Việt</div>
            {rightItems.map((r) => {
              const isMatched = matchedIds.includes(r.id);
              const isSelected = selectedRight === r.id;
              const isMismatched = mismatchedRight === r.id;

              return (
                <button
                  key={`right-${r.id}`}
                  ref={(el) => { cardRefs.current[`right-${r.id}`] = el; }}
                  onClick={() => handleRightClick(r.id)}
                  disabled={isMatched || isFinished}
                  className={`matching-card compact ${
                    isMatched
                      ? 'matched'
                      : isMismatched
                      ? 'mismatched shake'
                      : isSelected
                      ? 'selected'
                      : ''
                  }`}
                >
                  <span className="card-dot right" />
                  <span className="card-text">{r.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="feedback-banner success animate-slide-up mt-4">
          <div className="feedback-content">
            <CheckCircle2 size={24} />
            <div>
              <p className="feedback-title">All pairs connected successfully!</p>
              <p className="feedback-detail">Total attempts: {attempts}</p>
            </div>
          </div>
        </div>
      )}

      <div className="game-actions mt-4">
        {isFinished && (
          <button className="btn-primary" onClick={onGameFinished}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
