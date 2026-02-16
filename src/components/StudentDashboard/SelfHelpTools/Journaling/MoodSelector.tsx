'use client';
import React from 'react';
import { Smile, Frown, Meh, CloudRain, Zap, AlertCircle } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string | null) => void;
}

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '🤩', color: 'bg-yellow-100' },
    { id: 'sad', label: 'Sad', emoji: '🤕', color: 'bg-blue-100' },
    { id: 'okay', label: 'Okay', emoji: '😐', color: 'bg-gray-100' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-orange-100' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: 'bg-purple-100' },
    { id: 'worried', label: 'Worried', emoji: '🧐', color: 'bg-red-100' },
  ];

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-gray-600 mb-6 text-lg font-medium">How are you feeling right now?</h3>
      <div className="flex justify-between items-center px-4 overflow-x-auto gap-4 scrollbar-hide">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            className={`flex flex-col items-center gap-3 transition-all duration-200 group ${
              selectedMood === mood.id ? 'transform scale-110' : 'hover:scale-105'
            }`}
          >
            <div className={`w-14 h-14 ${mood.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md transition-all`}>
              {mood.emoji}
            </div>
            <span className={`text-xs font-medium ${selectedMood === mood.id ? 'text-gray-900' : 'text-gray-400'}`}>
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
