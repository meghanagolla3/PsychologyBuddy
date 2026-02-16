"use client";
import { useState, useEffect } from "react";

interface AutomaticTerminationIndicatorProps {
  isActive: boolean;
  messageCount: number;
}

export default function AutomaticTerminationIndicator({ 
  isActive, 
  messageCount 
}: AutomaticTerminationIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isActive && messageCount >= 10) {
      // Show indicator after a delay to avoid being distracting
      const timer = setTimeout(() => {
        setShowIndicator(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowIndicator(false);
    }
  }, [isActive, messageCount]);

  if (!showIndicator) return null;

  return (
    <div className="mx-3 sm:mx-4 lg:mx-6 mb-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <p className="text-xs text-amber-700">
          Monitoring conversation for natural ending point...
        </p>
      </div>
    </div>
  );
}
