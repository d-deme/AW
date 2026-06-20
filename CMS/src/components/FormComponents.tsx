// src/components/FormComponents.tsx
import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Eye, X, Save, Upload, Loader2 } from 'lucide-react';

// ---------- Form Wrapper ----------
interface FormWrapperProps {
  title: string;
  onSave: () => void;
  onCancel: () => void;
  onPreview?: () => void;
  children: React.ReactNode;
  errors?: Record<string, string>;
  isLoading?: boolean;
  submitText?: string;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  onSave,
  onCancel,
  onPreview,
  children,
  errors,
  isLoading,
  submitText = 'Save Changes',
}) => {
  return (
    <div className="bg-white dark:bg-[#070E1F] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-w-4xl w-full mx-auto text-slate-800 dark:text-slate-100">
      <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-5 bg-brand-teal rounded" />
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">{title}</h2>
        </div>
        <div className="flex items-center space-x-3">
          {onPreview && (
            <button
              onClick={onPreview}
              disabled={isLoading}
              className="px-3.5 py-2 text-brand-teal hover:bg-brand-teal/5 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider disabled:opacity-50"
            >
              <Eye size={16} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto bg-white dark:bg-[#070E1F]">
        {errors && Object.keys(errors).length > 0 && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start space-x-3">
            <div className="p-1.5 bg-rose-100 dark:bg-rose-950 rounded-full text-rose-600 dark:text-rose-400 mt-0.5">
              <X size={14} className="stroke-[3]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-rose-800 dark:text-rose-450">Form Verification Deficit</p>
              <ul className="mt-1 list-disc list-inside text-xs text-rose-600 dark:text-rose-400 space-y-0.5">
                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        )}
        <div className="space-y-6">{children}</div>
      </div>
      <div className="px-8 py-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-4 bg-slate-50/60 dark:bg-slate-900/60">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-2.5 bg-brand-teal hover:bg-brand-teal/90 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 min-w-[140px] shadow-lg shadow-brand-teal/10"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} className="stroke-[2.5]" />
              <span>{submitText}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ---------- Input Field (supports text, textarea, rich, file) ----------
interface InputFieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rich?: boolean;
  error?: string;
  maxLength?: number;
  rows?: number;
  accept?: string; // for file input
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required,
  multiline = false,
  rich = false,
  error,
  maxLength,
  rows = 4,
  accept = 'image/*',
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Rich text editor (TipTap)
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (rich && editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [rich, editor, value]);

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      onChange(data.url); // Set the URL as the value
    } catch (err) {
      console.error('Upload error:', err);
      // Optionally show an error to the user
    } finally {
      setIsUploading(false);
    }
  };

  // If it's a file input
  if (type === 'file') {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition">
            <Upload size={16} />
            <span>{isUploading ? 'Uploading...' : 'Choose Image'}</span>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          {value && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 truncate max-w-[150px]">{value.split('/').pop()}</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-rose-500 hover:text-rose-700 text-xs font-bold"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {isUploading && <Loader2 size={16} className="animate-spin text-brand-teal" />}
        </div>
        {error && <p className="text-[10px] font-bold tracking-wide text-rose-500 mt-1">{error}</p>}
      </div>
    );
  }

  // Existing render for other types
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {maxLength && !rich && (
          <span className={`text-[9px] font-mono font-bold ${value.length > maxLength ? 'text-rose-500' : 'text-slate-400'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {rich ? (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/10 transition-all">
          <EditorContent editor={editor} className="min-h-[200px] p-3" />
        </div>
      ) : multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all"
        />
      )}

      {error && <p className="text-[10px] font-bold tracking-wide text-rose-500 mt-1">{error}</p>}
    </div>
  );
};

// ---------- Select Field ----------
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center space-x-1">
        <span>{label}</span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[10px] font-bold tracking-wide text-rose-500 mt-1">{error}</p>}
    </div>
  );
};