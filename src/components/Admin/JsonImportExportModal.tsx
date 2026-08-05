import React, { useState } from 'react';
import type { Lesson } from '../../types/lesson';
import { X, Copy, Download, Upload, Check, AlertCircle } from 'lucide-react';

interface JsonImportExportModalProps {
  initialData: Lesson[] | Lesson;
  onImport: (importedData: Lesson[]) => void;
  onClose: () => void;
}

export const JsonImportExportModal: React.FC<JsonImportExportModalProps> = ({
  initialData,
  onImport,
  onClose,
}) => {
  const [jsonString, setJsonString] = useState(
    JSON.stringify(initialData, null, 2)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english_lessons_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonString(content);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(jsonString);
      const lessonsArray: Lesson[] = Array.isArray(parsed) ? parsed : [parsed];

      // Validate required fields
      for (const l of lessonsArray) {
        if (!l.lesson_id || !l.title || !Array.isArray(l.games)) {
          throw new Error(
            `Invalid Lesson Schema: Each lesson must have 'lesson_id', 'title', and a 'games' array.`
          );
        }
      }

      setErrorMsg(null);
      onImport(lessonsArray);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content large shadow-2xl">
        <div className="modal-header">
          <h3>JSON Import / Export CMS Tool</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Inspect, edit, export, or import raw structured JSON for bulk updates across all lessons.
          </p>

          <div className="modal-toolbar mt-3">
            <button className="btn-secondary-small" onClick={handleCopy}>
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button className="btn-secondary-small" onClick={handleDownload}>
              <Download size={14} /> Download JSON
            </button>
            <label className="btn-secondary-small cursor-pointer">
              <Upload size={14} /> Upload File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {errorMsg && (
            <div className="alert-banner error mt-3">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <textarea
            value={jsonString}
            onChange={(e) => {
              setJsonString(e.target.value);
              setErrorMsg(null);
            }}
            rows={16}
            className="json-code-textarea mt-3"
            spellCheck={false}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleApplyImport}>
            Apply & Save JSON
          </button>
        </div>
      </div>
    </div>
  );
};
