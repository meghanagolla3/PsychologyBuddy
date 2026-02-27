"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Flame, Smile, BookOpen, Medal } from "lucide-react";
import React from "react";

/* ---------------------------------------------
   CONFIG (Memoized outside component)
---------------------------------------------- */
const statsConfig = [
  {
    key: "currentStreak",
    label: "Current Streaks",
    sublabel: "Days",
    icon: <Flame className="h-5 w-5 text-orange-500" />,
    gradient: "from-orange-100/60 to-orange-50/20",
  },
  {
    key: "totalCheckins",
    label: "Check-ins",
    sublabel: "Total",
    icon: <Smile className="h-5 w-5 text-purple-500" />,
    gradient: "from-purple-100/60 to-purple-50/20",
  },
  {
    key: "resourcesUsed",
    label: "Resources Used",
    sublabel: "Accessed",
    icon: <BookOpen className="h-5 w-5 text-green-500" />,
    gradient: "from-green-100/60 to-green-50/20",
  },
  {
    key: "badgesEarned",
    label: "Badges Earned",
    sublabel: "Unlocked",
    icon: <Medal className="h-5 w-5 text-blue-500" />,
    gradient: "from-blue-100/60 to-blue-50/20",
  },
];

/* --------------------------------------------------
   Fetcher (REST API)
--------------------------------------------------- */
async function fetchStats() {
  const res = await fetch("/api/student/stats");
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch stats");
  return data.data;
}

/* --------------------------------------------------
   Memoized Stat Card Component
--------------------------------------------------- */
const StatCard = React.memo(function StatCard({
  config,
  value,
  loading,
}: {
  config: any;
  value: number;
  loading: boolean;
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100">
      {/* Gradient BG */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-70`}
      />

      {/* Blob */}
      <svg
        className="absolute -right-6 -top-6 w-32 h-32 opacity-20"
        viewBox="0 0 200 200"
      >
        <path
          fill="currentColor"
          className="text-white"
          d="M43.3,-74.3C57.4,-66.4..."
          transform="translate(100 100)"
        />
      </svg>

      <CardContent className="relative p-6 flex flex-col gap-4">
        {/* Icon */}
        <div className="p-2 bg-white rounded-xl shadow-md w-fit z-10">
          {config.icon}
        </div>

        {/* Animated Number */}
        {loading ? (
          <Skeleton className="h-10 w-20 rounded-md" />
        ) : (
          <h2 className="text-4xl font-bold text-gray-900 z-10">
            {value.toString().padStart(2, "0")}
          </h2>
        )}

        {/* Labels */}
        <div className="z-10">
          <p className="text-sm font-medium text-gray-700">{config.sublabel}</p>
          <p className="text-xs text-gray-500 -mt-1">{config.label}</p>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

/* --------------------------------------------------
   Main Optimized StatsCards Component
--------------------------------------------------- */
export default function StatsCards() {
  /* --- Fetch stats with react-query --- */
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentStats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5, // cache 5 min
  });

  /* --- Animated numbers state --- */
  const [values, setValues] = useState<number[]>(
    statsConfig.map(() => 0)
  );

  const animationRef = useRef<number | null>(null);
  const startTimestamp = useRef<number>(0);

  /* --- Start animation when data loads --- */
  useEffect(() => {
    if (!data) return;

    const targetValues = statsConfig.map((c) => data[c.key]);
    const duration = 900; // ms

    function animate(timestamp: number) {
      if (!startTimestamp.current) startTimestamp.current = timestamp;
      const progress = Math.min((timestamp - startTimestamp.current) / duration, 1);

      const newValues = targetValues.map((end) => Math.floor(end * progress));
      setValues(newValues);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current!);
  }, [data]);

  /* --- Render --- */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
      {statsConfig.map((config, idx) => (
        <StatCard
          key={config.key}
          config={config}
          value={values[idx]}
          loading={isLoading}
        />
      ))}
    </div>
  );
}