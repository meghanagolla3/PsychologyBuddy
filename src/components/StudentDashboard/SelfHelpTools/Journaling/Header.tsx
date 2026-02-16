import React from 'react';
import { Bell, User, ChevronLeft, BookOpen, PenTool, Mic, Palette, ChevronDown, Check, Trash2, Eraser, Move, Lock, Sparkles, Smile, Frown, Meh, CloudRain, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="text-cyan-500">
           {/* Custom Logo SVG representation */}
           <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M16 2C18.2 2 20 3.8 20 6V9C20 11.2 18.2 13 16 13C13.8 13 12 11.2 12 9V6C12 3.8 13.8 2 16 2Z" fill="#3B82F6" fillOpacity="0.8"/>
             <path d="M10 14C10 12.34 11.34 11 13 11H19C20.66 11 22 12.34 22 14V20H10V14Z" fill="#3B82F6"/>
             <path d="M6 14C6 11.79 7.79 10 10 10H10.5C11.33 10 12 10.67 12 11.5V13H8V14C8 16.21 9.79 18 12 18H12.5C13.33 18 14 18.67 14 19.5V26C14 28.21 12.21 30 10 30H9C6.79 30 5 28.21 5 26V15C5 14.45 5.45 14 6 14Z" fill="#60A5FA"/>
           </svg>
        </div>
        <span className="font-bold text-xl text-cyan-600 tracking-tight">Psychology Buddy</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6 text-gray-500" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md ring-2 ring-gray-100">
          <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
