"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

interface BadgeProgressData {
  progress: number;
  nextBadge: {
    name: string;
    description: string;
    icon: string;
  } | null;
  totalBadges: number;
  earnedBadges: number;
}

/* -----------------------------
   API Fetcher
----------------------------- */
async function fetchBadgeProgress(): Promise<BadgeProgressData> {
  const res = await fetch("/api/student/badge-progress");
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch badge progress");
  return json.data;
}

/* -----------------------------
   MAIN COMPONENT
----------------------------- */
export default function BadgeProgress() {
  /* QUERY */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["badgeProgress"],
    queryFn: fetchBadgeProgress,
    refetchInterval: 30000,
    staleTime: 60000,
  });

  /* ANIMATION STATE (Ref-based for perfect stability) */
  const [displayValue, setDisplayValue] = useState(0);
  const lastValueRef = useRef(0);         // Saves previous final progress value
  const animationFrame = useRef<number | undefined>(undefined); // Tracks RAF
  const isAnimating = useRef(false);       // Prevent overlapping animations

  /* -----------------------------
     Animate Progress (Perfect!)
  ----------------------------- */
  useEffect(() => {
    if (!data) return;
    const newProgress = data.progress;

    // If same value → do NOT reanimate
    if (newProgress === lastValueRef.current) return;

    // Cancel existing animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    const start = lastValueRef.current;
    const end = newProgress;
    const duration = 700;
    let startTime: number | null = null;
    isAnimating.current = true;

    function animate(timestamp: number) {
      if (document.hidden) return; // never animate in background tab
      if (!startTime) startTime = timestamp;

      const t = Math.min((timestamp - startTime) / duration, 1);
      const eased = start + (end - start) * t;

      setDisplayValue(Math.floor(eased));

      if (t < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
        lastValueRef.current = end; // Commit final value
      }
    }

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [data]);

  /* -----------------------------
     Compute Badge Messages
  ----------------------------- */
  const computeTexts = () => {
    if (!data) return { title: "", subtitle: "" };

    const remaining = Math.max(0, 100 - data.progress);
    const hasBadges = data.totalBadges > 0;

    const title =
      data.progress === 100
        ? "Mindfulness Champion 🎉"
        : data.nextBadge?.name ||
          (hasBadges ? "Badge Progress" : "No Badges Available");

    const subtitle =
      data.progress === 100
        ? "You've earned all available badges!"
        : !hasBadges
        ? "Admins haven't created any badges yet."
        : remaining <= 10
        ? `${remaining} actions away from your next badge ✨`
        : `${remaining} actions to your next badge. Keep going!`;

    return { title, subtitle };
  };

  const { title, subtitle } = computeTexts();

  /* -----------------------------
     Skeleton UI
  ----------------------------- */
  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="w-full h-3 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  /* -----------------------------
     Error UI
  ----------------------------- */
  if (isError || !data) {
    return (
      <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
        <p className="text-sm text-red-500 font-medium">Failed to load badge progress.</p>
        <p className="text-xs text-gray-400 mt-1">Please check your connection.</p>
      </div>
    );
  }

  /* -----------------------------
     MAIN UI
  ----------------------------- */
  return (
    <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
      <div className="flex items-center gap-4">
        {/* ICON BLOCK */}
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
          <Star className="h-6 w-6 text-white" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-800">Badge Progress</h3>
            <span className="text-xs text-gray-500">
              ({data.earnedBadges}/{data.totalBadges})
            </span>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>

          {/* PROGRESS BAR */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
            <div
              className={`h-full ${
                displayValue === 100 ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{ width: `${displayValue}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}