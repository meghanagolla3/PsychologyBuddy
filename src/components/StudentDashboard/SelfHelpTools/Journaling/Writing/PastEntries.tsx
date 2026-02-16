'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Eye } from 'lucide-react';

interface WritingJournal {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  mood?: string;
}

interface PastEntriesProps {
  journals: WritingJournal[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function PastEntries({ journals, onDelete, loading }: PastEntriesProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const openJournal = (journalId: string) => {
    router.push(`/students/journaling/${journalId}`);
  };

  const viewAllJournals = () => {
    router.push('/students/journaling/all');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="text-slate-500 mt-2">Loading journals...</p>
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No journals yet</p>
        <p className="text-slate-400 text-sm mt-1">Start writing to see your entries here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Journals</h2>
            <p className="text-slate-500 text-sm">See Your Latest Journals</p>
          </div>
        </div>
        <button 
          onClick={viewAllJournals}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          <span>View All</span>
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {journals.map((journal) => (
            <div 
              key={journal.id} 
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 transition-all cursor-pointer group"
              onClick={() => openJournal(journal.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    {journal.title || 'Untitled Entry'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(journal.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openJournal(journal.id);
                    }}
                    className="text-cyan-500 hover:text-cyan-600 transition-colors p-2 hover:bg-cyan-50 rounded-xl"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(journal.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                {journal.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
