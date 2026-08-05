import React, { useState } from 'react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { getStoredAdminPassword } from '../../utils/adminAuth';

interface AdminLoginProps {
  lang: Language;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  lang,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = getStoredAdminPassword();

    if (username.trim() === 'admin' && password === storedPass) {
      setErrorMsg(null);
      onLoginSuccess();
    } else {
      setErrorMsg(t.invalidCredentials);
    }
  };

  return (
    <div className="login-card-container animate-scale-up">
      <div className="login-card shadow-lg">
        <div className="login-header">
          <div className="lock-icon-badge">
            <Lock size={28} className="text-indigo-600" />
          </div>
          <h2 className="login-title">{t.teacherLoginTitle}</h2>
          <p className="login-subtitle">{t.teacherLoginSubtitle}</p>
        </div>

        {errorMsg && (
          <div className="alert-banner error mt-4">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form mt-4">
          <div className="form-group">
            <label className="form-label">{t.usernameLabel}:</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="form-input icon-padded"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">{t.passwordLabel}:</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="form-input icon-padded"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary full-width mt-6">
            <LogIn size={18} /> {t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
};
