"use client";

import { Flame, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useRef } from "react";

/* ------------------------------
   Fetcher (Typed, Production-Safe)
--------------------------------- */
async function fetchCurrentStreak(): Promise<{
  count: number;
  lastActive: string;
  bestStreak: number;
}> {
  const res = await fetch("/api/student/streak");
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch streak");
  return json.data;
}

/* ------------------------------
   Component
--------------------------------- */
export default function CurrentStreak() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["currentStreak"],
    queryFn: fetchCurrentStreak,
    refetchInterval: 60000, // 1 min refresh
    staleTime: 60000,
  });

  /* ------------------------------
     Number Animation (Smooth, Optimized)
  --------------------------------- */
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;

    const start = displayValue;
    const end = data.count;
    const duration = 700;
    let startTime = 0;

    function animate(time: number) {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = start + (end - start) * progress;

      setDisplayValue(Math.floor(eased));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [data]);

  /* ------------------------------
     Memoized Derived Values
  --------------------------------- */
  const streakDetails = useMemo(() => {
    if (!data)
      return { best: 0, lastActive: "N/A" };

    return {
      best: data.bestStreak ?? 0,
      lastActive: new Date(data.lastActive).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }, [data]);

  /* ------------------------------
     Loading State (Glass Skeleton)
  --------------------------------- */
  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 border border-white/20 bg-white/10 backdrop-blur-xl shadow-md animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-orange-200/40 rounded-md"></div>
          <div className="h-4 w-28 bg-white/30 rounded"></div>
        </div>
        <div className="h-10 w-16 bg-white/30 rounded mt-4"></div>
        <div className="h-3 w-40 bg-white/20 rounded mt-3"></div>
      </div>
    );
  }

  /* ------------------------------
     Error State
  --------------------------------- */
  if (isError || !data) {
    return (
      <div className="rounded-2xl p-5 border border-white/20 bg-white/10 backdrop-blur-xl shadow-md flex flex-col items-center justify-center h-[150px]">
        <Flame className="h-8 w-8 text-orange-400 mb-2" />
        <p className="text-sm text-gray-200">Failed to load streak</p>
      </div>
    );
  }

  /* ------------------------------
     MAIN UI — Glassmorphism Card
  --------------------------------- */
  return (
    <div
      className="
        rounded-2xl p-5
        border border-white/20 
        bg-gradient-to-br from-white/20 to-white/5
        backdrop-blur-xl shadow-md
        text-gray-900
        dark:text-gray-200
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        <h3 className="text-sm font-semibold">Current Streak</h3>
      </div>

      {/* Animated Number */}
      <div className="mt-4">
        <h2
          className="text-4xl font-bold text-orange-600 dark:text-orange-400"
          aria-live="polite"
        >
          {displayValue}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Days</p>
      </div>

      {/* Best Streak */}
      <div className="mt-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Best streak:{" "}
          <span className="font-medium">{streakDetails.best}</span> days
        </p>
      </div>

      {/* Encouragement */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        Keep going — you're doing amazing! 🔥
      </p>
    </div>
  );
}