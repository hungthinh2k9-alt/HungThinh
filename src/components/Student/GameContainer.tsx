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
import { Flame, Trophy, ArrowLeft, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isPaletteExpanded, setIsPaletteExpanded] = useState(false);
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

  // Find index of first incorrect (red) question for retry button
  const firstWrongIndex = flatQuestions.findIndex(
    (q) => questionStatuses[q.questionNumber] === 'incorrect'
  );
  const incorrectCount = Object.values(questionStatuses).filter((s) => s === 'incorrect').length;

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
          setIsPaletteExpanded(false);
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  const progressPercent = ((safeIndex + 1) / flatQuestions.length) * 100;

  return (
    <div className="game-container-layout">
      {/* Side-by-Side 2-Card Desktop Grid (Left: Bảng Thành Tích, Right: Danh Sách Câu Hỏi) */}
      <div className="game-stats-palette-grid">
        {/* Left Card: Bảng Thành Tích */}
        <div className="stats-board-card shadow-sm">
          <div className="stats-card-header">
            <button className="btn-icon" onClick={onBackToDashboard} title={t.backToTopics}>
              <ArrowLeft size={18} />
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

          <div className="stats-metrics-row mt-3">
            <div className="metric-box score">
              <Trophy size={20} className="metric-icon gold" />
              <div className="metric-info">
                <span className="metric-label">{lang === 'vi' ? 'Điểm số' : 'Score'}</span>
                <span className="metric-value">{score}</span>
              </div>
            </div>

            <div className="metric-box streak">
              <Flame size={20} className="metric-icon orange" />
              <div className="metric-info">
                <span className="metric-label">{lang === 'vi' ? 'Chuỗi đúng' : 'Streak'}</span>
                <span className="metric-value">{streak} 🔥</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="countdown-section mt-3">
            <div className="countdown-text-row">
              <span className="countdown-title">{lang === 'vi' ? 'Thời gian' : 'Time Left'}</span>
              <span className={`countdown-time ${isTimeRunningLow ? 'time-low' : ''}`}>
                {countdownMinutes}:{countdownSecs < 10 ? '0' : ''}{countdownSecs}
              </span>
            </div>
            <div className="countdown-track mt-1">
              <div
                className={`countdown-fill ${isTimeRunningLow ? 'low' : ''}`}
                style={{ width: `${countdownPercent}%` }}
              />
            </div>
          </div>

          {/* Retry first wrong question button */}
          {firstWrongIndex !== -1 && (
            <button
              className="jump-wrong-btn mt-3 animate-pulse"
              onClick={() => setCurrentQuestionIndex(firstWrongIndex)}
            >
              <RotateCcw size={15} />
              <span>{lang === 'vi' ? `Làm lại câu sai (${incorrectCount})` : `Retry Missed (${incorrectCount})`}</span>
            </button>
          )}
        </div>

        {/* Right Card: DANH SÁCH CÂU HỎI */}
        <div className="question-palette-container shadow-sm">
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

      {/* Lesson Overall Progress Bar */}
      <div className="progress-bar-track mt-3">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Game Engine View */}
      <div className="engine-viewport mt-3">
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
  );
};
