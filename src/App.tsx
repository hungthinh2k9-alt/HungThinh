import { useState, useEffect } from 'react';
import type { Lesson } from './types/lesson';
import { getStoredLessons, saveStoredLessons } from './utils/storage';
import { fetchLessonsFromSupabase } from './utils/supabase';
import { LessonList } from './components/Student/LessonList';
import { GameContainer } from './components/Student/GameContainer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { GraduationCap, Settings, BookOpen } from 'lucide-react';

export function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const remoteData = await fetchLessonsFromSupabase();
      if (remoteData && remoteData.length > 0) {
        setLessons(remoteData);
        saveStoredLessons(remoteData);
      } else {
        const localData = getStoredLessons();
        setLessons(localData);
      }
      setLoading(false);
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
      <header className="navbar shadow-sm">
        <div className="navbar-container">
          <div className="brand-logo" onClick={() => { setActiveTab('student'); setSelectedLesson(null); }}>
            <div className="logo-icon-wrapper">
              <BookOpen size={20} className="logo-icon" />
            </div>
            <span className="brand-name">LingoQuest</span>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'student' && !selectedLesson ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('student');
                setSelectedLesson(null);
              }}
            >
              <GraduationCap size={18} /> Giao diện Học sinh
            </button>
            <button
              className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('admin');
                setSelectedLesson(null);
              }}
            >
              <Settings size={18} /> Quản lý Giáo viên
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content-wrapper">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner" />
            <p>Đang tải dữ liệu bài học...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>© LingoQuest • Nền tảng học Tiếng Anh tương tác cho học sinh</p>
      </footer>
    </div>
  );
}

export default App;
