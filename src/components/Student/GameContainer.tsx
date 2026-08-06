import React, { useState, useEffect } from 'react';
import type { Lesson, Game, MissedQuestion } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { ClozeEngine } from './ClozeEngine';
import { MatchingEngine } from './MatchingEngine';
import { SentenceBuilderEngine } from './SentenceBuilderEngine';
import { ErrorSpotterEngine } from './ErrorSpotterEngine';
import { WordScrambleEngine } from './WordScrambleEngine';
import { LessonSummary } from './LessonSummary';
import { MistakesReview } from './MistakesReview';
import { Flame, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';
import { saveStudentLessonProgress } from '../../utils/storage';

const COUNTDOWN_TOTAL_SECONDS = 300; // 5 minutes per lesson

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
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestion[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (isFinished || isReviewingMistakes) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished, isReviewingMistakes]);

  const currentGame: Game = lesson.games[currentGameIndex];

  // Countdown timer
  const remainingSeconds = Math.max(0, COUNTDOWN_TOTAL_SECONDS - elapsedSeconds);
  const countdownPercent = (remainingSeconds / COUNTDOWN_TOTAL_SECONDS) * 100;
  const countdownMinutes = Math.floor(remainingSeconds / 60);
  const countdownSecs = remainingSeconds % 60;
  const isTimeRunningLow = remainingSeconds < 60;

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
    if (currentGameIndex < lesson.games.length - 1) {
      setCurrentGameIndex((prev) => prev + 1);
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const accuracyPercent = totalQuestionsAnswered > 0
        ? Math.round((correctAnswersCount / totalQuestionsAnswered) * 100)
        : 100;
      
      saveStudentLessonProgress(lesson.lesson_id, score, lesson.games.length, totalTime, accuracyPercent);
      setIsFinished(true);
    }
  };



  if (isReviewingMistakes) {
    return (
      <MistakesReview
        missedQuestions={missedQuestions}
        lang={lang}
        onBack={() => setIsReviewingMistakes(false)}
        onClearMistakes={() => setMissedQuestions([])}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

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
          setCurrentGameIndex(0);
          setStreak(0);
          setMaxStreak(0);
          setScore(0);
          setCorrectAnswersCount(0);
          setTotalQuestionsAnswered(0);
          setIsFinished(false);
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  const progressPercent = ((currentGameIndex) / lesson.games.length) * 100;

  return (
    <div className="game-container-layout">
      {/* Top bar: back + title on left, score on right */}
      <div className="game-top-bar">
        <div className="game-top-left">
          <button className="btn-icon" onClick={onBackToDashboard} title={t.backToTopics}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-info">
            <h2 className="lesson-header-title">{lesson.title}</h2>
            <span className="game-type-badge">
              {lang === 'vi' 
                ? `Phần ${currentGameIndex + 1} / ${lesson.games.length} (${currentGame.items.length} câu hỏi)` 
                : `Part ${currentGameIndex + 1} of ${lesson.games.length} (${currentGame.items.length} questions)`}
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

          {missedQuestions.length > 0 && (
            <button
              className="mistakes-btn"
              onClick={() => setIsReviewingMistakes(true)}
              title={t.reviewMistakes}
            >
              <RotateCcw size={14} /> {missedQuestions.length}
            </button>
          )}
        </div>
      </div>

      {/* Countdown Timer Bar */}
      <div className="countdown-bar-container">
        <div className="countdown-label">
          <span className={`countdown-time ${isTimeRunningLow ? 'time-low' : ''}`}>
            {countdownMinutes}:{countdownSecs < 10 ? '0' : ''}{countdownSecs}
          </span>
        </div>
        <div className="countdown-track">
          <div
            className={`countdown-fill ${isTimeRunningLow ? 'low' : ''}`}
            style={{ width: `${countdownPercent}%` }}
          />
        </div>
      </div>

      {/* Game Picker Tabs */}
      <div className="game-picker-container">
        <div className="picker-tabs">
          {lesson.games.map((g, idx) => (
            <button
              key={g.id || idx}
              onClick={() => setCurrentGameIndex(idx)}
              className={`picker-tab ${idx === currentGameIndex ? 'active' : ''}`}
            >
              {lang === 'vi' ? `Phần ${idx + 1} (${g.items.length} câu)` : `Part ${idx + 1} (${g.items.length} q's)`}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Progress */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Game Engine View */}
      <div className="engine-viewport">
        {currentGame.type === 'cloze' && (
          <ClozeEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
            onRecordMistake={handleRecordMistake}
          />
        )}

        {currentGame.type === 'matching' && (
          <MatchingEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
          />
        )}

        {currentGame.type === 'sentence_builder' && (
          <SentenceBuilderEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
            onRecordMistake={handleRecordMistake}
          />
        )}

        {currentGame.type === 'error_spotter' && (
          <ErrorSpotterEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
            onRecordMistake={handleRecordMistake}
          />
        )}

        {currentGame.type === 'word_scramble' && (
          <WordScrambleEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
            onRecordMistake={handleRecordMistake}
          />
        )}
      </div>
    </div>
  );
};
