"use client";

import React, { useState, useEffect } from "react";
import { ParentLayout } from "../layout/ParentLayout";
import { BookOpen, Link2, HelpCircle, Trophy, TrendingUp, Check, Circle } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

export function ActivitySection() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/parent/activity');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D85F2]"></div>
          <p className="text-[#707D8F] mt-4 font-medium">Loading child's activity...</p>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        <header>
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#3A3A3A]">Activity</h1>
          <p className="mt-2 text-sm sm:text-[16px] text-[#707D8F]">
            A simple view of what {data?.childName || 'Alex'} has been working on. No chat or emotional data is shown.
          </p>
        </header>

        <Card>
          <CardTitle>Today's Summary</CardTitle>
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 rounded-[20px] border border-[#F1F5F9] bg-[#F8FAFC] p-4 sm:p-6">
            <Stat 
              icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />} 
              value={data?.summary?.toolsUsed || "0"} 
              label="Tools Used" 
            />
            <div className="h-[1px] w-full bg-[#F1F5F9] sm:hidden" />
            <Stat 
              icon={<Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />} 
              value={data?.summary?.exercisesDone || "0"} 
              label="Exercises Done" 
            />
            <div className="h-[1px] w-full bg-[#F1F5F9] sm:hidden" />
            <Stat 
              icon={<HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />} 
              value={data?.summary?.challenges || "0"} 
              label="Challenges" 
            />
          </div>
        </Card>

        <Card>
          <CardTitle icon={<Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}>Challenges</CardTitle>
          <ul className="mt-2 sm:mt-4 divide-y divide-[#F1F5F9]">
            {data?.challenges?.length > 0 ? (
              data.challenges.map((challenge: any, idx: number) => (
                <ChallengeRow key={idx} name={challenge.name} status={challenge.status} />
              ))
            ) : (
              <li className="py-6 text-center text-[#707D8F] text-[13px] sm:text-[14px]">No challenges assigned recently</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardTitle icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500" />}>Today's Activity</CardTitle>
          <ul className="mt-2 sm:mt-4 divide-y divide-[#F1F5F9]">
            {data?.activity?.length > 0 ? (
              data.activity.map((item: any, idx: number) => (
                <ActivityRow key={idx} name={item.name} time={item.time} />
              ))
            ) : (
              <li className="py-6 text-center text-[#707D8F] text-[13px] sm:text-[14px]">No activity recorded today</li>
            )}
          </ul>
        </Card>
      </div>
    </ParentLayout>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] sm:rounded-[24px] border border-[#E5E5E5] bg-white p-5 sm:p-8 shadow-sm">
      {children}
    </section>
  );
}

function CardTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base sm:text-[18px] font-bold text-[#3A3A3A]">
      {icon}
      {children}
    </h2>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center py-2 sm:py-0">
      <div className="mb-1">{icon}</div>
      <div className="text-xl sm:text-[28px] font-bold text-[#3A3A3A]">{value}</div>
      <div className="text-[10px] sm:text-[12px] font-semibold text-[#707D8F] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ChallengeRow({
  name,
  status,
}: {
  name: string;
  status: "completed" | "in_progress" | "assigned";
}) {
  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {status === "completed" ? (
          <Check className="h-5 w-5 rounded-full bg-emerald-500 p-1 text-white" />
        ) : (
          <Circle className="h-5 w-5 text-[#94A3B8]" />
        )}
        <span className="text-[16px] font-medium text-[#3A3A3A]">{name}</span>
      </div>
      <StatusBadge status={status} />
    </li>
  );
}

function StatusBadge({ status }: { status: "completed" | "in_progress" | "assigned" }) {
  const map = {
    completed: { label: "Completed", cls: "bg-[#EEFEF4] text-[#16A249]" },
    "in_progress": { label: "In progress", cls: "bg-[#F0F7FF] text-[#2D85F2]" },
    assigned: { label: "Assigned", cls: "bg-[#F1F5F9] text-[#64748B]" },
  } as const;
  
  const normalizedStatus = status.toLowerCase().replace('_', '-') as keyof typeof map;
  const { label, cls } = map[normalizedStatus] || map.assigned;
  
  return (
    <span className={`rounded-full px-4 py-1 text-[12px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function ActivityRow({ name, time }: { name: string; time: string }) {
  return (
    <li className="py-4">
      <div className="text-[16px] font-medium text-[#3A3A3A]">{name}</div>
      <div className="text-[12px] text-[#707D8F] font-medium mt-0.5">{time}</div>
    </li>
  );
}
