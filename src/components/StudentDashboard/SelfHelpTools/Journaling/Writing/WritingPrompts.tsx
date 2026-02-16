'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

const prompts = [
  "What made you smile today?",
  "Describe a challenge you faced and how you handled it?",
  "What are you grateful for right now?",
  "Write about someone who made your day better",
  "What emotion are you feeling most strongly right now?",
  "What's something you learned about yourself recently?",
  "Describe a place where you feel most at peace",
  "What would you tell your younger self?",
  "What's been on your mind lately?",
  "Describe a recent moment of joy",
];

interface WritingPromptsProps {
  onPromptSelect?: (prompt: string) => void;
}

export default function WritingPrompts({ onPromptSelect }: WritingPromptsProps) {
  const handlePromptClick = (prompt: string) => {
    onPromptSelect?.(prompt);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 w-[437px] shadow-sm h-[567px] flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-yellow-50 rounded-xl">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Writing Prompts</h3>
      </div>
      
      <p className="text-slate-500 text-sm mb-6 pl-12">
        Not sure what to write? Try one of these:
      </p>

      <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {prompts.map((prompt, index) => (
          <div 
            key={index}
            onClick={() => handlePromptClick(prompt)}
            className="p-4 rounded-2xl border border-slate-100 text-slate-600 text-sm transition-all cursor-pointer hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}
