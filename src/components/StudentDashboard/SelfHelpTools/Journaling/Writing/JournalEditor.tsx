'use client';

import React from 'react';
import { Save, Trash2, PenLine } from 'lucide-react';

interface JournalEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onClear: () => void;
  loading?: boolean;
}

export default function JournalEditor({ 
  title, 
  content, 
  onTitleChange, 
  onContentChange, 
  onSave, 
  onClear, 
  loading = false 
}: JournalEditorProps) {
  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <input 
          type="text" 
          placeholder="Give your entry a title (optional)" 
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-12 px-6 rounded-xl bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Main Editor Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <PenLine className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Today's Entry</h3>
            <p className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] mb-4">
          <textarea 
            className="w-full h-full resize-none outline-none text-slate-600 placeholder:text-slate-300 leading-relaxed custom-scrollbar"
            placeholder="Start writing here...This is your Private space."
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
          ></textarea>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <span className="text-xs text-slate-400 font-medium">{content.length} characters</span>
          <span className="text-xs text-slate-400 italic">Your words are safe and private</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onSave}
          disabled={loading}
          className="flex-1 h-14 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Entry'}</span>
        </button>
        <button 
          onClick={onClear}
          className="w-14 h-14 bg-white border border-red-100 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
