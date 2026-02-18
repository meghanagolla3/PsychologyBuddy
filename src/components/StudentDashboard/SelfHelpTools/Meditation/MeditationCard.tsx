'use client';

import React from 'react';
import { Play, Clock, User } from 'lucide-react';

export interface MeditationCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  instructor?: string;
  type?: 'audio' | 'video';
  coverImage?: string;
  onClick?: () => void;
}

export interface CardProps {
  categories: any;
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'audio' | 'video';
  image: string;
  url: string;
  instructor?: string;
}

export default function MeditationCard({
  id,
  title,
  description,
  url,
  duration,
  instructor,
  type = 'audio',
  coverImage,
  onClick
}: MeditationCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} mins`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative aspect-square bg-gray-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-blue-500 ml-1" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-blue-500 ml-1" />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(duration)}</span>
          </div>
          <span className="capitalize">{type}</span>
        </div>
        
        {instructor && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <User className="w-3 h-3" />
            <span>{instructor}</span>
          </div>
        )}
      </div>
    </div>
  );
}
