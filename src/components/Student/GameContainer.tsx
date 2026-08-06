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
import { Flame, Trophy, ArrowLeft, RotateCcw, ChevronDown, ChevronUp, List } from 'lucide-react';
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
  const flatQuestions: QuestionRef[] = [];
  lesson.games.forEach((g, gIdx) => {
    g.items.forEach((item, iIdx) => {
      flatQuestions.push({
        questionNumber: flatQuestions.length + 1,
        gameIndex: gIdx,
        itemIndex: iIdx,
        game: g,
        rawItem: item,
      });
    });
  });

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

  const safeIndex = Math.min(currentQuestionIndex, flatQuestions.length - 1);
  const currentQ = flatQuestions[safeIndex] || flatQuestions[0];
  const currentGame = currentQ.game;

  // Single-item game for current question
  const singleItemGame: Game = {
    id: `${currentGame.id}-q${currentQ.questionNumber}`,
    type: currentGame.type,
    instruction: currentGame.instruction,
    items: [currentQ.rawItem],
  };

  // Countdown timer
  const remainingSeconds = Math.max(0, COUNTDOWN_TOTAL_SECONDS - elapsedSeconds);
  const countdownPercent = (remainingSeconds / COUNTDOWN_TOTAL_SECONDS) * 100;
  const countdownMinutes = Math.floor(remainingSeconds / 60);
  const countdownSecs = remainingSeconds % 60;
  const isTimeRunningLow = remainingSeconds < 60;

  // Question stats summary for header
  const correctCount = Object.values(questionStatuses).filter((s) => s === 'correct').length;
  const incorrectCount = Object.values(questionStatuses).filter((s) => s === 'incorrect').length;

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

      {/* Collapsible Question Palette Card */}
      <div className={`question-palette-container ${isPaletteExpanded ? 'expanded' : 'collapsed'}`}>
        <div
          className="question-palette-header clickable"
          onClick={() => setIsPaletteExpanded(!isPaletteExpanded)}
          title={isPaletteExpanded ? 'Thu gọn danh sách câu hỏi' : 'Mở rộng danh sách câu hỏi'}
        >
          <div className="palette-title-group">
            <List size={16} className="text-indigo-600" />
            <span className="question-palette-label">
              {lang === 'vi'
                ? `Danh sách câu hỏi (${flatQuestions.length} câu)`
                : `Questions List (${flatQuestions.length})`}
            </span>
            <span className="compact-status-summary">
              · {correctCount} ✅ {incorrectCount} ❌
            </span>
          </div>

          <div className="palette-header-right">
            <span className="toggle-hint-text">
              {isPaletteExpanded
                ? (lang === 'vi' ? 'Thu gọn' : 'Collapse')
                : (lang === 'vi' ? 'Xem tất cả' : 'Expand all')}
            </span>
            {isPaletteExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Collapsed mini preview row */}
        {!isPaletteExpanded && (
          <div
            className="mini-palette-preview mt-2"
            onClick={() => setIsPaletteExpanded(true)}
          >
            {flatQuestions.map((q, idx) => {
              const status = questionStatuses[q.questionNumber];
              const isActive = idx === safeIndex;
              return (
                <span
                  key={q.questionNumber}
                  className={`mini-pill ${isActive ? 'active' : ''} ${status || 'unanswered'}`}
                  title={`Câu ${q.questionNumber}`}
                >
                  {q.questionNumber}
                </span>
              );
            })}
          </div>
        )}

        {/* Expanded full grid & legend */}
        {isPaletteExpanded && (
          <div className="expanded-palette-content animate-slide-up mt-2">
            <div className="question-palette-legend mb-3">
              <span className="legend-item">
                <span className="legend-dot correct" /> {lang === 'vi' ? 'Đúng' : 'Correct'}
              </span>
              <span className="legend-item">
                <span className="legend-dot incorrect" /> {lang === 'vi' ? 'Sai' : 'Incorrect'}
              </span>
              <span className="legend-item">
                <span className="legend-dot unanswered" /> {lang === 'vi' ? 'Chưa làm' : 'Unanswered'}
              </span>
            </div>

            <div className="question-palette-grid">
              {flatQuestions.map((q, idx) => {
                const status = questionStatuses[q.questionNumber];
                const isActive = idx === safeIndex;
                return (
                  <button
                    key={q.questionNumber}
                    onClick={(e) => {
                      e.stopPropagation();
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

      {/* Lesson Overall Progress Bar */}
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
            key={`q-${currentQ.questionNumber}`}
            game={singleItemGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
            onRecordMistake={handleRecordMistake}
          />
        )}

        {currentGame.type === 'matching' && (
          <MatchingEngine
            key={`q-${currentQ.questionNumber}`}
            game={singleItemGame}
            onItemCompleted={handleItemCompleted}
            onGameFinished={handleGameFinished}
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
  );
};
