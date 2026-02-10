"use client";

import { X, Sparkles, Lightbulb, Shield } from "lucide-react";
import React from "react";
import Image from "next/image";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: {
    mainTopic: string;
    conversationStart: string;
    conversationAbout: string;
    reflection: string;
    createdAt?: string;
  } | null;
  onImport?: () => void;
}

export default function SummaryModal({
  isOpen,
  onClose,
  summary,
  onImport,
}: SummaryModalProps) {
  if (!isOpen || !summary) return null;

  // Get summary creation date and time (or current time as fallback)
  const summaryDate = summary.createdAt ? new Date(summary.createdAt) : new Date();
  const now = new Date();
  
  // Calculate relative date
  const getRelativeDate = (date: Date, reference: Date) => {
    const diffTime = Math.abs(reference.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return date < reference ? 'Yesterday' : 'Tomorrow';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // For older dates, show the actual date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== reference.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  const dateStr = getRelativeDate(summaryDate, now);
  const timeStr = summaryDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[743px] h-[90vh] max-h-[750px] rounded-[20px] shadow-xl animate-fadeIn border border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 sm:py-6 bg-white rounded-t-[20px] flex-shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1C76DC] to-[#4FC1F9] flex items-center justify-center shadow-lg">
              <Image 
                src="/Summary/Rectangle.png" 
                alt="Summary Icon"
                width={24}
                height={24}
                className="w-6 h-6 sm:w-[40px] sm:h-[35px] object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl sm:text-[24px] font-semibold text-gray-900 mb-1 sm:mb-2">
            Chat Summary
          </h2>

          {/* Subtitle */}
          <p className="text-center text-xs sm:text-[22px] text-[#767676] mb-3 sm:mb-3 px-2">
            A gentle summary of your conversation
          </p>

          {/* Date and Time */}
          <div className="flex flex-row sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-center">{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-4 sm:p-4 sm:pl-13 space-y-4 sm:space-y-5 overflow-y-auto">

          {/* Main Topic Badge */}
          <div className="flex flex-row sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[#767676] font-medium text-[16px] sm:text-[18px]">Main Topic :</span>
            <span className="px-3 sm:px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] sm:text-sm font-medium border border-emerald-200">
              {summary.mainTopic}
            </span>
          </div>

          {/* Summary Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              <h3 className="font-semibold text-[#2F3D43] text-sm sm:text-[21px]">Summary</h3>
            </div>

            <div className="bg-[#F8FFFF] p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
              {/* How the conversation started */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#2F3D43] text-xs sm:text-[16px]">
                  How the conversation started
                </h4>
                <p className="text-[#767676] text-xs sm:text-[14px] leading-relaxed">
                  {summary.conversationStart}
                </p>
              </div>

              {/* What the conversation was about */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#2F3D43] text-xs sm:text-[16px]">
                  What the conversation was about
                </h4>
                <p className="text-[#767676] text-xs sm:text-[14px] leading-relaxed">
                  {summary.conversationAbout}
                </p>
              </div>
            </div>
          </div>

          {/* Reflection Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/Summary/lightbulb.png" 
                alt="Reflection Icon"
                width={20}
                height={20}
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
              />
              <h3 className="font-semibold text-[#2F3D43] text-sm sm:text-[21px]">Reflection</h3>
            </div>

            <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl">
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed italic">
                {summary.reflection}
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 text-xs text-[#767676] bg-gray-50 p-3 rounded-lg">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] sm:text-[12px] leading-relaxed">This summary is private and visible only to you.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center px-4 sm:px-6 py-4 sm:py- bg-white rounded-b-[20px] flex-shrink-0">
          {onImport && (
            <div className="flex flex-col sm:flex-col items-center gap-2 space-y-2">
              <button
                onClick={onImport}
                className="w-[245px] sm:w-[345px] px-4 sm:px-5 py-3 rounded-full text-white font-medium text-sm sm:text-[16px] bg-gradient-to-r from-[#1B9EE0] to-[#4FC1F9] shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Import to chat
              </button>
              <p className="text-center text-[10px] sm:text-[12px] text-[#767676] px-2">
                This will help the chat continue from your earlier conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}