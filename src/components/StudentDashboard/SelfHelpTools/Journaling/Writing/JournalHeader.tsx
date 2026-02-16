'use client';

import React from 'react';
import { ArrowLeft, Book, ChevronLeft, Mic, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import JournalTabs from '../JournalTabs';

interface JournalHeaderProps {
  activeTab?: 'writing' | 'audio' | 'art';
  onTabChange?: (tab: 'writing' | 'audio' | 'art') => void;
}

export default function JournalHeader({ activeTab = 'writing', onTabChange }: JournalHeaderProps) {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/students');
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Self-Help Tool</span>
      </button>

      {/* Header Content */}
      
      
              {/* Page Title Section */}
              <div className="flex items-start gap-4 mb-10">
                <div className="w-16 h-16 bg-[#E3F2FD] rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                   <Book className="w-8 h-8 text-[#2D9CDB]" />
                </div>
                <div className="pt-1">
                   <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-1">Journaling</h1>
                   <p className="text-gray-500 text-lg">Do freely in your private space</p>
                </div>
              </div>

      {/* Tabs */}
      <JournalTabs activeTab={activeTab} setActiveTab={onTabChange || (() => {})} />
      
    </div>
  );
}
