import React, { useState, useEffect, useMemo } from 'react';
import type { Lesson, Game, MissedQuestion } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { ClozeEngine } from './ClozeEngine';
import { MatchingEngine } from './MatchingEngine';
import { SentenceBuilderEngine } from './SentenceBuilderEngine';
import { ErrorSpotterEngine } from './ErrorSpotterEngine';
import { WordScrambleEngine } from './WordScrambleEngine';
import { LessonSummary } from './LessonSummary';
import { Flame, Trophy, ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Award } from 'lucide-react';
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
  const [, setMissedQuestions] = useState<MissedQuestion[]>([]);

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

  // Count incorrect answers
  const incorrectCount = Object.values(questionStatuses).filter((s) => s === 'incorrect').length;
  const correctCount = Object.values(questionStatuses).filter((s) => s === 'correct').length;

  const handleRecordMistake = (rawItem: string) => {
    const newMissed: MissedQuestion = {
      id: `m-${Date.now()}-${Math.random()}`,
      gameType: currentGame.type,
      gameInstruction: currentGame.instruction,
      rawItem,
    };
    setMissedQuestions((prev) => [...prev, newMissed]);
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
      handleRecordMistake(currentGame.items[pairIndex] || currentQ.rawItem);
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
      setCurrentQuestionIndex(lastMatchingQ.questionNumber); // advances to first question of next exercise
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const accuracyPercent = totalQuestionsAnswered > 0
        ? Math.round((correctAnswersCount / totalQuestionsAnswered) * 100)
        : 100;

      saveStudentLessonProgress(lesson.lesson_id, score, lesson.games.length, totalTime, accuracyPercent);
      setIsFinished(true);
    }
  };

  // Jump to first incorrect question
  const handleJumpToFirstMistake = () => {
    const firstWrongQ = flatQuestions.find((q) => questionStatuses[q.questionNumber] === 'incorrect');
    if (firstWrongQ) {
      const wrongIdx = flatQuestions.findIndex((q) => q.questionNumber === firstWrongQ.questionNumber);
      if (wrongIdx !== -1) {
        setCurrentQuestionIndex(wrongIdx);
      }
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
          setMissedQuestions([]);
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
      {/* ROW 1: Header Bar & Vivid Burning Countdown Timer */}
      <div className="layout-row-1">
        <div className="game-top-bar">
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
        </div>

        {/* Vivid Burning Fire Countdown Timer Bar */}
        <div className="countdown-bar-container burning-fire-container">
          <div className="countdown-label">
            <span className={`countdown-time ${isTimeRunningLow ? 'time-low' : ''}`}>
              🔥 {countdownMinutes}:{countdownSecs < 10 ? '0' : ''}{countdownSecs}
            </span>
          </div>
          <div className="countdown-track">
            <div
              className={`countdown-fill burning-flame-fill ${isTimeRunningLow ? 'low' : ''}`}
              style={{ width: `${countdownPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ROW 2: 3-Column Desktop Grid Layout */}
      <div className="layout-row-2-grid">
        {/* COL 1 (LEFT - Small): Bảng Thành Tích Card */}
        <div className="desktop-col-left">
          <div className="achievements-card shadow-sm">
            <h3 className="card-section-title text-center mb-3">
              {lang === 'vi' ? 'Bảng Thành Tích' : 'Achievements'}
            </h3>
            
            <div className="stats-vertical-stack">
              {/* Score */}
              <div className="stat-card-item score-card">
                <Trophy size={20} className="score-icon" />
                <div className="stat-card-text">
                  <span className="stat-card-label">{lang === 'vi' ? 'Điểm số' : 'Score'}</span>
                  <span className="stat-card-value">{score}</span>
                </div>
              </div>

              {/* Streak */}
              <div className="stat-card-item streak-card">
                <Flame size={20} className="icon-flame" />
                <div className="stat-card-text">
                  <span className="stat-card-label">{lang === 'vi' ? 'Chuỗi đúng' : 'Streak'}</span>
                  <span className="stat-card-value">{streak} 🔥</span>
                </div>
              </div>

              {/* Incorrect / Jump to First Mistake Button */}
              {incorrectCount > 0 && (
                <button
                  className="stat-card-item mistake-jump-card animate-pulse"
                  onClick={handleJumpToFirstMistake}
                  title={lang === 'vi' ? 'Nhảy về câu sai đầu tiên' : 'Jump to 1st mistake'}
                >
                  <RotateCcw size={18} className="text-red-500" />
                  <div className="stat-card-text">
                    <span className="stat-card-label">{lang === 'vi' ? 'Lỗi sai' : 'Mistakes'}</span>
                    <span className="stat-card-value text-red-600">{incorrectCount} câu (Sửa lại)</span>
                  </div>
                </button>
              )}

              {/* Correct Count */}
              <div className="stat-card-item accuracy-card">
                <Award size={20} className="text-emerald-500" />
                <div className="stat-card-text">
                  <span className="stat-card-label">{lang === 'vi' ? 'Đã làm đúng' : 'Correct'}</span>
                  <span className="stat-card-value text-emerald-600">{correctCount} / {flatQuestions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COL 2 (MIDDLE - Main/Large): Phần Làm Bài (Engine View) */}
        <div className="desktop-col-middle">
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
                onRecordMistake={handleRecordMistake}
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
                onRecordMistake={handleRecordMistake}
              />
            )}

            {currentGame.type === 'error_spotter' && (
              <ErrorSpotterEngine
                key={`q-${currentQ.questionNumber}`}
                game={singleItemGame}
                onItemCompleted={handleItemCompleted}
                onGameFinished={handleGameFinished}
                onRecordMistake={handleRecordMistake}
              />
            )}

            {currentGame.type === 'word_scramble' && (
              <WordScrambleEngine
                key={`q-${currentQ.questionNumber}`}
                game={singleItemGame}
                onItemCompleted={handleItemCompleted}
                onGameFinished={handleGameFinished}
                onRecordMistake={handleRecordMistake}
              />
            )}
          </div>
        </div>

        {/* COL 3 (RIGHT - Small): DANH SÁCH CÂU HỎI Card */}
        <div className="desktop-col-right">
          <div className="question-palette-container">
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
    </div>
  );
};
