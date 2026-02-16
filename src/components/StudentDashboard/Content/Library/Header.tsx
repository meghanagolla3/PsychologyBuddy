'use client';

import React from 'react';
import { Bell, Search, Heart, ChevronDown, ChevronRight, Menu, ArrowLeft, Clock, Smile, Frown, TrendingUp, Users, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500">
            Psychology Buddy
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer group">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">
              2
            </div>
            <Bell className="w-6 h-6 text-slate-500 group-hover:text-slate-800 transition-colors" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 cursor-pointer ring-2 ring-slate-100 hover:ring-blue-200 transition-all">
            <img 
              src="https://picsum.photos/100/100" 
              alt="User" 
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
