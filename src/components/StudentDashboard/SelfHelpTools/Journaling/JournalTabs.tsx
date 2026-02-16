import React from 'react';
import { Pen, Mic, Palette } from 'lucide-react';

interface TabProps {
  activeTab: 'writing' | 'audio' | 'art';
  setActiveTab: (tab: 'writing' | 'audio' | 'art') => void;
}

export default function JournalTabs({ activeTab, setActiveTab }: TabProps) {
  const tabs: Array<{
    id: 'writing' | 'audio' | 'art';
    label: string;
    icon: React.ComponentType<any>;
  }> = [
    { id: 'writing', label: 'Write Journals', icon: Pen },
    { id: 'audio', label: 'Audio Journals', icon: Mic },
    { id: 'art', label: 'Art Journals', icon: Palette },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-full flex items-center justify-between gap-2 shadow-inner border border-white/60 mb-8 max-w-4xl mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 px-6 rounded-full text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === tab.id
              ? 'bg-[#2D9CDB] text-white shadow-lg shadow-blue-400/30 transform scale-[1.02]'
              : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
          }`}
        >
          {/* <tab.icon className="w-4 h-4" /> // Icons hidden in design but good for accessibility structure if needed */}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
