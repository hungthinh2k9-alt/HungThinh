import React, { useState, useEffect } from 'react';
import type { Lesson, Game } from '../../types/lesson';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { ClozeEngine } from './ClozeEngine';
import { MatchingEngine } from './MatchingEngine';
import { SentenceBuilderEngine } from './SentenceBuilderEngine';
import { ErrorSpotterEngine } from './ErrorSpotterEngine';
import { WordScrambleEngine } from './WordScrambleEngine';
import { LessonSummary } from './LessonSummary';
import { Flame, Trophy, ArrowLeft, Clock } from 'lucide-react';
import { saveStudentLessonProgress } from '../../utils/storage';

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

  const t = translations[lang];

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const currentGame: Game = lesson.games[currentGameIndex];

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
      saveStudentLessonProgress(lesson.lesson_id, score, lesson.games.length, totalTime);
      setElapsedSeconds(totalTime);
      setIsFinished(true);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case 'cloze': return t.clozeLabel;
      case 'matching': return t.matchingLabel;
      case 'sentence_builder': return t.sentenceLabel;
      case 'error_spotter': return t.errorSpotterLabel;
      case 'word_scramble': return t.wordScrambleLabel;
      default: return type;
    }
  };

  if (isFinished) {
    return (
      <LessonSummary
        lesson={lesson}
        lang={lang}
        score={score}
        maxStreak={maxStreak}
        totalQuestions={totalQuestionsAnswered}
        correctAnswers={correctAnswersCount}
        timeSeconds={elapsedSeconds}
        onRestart={() => {
          setCurrentGameIndex(0);
          setStreak(0);
          setMaxStreak(0);
          setScore(0);
          setCorrectAnswersCount(0);
          setTotalQuestionsAnswered(0);
          setElapsedSeconds(0);
          setStartTime(Date.now());
          setIsFinished(false);
        }}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  const progressPercent = ((currentGameIndex) / lesson.games.length) * 100;

  return (
    <div className="game-container-layout">
      {/* Header bar */}
      <div className="game-header-bar">
        <button className="btn-icon" onClick={onBackToDashboard} title={t.backToTopics}>
          <ArrowLeft size={20} />
        </button>

        <div className="header-info">
          <h2 className="lesson-header-title">{lesson.title}</h2>
          <span className="game-type-badge">
            {lang === 'vi' ? `Bài ${currentGameIndex + 1} / ${lesson.games.length}` : `Exercise ${currentGameIndex + 1} of ${lesson.games.length}`}: {getGameTypeLabel(currentGame.type)}
          </span>
        </div>

        <div className="game-stats-pill">
          {streak > 0 && (
            <div className="stat-item streak-pill animate-bounce-subtle">
              <Flame size={18} className="icon-flame" />
              <span>{streak} {t.streak}</span>
            </div>
          )}

          <div className="stat-item score-pill">
            <Trophy size={18} className="icon-trophy" />
            <span>{score} {t.pts}</span>
          </div>

          <div className="stat-item time-pill">
            <Clock size={16} />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Game View */}
      <div className="engine-viewport">
        {currentGame.type === 'cloze' && (
          <ClozeEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            lang={lang}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
          />
        )}

        {currentGame.type === 'matching' && (
          <MatchingEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            lang={lang}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
          />
        )}

        {currentGame.type === 'sentence_builder' && (
          <SentenceBuilderEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            lang={lang}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
          />
        )}

        {currentGame.type === 'error_spotter' && (
          <ErrorSpotterEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            lang={lang}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
          />
        )}

        {currentGame.type === 'word_scramble' && (
          <WordScrambleEngine
            key={`game-${currentGame.id}`}
            game={currentGame}
            lang={lang}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
          />
        )}
      </div>
    </div>
  );
};
