'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Heart, ChevronDown, BarChart2, Bookmark } from 'lucide-react';
import BackToDashboard from '../../Layout/BackToDashboard';
import Image from "next/image";

interface LibraryHeaderProps {
  onShowSaves?: () => void;
  isShowingSaves?: boolean;
}

export default function LibraryHeader({ onShowSaves, isShowingSaves = false }: LibraryHeaderProps) {
  return (
    <div className="w-full space-y-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl my-[30px] mx-[-20px] pt-3 sm:pt-5 sm:px-3 lg:px-4">
              <BackToDashboard />
            </div>

      {/* Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex mb-[20px] items-start gap-4 sm:w-[510px]">
          <Image 
                        src="/Content/Library.svg" 
                        alt="Psychology Buddy Logo" 
                        width={63}
                        height={63}
                        className="w-[30px] h-[30px] sm:w-[63px] sm:h-[63px]"
                      />
          <div className='ml-[5px]'>
            <h1 className="text-3xl md:text-[32px] font-bold text-slate-900 mb-2">
              Psychoeducation Library
            </h1>
            <p className="text-[#686D70] text-[16px] font-light">
              Explore microlearning content to support your emotional wellbeing
            </p>
          </div>
        </div> 

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mb-[40px]">
          <div className="relative flex-1 sm:w-[360px] sm:h-[47px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search here" 
              className="w-full h-12 pl-4 pr-4 rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3c83f6] focus:ring-offset-2  transition-all "
            />
          </div>
          
          <button className="h-12 px-6 rounded-full border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 w-[110px] h-[47px]">
            <span className='text-[#9F9F9F]'>All</span>
            <ChevronDown className="w-4 h-4 text-[#9F9F9F]" />
          </button>

          <button 
            onClick={onShowSaves}
            className={`h-[47px] w-[150px] px-6 rounded-full border font-base transition-colors flex items-center gap-2 whitespace-nowrap ${
              isShowingSaves 
                ? 'border-[#5982D4] bg-[#5982D4] text-white' 
                : 'border-[#A5C3FF] bg-[#A5C3FF]/10 text-[#5982D4] hover:bg-blue-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isShowingSaves ? 'All Articles' : 'Show Saves'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
