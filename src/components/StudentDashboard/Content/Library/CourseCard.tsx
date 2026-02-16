'use client';

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
// import { motion } from 'framer-motion';

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  time: string;
  description: string;
  color: string;
  image: string;
  delay: number;
}

export default function CourseCard({ id, title, category, time, description, color, image, delay }: CourseCardProps) {
  // Map color strings to Tailwind classes
  // const colorMap: Record<string, { bg: string, tag: string, tagText: string }> = {
  //   purple: { bg: 'bg-purple-600', tag: 'bg-purple-100', tagText: 'text-purple-700' },
  //   pink: { bg: 'bg-pink-500', tag: 'bg-pink-100', tagText: 'text-pink-700' },
  //   blue: { bg: 'bg-blue-500', tag: 'bg-blue-100', tagText: 'text-blue-700' },
  //   green: { bg: 'bg-emerald-500', tag: 'bg-emerald-100', tagText: 'text-emerald-700' },
  //   indigo: { bg: 'bg-indigo-500', tag: 'bg-indigo-100', tagText: 'text-indigo-700' },
  //   orange: { bg: 'bg-orange-500', tag: 'bg-orange-100', tagText: 'text-orange-700' },
  //   teal: { bg: 'bg-teal-500', tag: 'bg-teal-100', tagText: 'text-teal-700' },
  //   red: { bg: 'bg-rose-500', tag: 'bg-rose-100', tagText: 'text-rose-700' },
  // };

  // const theme = colorMap[color] || colorMap.blue;

  const handleCardClick = () => {
    // Navigate to article detail page
    window.location.href = `/students/content/library/${id}`;
  };

  return (
    <div
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="group w-[399px] bg-white rounded-[13px] hover:shadow-xl hover:shadow-[#15A0EA33]/20 transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Area */}
      <div className={`h-[140px] w-full relative  `}>
        <div className="absolute  bg-black/10 " />
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-90 rounded-tl-[13px] rounded-tr-[13px] "
        />
        {/* Overlay gradient for text readability if needed, but we have card body below */}
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-5">
          <span className={`px-3 py-1 rounded-full bg-[#F2F8FF] text-[#1C76DC] text-xs font-medium tracking-wide `}>
            {category}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
        </div>

        <h3 className="text-[16px] font-bold text-slate-900 mb-3 leading-tight transition-colors">
          {title}
        </h3>
        
        <p className="text-[#767676] text-[13px] leading-relaxed mb-6 line-clamp-2">
          {description}
        </p>

        <div className="mt-auto">
          <button className="flex items-center gap-2 text-[#1C76DC] text-[13px] font-bold group/btn hover:gap-3 transition-all">
            Start Learning
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
