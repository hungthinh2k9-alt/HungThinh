import { useState, useEffect } from 'react';
import type { Lesson } from './types/lesson';
import type { Language } from './utils/i18n';
import { getStoredLanguage, saveStoredLanguage, translations } from './utils/i18n';
import { cacheStoredLessons, getStoredLessons, saveStoredLessons } from './utils/storage';
import { fetchLessonsFromSupabase } from './utils/supabase';
import { LessonList } from './components/Student/LessonList';
import { GameContainer } from './components/Student/GameContainer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { GraduationCap, Settings, BookOpen } from 'lucide-react';

export function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lang, setLang] = useState<Language>(getStoredLanguage());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const t = translations[lang];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const remoteData = await fetchLessonsFromSupabase();
      if (remoteData !== null) {
        setLessons(remoteData);
        cacheStoredLessons(remoteData);
      } else {
        const localData = getStoredLessons();
        setLessons(localData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLanguageToggle = (newLang: Language) => {
    setLang(newLang);
    saveStoredLanguage(newLang);
  };

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

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
  };

  return (
    <div className="app-shell">
      {/* Navigation Navbar */}
      <header className="navbar shadow-sm">
        <div className="navbar-container">
          <button className="brand-logo" onClick={() => { setActiveTab('student'); setSelectedLesson(null); }}>
            <div className="logo-icon-wrapper">
              <BookOpen size={20} className="logo-icon" />
            </div>
            <span className="brand-name">{t.brandName}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="lang-switcher-pill">
              <button
                className={`lang-btn ${lang === 'vi' ? 'active' : ''}`}
                onClick={() => handleLanguageToggle('vi')}
                aria-label="Dùng tiếng Việt"
              >
                Tiếng Việt
              </button>
              <button
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageToggle('en')}
                aria-label="Use English"
              >
                English
              </button>
            </div>

            <nav className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'student' && !selectedLesson ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('student');
                  setSelectedLesson(null);
                }}
              >
                <GraduationCap size={18} /> {t.studentView}
              </button>
              <button
                className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('admin');
                  setSelectedLesson(null);
                }}
              >
                <Settings size={18} /> {t.adminView}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content-wrapper">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner" />
            <p>{lang === 'vi' ? 'Đang mở bài học...' : 'Opening lessons...'}</p>
          </div>
        ) : (
          <>
            {activeTab === 'student' && (
              selectedLesson ? (
                <GameContainer
                  lesson={selectedLesson}
                  lang={lang}
                  onBackToDashboard={handleBackToDashboard}
                />
              ) : (
                <LessonList
                  lessons={lessons}
                  lang={lang}
                  onSelectLesson={handleSelectLesson}
                />
              )
            )}

            {activeTab === 'admin' && (
              isAdminAuthenticated ? (
                <AdminDashboard
                  lessons={lessons}
                  lang={lang}
                  onLessonsUpdated={handleLessonsUpdated}
                  onLogout={handleLogout}
                />
              ) : (
                <AdminLogin
                  lang={lang}
                  onLoginSuccess={() => setIsAdminAuthenticated(true)}
                />
              )
            )}
          </>
        )}
      </main>

      <footer className="app-footer">{t.brandName}</footer>
    </div>
  );
}

export default App;
