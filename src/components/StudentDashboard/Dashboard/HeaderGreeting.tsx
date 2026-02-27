"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import { useMemo } from "react";

export default function HeaderGreeting() {
  const { user } = useAuth();

  // Compute greeting only once on mount
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName = user?.firstName || " ";

  return (
    <div className="flex justify-between items-center w-full mt-8">
      <div>
        <h1 className="text-[24px] font-semibold text-gray-800">
          {greeting} {userName} 👋
        </h1>
        <p className="text-[16px] text-[#767676] mt-1">
          How are you feeling today?
        </p>
      </div>
    </div>
  );
}