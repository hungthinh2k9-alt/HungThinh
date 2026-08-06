import { useState, useEffect } from 'react';
import type { Lesson } from './types/lesson';
import type { Language } from './utils/i18n';
import { getStoredLanguage, saveStoredLanguage, translations } from './utils/i18n';
import { getStoredLessons, saveStoredLessons } from './utils/storage';
import { fetchLessonsFromSupabase } from './utils/supabase';
import { LessonList } from './components/Student/LessonList';
import { GameContainer } from './components/Student/GameContainer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { BookOpen, Settings } from 'lucide-react';

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
        saveStoredLessons(remoteData);
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

  const handleBackToDashboard = () => {
    setSelectedLesson(null);
    setActiveTab('student');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveTab('student');
  };

  return (
    <div className="app-shell">
      {/* Minimal Navbar — student-first, no admin tabs visible */}
      <header className="navbar shadow-sm">
        <div className="navbar-container">
          <button
            className="brand-logo"
            onClick={() => { setActiveTab('student'); setSelectedLesson(null); }}
          >
            <div className="logo-icon-wrapper">
              <BookOpen size={20} className="logo-icon" />
            </div>
            <span className="brand-name">{t.brandName}</span>
          </button>

          <div className="lang-switcher-pill">
            <button
              className={`lang-btn ${lang === 'vi' ? 'active' : ''}`}
              onClick={() => handleLanguageToggle('vi')}
            >
              Tiếng Việt
            </button>
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageToggle('en')}
            >
              English
            </button>
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
                  onSelectLesson={(lesson) => setSelectedLesson(lesson)}
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

      {/* Footer with subtle admin login link */}
      <footer className="app-footer">
        <span>{t.brandName}</span>
        <span className="footer-separator">·</span>
        {activeTab === 'admin' ? (
          <button
            className="footer-link"
            onClick={() => { setActiveTab('student'); setSelectedLesson(null); }}
          >
            {lang === 'vi' ? '← Về trang học sinh' : '← Back to student view'}
          </button>
        ) : (
          <button
            className="footer-link"
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={13} />
            <span>{lang === 'vi' ? 'Quản lý giáo viên' : 'Teacher login'}</span>
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
