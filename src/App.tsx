import { useState, useEffect } from 'react';
import type { Lesson } from './types/lesson';
import { getStoredLessons, saveStoredLessons } from './utils/storage';
import { fetchLessonsFromSupabase } from './utils/supabase';
import { LessonList } from './components/Student/LessonList';
import { GameContainer } from './components/Student/GameContainer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { GraduationCap, Settings, Sparkles } from 'lucide-react';

export function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    async function loadData() {
      const localData = getStoredLessons();
      setLessons(localData);

      // Attempt to load live remote data from Supabase
      const remoteData = await fetchLessonsFromSupabase();
      if (remoteData && remoteData.length > 0) {
        setLessons(remoteData);
        saveStoredLessons(remoteData);
      }
    }
    loadData();
  }, []);

  const handleLessonsUpdated = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    saveStoredLessons(updatedLessons);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleBackToDashboard = () => {
    setSelectedLesson(null);
  };

  return (
    <div className="app-shell">
      {/* Navigation Navbar */}
      <header className="navbar shadow-md">
        <div className="navbar-container">
          <div className="brand-logo" onClick={() => { setActiveTab('student'); setSelectedLesson(null); }}>
            <div className="logo-icon-wrapper">
              <Sparkles size={22} className="logo-sparkle" />
            </div>
            <span className="brand-name">LingoQuest</span>
            <span className="brand-badge">Text Engine</span>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'student' && !selectedLesson ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('student');
                setSelectedLesson(null);
              }}
            >
              <GraduationCap size={18} /> Student View
            </button>
            <button
              className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('admin');
                setSelectedLesson(null);
              }}
            >
              <Settings size={18} /> Teacher Admin CMS
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content-wrapper">
        {activeTab === 'student' && (
          selectedLesson ? (
            <GameContainer
              lesson={selectedLesson}
              onBackToDashboard={handleBackToDashboard}
            />
          ) : (
            <LessonList
              lessons={lessons}
              onSelectLesson={handleSelectLesson}
            />
          )
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            lessons={lessons}
            onLessonsUpdated={handleLessonsUpdated}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>100% Data-Driven Interactive Text-Only Learning Platform • Built with React & Vite & Supabase</p>
      </footer>
    </div>
  );
}

export default App;
