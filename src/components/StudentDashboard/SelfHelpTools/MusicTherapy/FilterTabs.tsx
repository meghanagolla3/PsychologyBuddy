'use client';

import React from 'react';

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  categories?: string[];
  goals?: string[];
}

export default function FilterTabs({ activeTab, onTabChange, categories = [], goals = [] }: FilterTabsProps) {
  const tabs = ['Recommended', ...categories, ...goals];

  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === tab
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
