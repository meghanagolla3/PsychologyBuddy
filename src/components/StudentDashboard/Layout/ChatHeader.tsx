"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
// import { useLogout } from "@/src/hooks/use-logout";

interface ChatHeaderProps {
  onSummariesClick?: () => void;
}

export default function ChatHeader({ onSummariesClick }: ChatHeaderProps) {
  // const { logout, isLoading } = useLogout();

  return (
    <div className="bg-[#1B9EE0] text-white p-4 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Psychology Buddy</h1>
          <p className="text-sm opacity-90">Your emotional support companion</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSummariesClick}
            className="bg-white text-[#1B9EE0] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Summaries
          </button>
          {/* <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="text-white hover:bg-white/20 border-white/20 hover:border-white/40 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">
              {isLoading ? 'Logging out...' : 'Logout'}
            </span>
          </Button> */}
        </div>
      </div>
    </div>
  );
}
