"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  AwardIcon,
  ChevronLeft,
  Flame,
  Shield,
  Trophy,
} from "lucide-react";
import StudentLayout from "@/src/components/StudentDashboard/Layout/StudentLayout";
import BadgeUnlockedModal from "./BadgeUnlockedModal";
import BackToDashboard from "../Layout/BackToDashboard";
import Image from "next/image";
import { ChallengesView } from "./ChallengesView";

type Tab = "badges" | "challenges";

interface EarnedBadge {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  description: string;
  requirement: string;
  date: string;
}

interface InProgressBadge {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  description: string;
  requirement:string;
  progress: number;
  color: string;
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-[#3B82F6] text-white shadow-md"
          : "text-[#64748B] hover:bg-[#F1F5F9]"
      }`}
    >
      {children}
    </button>
  );
}

export default function BadgesStreaksPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("badges");
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [inProgressBadges, setInProgressBadges] = useState<InProgressBadge[]>(
    []
  );
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/badges");
      const data = await response.json();

      if (data.success) {
        setEarnedBadges(data.data.earnedBadges || []);
        setInProgressBadges(data.data.inProgressBadges || []);
        setCurrentStreak(data.data.currentStreak || 0);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-gray-700"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackToDashboard />
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#3B82F61A] flex items-center justify-center flex-shrink-0">
            <AwardIcon className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Badge, Streaks And Challenges</h1>
            <p className="text-sm text-[#64748B]">Track Progress and Celebrate consistency</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm mb-8">
          <TabButton active={tab === "badges"} onClick={() => setTab("badges")}>
            Badges &amp; Streaks
          </TabButton>
          <TabButton active={tab === "challenges"} onClick={() => setTab("challenges")}>
            Challenges
          </TabButton>
        </div>

        {/* Conditional Content */}
        {tab === "challenges" ? <ChallengesView /> : (
          <div className="space-y-10">
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[20px] p-6 text-center border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="h-6 w-6 text-[#F59E0B]" />
                  <span className="text-3xl font-bold text-[#1E293B]">{currentStreak}</span>
                </div>
                <p className="text-sm text-[#64748B]">Current Streak</p>
              </div>
              <div className="bg-white rounded-[20px] p-6 text-center border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AwardIcon className="h-6 w-6 text-[#3B82F6]" />
                  <span className="text-3xl font-bold text-[#1E293B]">{earnedBadges.length}</span>
                </div>
                <p className="text-sm text-[#64748B]">Earned Badges</p>
              </div>
            </div>

            {/* Earned Badges Section */}
            <section>
              <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">
                Earned Badges ({earnedBadges.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-sm text-center flex flex-col items-center justify-center aspect-square"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-opacity-10",
                      badge.iconBg.replace('bg-', 'bg-')
                    )}>
                      <div className="scale-125">{badge.icon}</div>
                    </div>
                    <h3 className="font-bold text-[#1E293B] text-[15px] mb-1 leading-tight">
                      {badge.name}
                    </h3>
                    <p className="text-[12px] text-[#64748B] mb-3 leading-tight line-clamp-2">
                      {badge.requirement}
                    </p>
                    <p className="text-[11px] font-medium text-[#3B82F6]">
                      {badge.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* In Progress Badges Section */}
            <section>
              <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">
                In Progress ({inProgressBadges.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inProgressBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm"
                  >
                    <div className="flex gap-4 items-center">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-opacity-10",
                        badge.iconBg
                      )}>
                        <div className="scale-150">{badge.icon}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[#1E293B] text-[15px] truncate">
                            {badge.name}
                          </h3>
                          <span className="text-[11px] font-bold text-[#64748B]">
                            {badge.progress}%
                          </span>
                        </div>
                        <p className="text-[12px] text-[#64748B] mb-3 line-clamp-1">
                          {badge.requirement}
                        </p>
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              badge.color
                            )}
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}