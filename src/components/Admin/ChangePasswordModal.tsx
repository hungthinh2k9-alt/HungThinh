import React, { useState } from 'react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { getStoredAdminPassword, setStoredAdminPassword } from './AdminLogin';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  lang: Language;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  lang,
  onClose,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = getStoredAdminPassword();

    if (currentPass !== stored) {
      setErrorMsg(t.incorrectCurrentPassword);
      setSuccessMsg(null);
      return;
    }

    if (!newPass || newPass !== confirmPass) {
      setErrorMsg(t.passwordsDoNotMatch);
      setSuccessMsg(null);
      return;
    }

    setStoredAdminPassword(newPass);
    setErrorMsg(null);
    setSuccessMsg(t.passwordChangedSuccess);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content shadow-xl">
        <div className="modal-header">
          <h3>{t.changePasswordTitle}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div className="alert-banner error mb-3">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert-banner success mb-3">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.currentPassword}:</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="form-input icon-padded"
                  required
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">{t.newPassword}:</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="form-input icon-padded"
                  required
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">{t.confirmNewPassword}:</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="form-input icon-padded"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary">
              {t.saveNewPassword}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
