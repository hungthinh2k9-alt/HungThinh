import React, { useState, useEffect, useMemo } from 'react';
import type { Lesson, Game } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { ClozeEngine } from './ClozeEngine';
import { MatchingEngine } from './MatchingEngine';
import { SentenceBuilderEngine } from './SentenceBuilderEngine';
import { ErrorSpotterEngine } from './ErrorSpotterEngine';
import { WordScrambleEngine } from './WordScrambleEngine';
import { LessonSummary } from './LessonSummary';
import { Flame, Trophy, ArrowLeft, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { saveStudentLessonProgress } from '../../utils/storage';

const COUNTDOWN_TOTAL_SECONDS = 300; // 5 minutes per lesson

interface QuestionRef {
  questionNumber: number; // 1..N
  gameIndex: number;
  itemIndex: number;
  game: Game;
  rawItem: string;
}

interface GameContainerProps {
  lesson: Lesson;
  lang: Language;
  onBackToDashboard: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  lesson,
  lang,
  onBackToDashboard,
}) => {
  // Flatten all items across all games into a sequential questions list (1 to N)
  const flatQuestions: QuestionRef[] = useMemo(() => {
    const list: QuestionRef[] = [];
    lesson.games.forEach((g, gIdx) => {
      g.items.forEach((item, iIdx) => {
        list.push({
          questionNumber: list.length + 1,
          gameIndex: gIdx,
          itemIndex: iIdx,
          game: g,
          rawItem: item,
        });
      });
    });
    return list;
  }, [lesson.games]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [isPaletteExpanded, setIsPaletteExpanded] = useState(true); // Default expanded in desktop card
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const safeIndex = Math.min(currentQuestionIndex, flatQuestions.length - 1);
  const currentQ = flatQuestions[safeIndex] || flatQuestions[0];
  const currentGame = currentQ.game;

  // Single-item game for current question (non-matching)
  const singleItemGame: Game = useMemo(() => ({
    id: `${currentGame.id}-q${currentQ.questionNumber}`,
    type: currentGame.type,
    instruction: currentGame.instruction,
    items: [currentQ.rawItem],
  }), [currentGame.id, currentGame.type, currentGame.instruction, currentQ.questionNumber, currentQ.rawItem]);

  // Countdown timer
  const remainingSeconds = Math.max(0, COUNTDOWN_TOTAL_SECONDS - elapsedSeconds);
  const countdownPercent = (remainingSeconds / COUNTDOWN_TOTAL_SECONDS) * 100;
  const countdownMinutes = Math.floor(remainingSeconds / 60);
  const countdownSecs = remainingSeconds % 60;
  const isTimeRunningLow = remainingSeconds < 60;

  // Counts of correct & incorrect answers
  const correctCount = Object.values(questionStatuses).filter((s) => s === 'correct').length;
  const incorrectCount = Object.values(questionStatuses).filter((s) => s === 'incorrect').length;

  // Jump to the first incorrect question when requested
  const handleJumpToFirstMistake = () => {
    const firstIncorrectQNum = flatQuestions.find(
      (q) => questionStatuses[q.questionNumber] === 'incorrect'
    )?.questionNumber;

    if (firstIncorrectQNum !== undefined) {
      const targetIdx = flatQuestions.findIndex((q) => q.questionNumber === firstIncorrectQNum);
      if (targetIdx !== -1) {
        setCurrentQuestionIndex(targetIdx);
      }
    }
  };

  const handleItemCompleted = (isCorrect: boolean) => {
    const qNum = currentQ.questionNumber;
    setQuestionStatuses((prev) => ({
      ...prev,
      [qNum]: isCorrect ? 'correct' : 'incorrect',
    }));

    setTotalQuestionsAnswered((prev) => prev + 1);
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      const bonus = Math.min(newStreak * 10, 50);
      setScore((prev) => prev + 100 + bonus);
    } else {
      setStreak(0);
    }
  };

  const handleMatchingPairCompleted = (questionRef: QuestionRef, pairIndex: number, isCorrect: boolean) => {
    const matchingQuestions = flatQuestions.filter((q) => q.gameIndex === questionRef.gameIndex);
    if (!matchingQuestions || matchingQuestions.length === 0) return;
    const targetQ = matchingQuestions[pairIndex] || matchingQuestions[0];
    const qNum = targetQ.questionNumber;

    setQuestionStatuses((prev) => ({
      ...prev,
      [qNum]: isCorrect ? 'correct' : 'incorrect',
    }));

    setTotalQuestionsAnswered((prev) => prev + 1);
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      const bonus = Math.min(newStreak * 10, 50);
      setScore((prev) => prev + 100 + bonus);
    } else {
      setStreak(0);
    }
  };

  const handleGameFinished = () => {
    if (safeIndex < flatQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const accuracyPercent = totalQuestionsAnswered > 0
        ? Math.round((correctAnswersCount / totalQuestionsAnswered) * 100)
        : 100;
      
      saveStudentLessonProgress(lesson.lesson_id, score, lesson.games.length, totalTime, accuracyPercent);
      setIsFinished(true);
    }
  };

  const handleMatchingGameFinished = () => {
    const matchingQuestions = flatQuestions.filter((q) => q.gameIndex === currentQ.gameIndex);
    const lastMatchingQ = matchingQuestions[matchingQuestions.length - 1];

    if (lastMatchingQ && lastMatchingQ.questionNumber < flatQuestions.length) {
      setCurrentQuestionIndex(lastMatchingQ.questionNumber);
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const accuracyPercent = totalQuestionsAnswered > 0
        ? Math.round((correctAnswersCount / totalQuestionsAnswered) * 100)
        : 100;

      saveStudentLessonProgress(lesson.lesson_id, score, lesson.games.length, totalTime, accuracyPercent);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <LessonSummary
        lesson={lesson}
        score={score}
        maxStreak={maxStreak}
        totalQuestions={totalQuestionsAnswered}
        correctAnswers={correctAnswersCount}
        timeSeconds={elapsedSeconds}
        onRestart={() => {
          setStartTime(Date.now());
          setElapsedSeconds(0);
          setQuestionStatuses({});
          setCurrentQuestionIndex(0);
          setStreak(0);
          setMaxStreak(0);
          setScore(0);
          setCorrectAnswersCount(0);
          setTotalQuestionsAnswered(0);
          setIsFinished(false);
          setIsPaletteExpanded(true);
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  const progressPercent = ((safeIndex + 1) / flatQuestions.length) * 100;

  return (
    <div className="game-container-layout">
      {/* ROW 1: Content Header + Vivid Burning Flame Timer Bar (No outer container) */}
      <div className="game-row-top-section">
        <div className="game-top-bar shadow-sm">
          <div className="game-top-left">
            <button className="btn-icon" onClick={onBackToDashboard} title={t.backToTopics}>
              <ArrowLeft size={20} />
            </button>
            <div className="header-info">
              <h2 className="lesson-header-title">{lesson.title}</h2>
              <span className="game-type-badge">
                {lang === 'vi' 
                  ? `Câu ${currentQ.questionNumber} / ${flatQuestions.length}` 
                  : `Question ${currentQ.questionNumber} of ${flatQuestions.length}`}
              </span>
            </div>
          </div>

          <div className="game-top-right">
            <div className="score-display">
              <Trophy size={18} className="score-icon" />
              <span className="score-value">{score}</span>
            </div>

            {streak > 0 && (
              <div className="streak-display animate-bounce-subtle">
                <Flame size={16} className="icon-flame" />
                <span>{streak}🔥</span>
              </div>
            )}
          </div>
        </div>

        {/* Borderless Vivid Burning Flame Timer Bar */}
        <div className="burning-flame-bar-wrapper">
          <div
            className={`burning-flame-bar ${isTimeRunningLow ? 'critical' : ''}`}
            style={{ width: `${countdownPercent}%` }}
          >
            <span className="flame-timer-label">
              🔥 {countdownMinutes}:{countdownSecs < 10 ? '0' : ''}{countdownSecs}
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2: Desktop 3-Column Layout (Left: Achievements, Center: Question Engine, Right: Question List) */}
      <div className="game-row-three-columns">
        {/* Left Column: Bảng Thành Tích Card */}
        <div className="stats-sidebar-card shadow-sm">
          <h3 className="sidebar-card-title">
            <Trophy size={18} className="text-amber-500" /> BẢNG THÀNH TÍCH
          </h3>
          
          <div className="stats-vertical-list mt-3">
            <div className="stat-tile">
              <span className="stat-tile-label">{t.pts}</span>
              <span className="stat-tile-value score">{score}</span>
            </div>

            {streak > 0 && (
              <div className="stat-tile streak-highlight animate-bounce-subtle">
                <span className="stat-tile-label">{t.streak}</span>
                <span className="stat-tile-value streak">{streak} 🔥</span>
              </div>
            )}

            <div className="stat-tile">
              <span className="stat-tile-label">Câu đúng</span>
              <span className="stat-tile-value correct flex items-center gap-1">
                <CheckCircle2 size={16} className="text-emerald-500" /> {correctCount}
              </span>
            </div>

            <div className="stat-tile">
              <span className="stat-tile-label">Câu sai</span>
              <span className="stat-tile-value incorrect flex items-center gap-1">
                <XCircle size={16} className="text-rose-500" /> {incorrectCount}
              </span>
            </div>

            {incorrectCount > 0 && (
              <button
                className="btn-jump-mistakes-first mt-3"
                onClick={handleJumpToFirstMistake}
                title="Sửa câu sai đầu tiên"
              >
                <RotateCcw size={15} /> Sửa câu sai đầu tiên
              </button>
            )}
          </div>
        </div>

        {/* Center Column: Game Engine Area (Main Content Area) */}
        <div className="game-center-main-column">
          {/* Lesson Overall Progress Bar */}
          <div className="progress-bar-track mb-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="engine-viewport">
            {currentGame.type === 'cloze' && (
              <ClozeEngine
                key={`q-${currentQ.questionNumber}`}
                game={singleItemGame}
                onItemCompleted={handleItemCompleted}
                onGameFinished={handleGameFinished}
              />
            )}

            {currentGame.type === 'matching' && (
              <MatchingEngine
                key={`matching-game-${currentGame.id}`}
                game={currentGame}
                onItemCompleted={() => {}}
                onGameFinished={handleMatchingGameFinished}
                onPairCompleted={(pairIndex, isCorrect) => handleMatchingPairCompleted(currentQ, pairIndex, isCorrect)}
              />
            )}

            {currentGame.type === 'sentence_builder' && (
              <SentenceBuilderEngine
                key={`q-${currentQ.questionNumber}`}
                game={singleItemGame}
                onItemCompleted={handleItemCompleted}
                onGameFinished={handleGameFinished}
              />
            )}

            {currentGame.type === 'error_spotter' && (
              <ErrorSpotterEngine
                key={`q-${currentQ.questionNumber}`}
                game={singleItemGame}
                onItemCompleted={handleItemCompleted}
                onGameFinished={handleGameFinished}
              />
            )}

            {currentGame.type === 'word_scramble' && (
              <WordScrambleEngine
                key={`q-${currentQ.questionNumber}`}
                game={singleItemGame}
                onItemCompleted={handleItemCompleted}
                onGameFinished={handleGameFinished}
              />
            )}
          </div>
        </div>

        {/* Right Column: Question List Card */}
        <div className="palette-sidebar-card shadow-sm">
          <div
            className="question-palette-header clickable"
            onClick={() => setIsPaletteExpanded(!isPaletteExpanded)}
          >
            <span className="question-palette-title-text">DANH SÁCH CÂU HỎI</span>
            <div className="palette-arrow-icon">
              {isPaletteExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {isPaletteExpanded && (
            <div className="expanded-palette-content animate-slide-up mt-3">
              <div className="question-palette-grid-wrapped">
                {flatQuestions.map((q, idx) => {
                  const status = questionStatuses[q.questionNumber];
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={q.questionNumber}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                      }}
                      className={`question-pill-btn ${isActive ? 'active' : ''} ${status || 'unanswered'}`}
                    >
                      {q.questionNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
