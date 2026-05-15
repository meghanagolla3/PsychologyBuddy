"use client";

import React, { useState, useEffect } from "react";
import { ParentLayout } from "../layout/ParentLayout";
import { 
  Calendar, 
  BookOpen, 
  Dumbbell, 
  Trophy, 
  MessageSquare,
  TrendingUp
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/src/contexts/AuthContext";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";

const datasets: Record<string, { day: string; value: number }[]> = {
  Tools: [
    { day: "Mon", value: 3 },
    { day: "Tue", value: 3 },
    { day: "Wed", value: 2 },
    { day: "Thu", value: 6 },
    { day: "Fri", value: 4 },
    { day: "Sat", value: 7 },
    { day: "Sun", value: 5 },
  ],
  Exercises: [
    { day: "Mon", value: 1 },
    { day: "Tue", value: 2 },
    { day: "Wed", value: 3 },
    { day: "Thu", value: 2 },
    { day: "Fri", value: 4 },
    { day: "Sat", value: 3 },
    { day: "Sun", value: 2 },
  ],
  Streak: [
    { day: "Mon", value: 1 },
    { day: "Tue", value: 2 },
    { day: "Wed", value: 3 },
    { day: "Thu", value: 4 },
    { day: "Fri", value: 5 },
    { day: "Sat", value: 6 },
    { day: "Sun", value: 7 },
  ],
  Badges: [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 1 },
    { day: "Wed", value: 1 },
    { day: "Thu", value: 2 },
    { day: "Fri", value: 2 },
    { day: "Sat", value: 3 },
    { day: "Sun", value: 3 },
  ],
  Challenges: [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 1 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 1 },
    { day: "Fri", value: 1 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ],
};

const tabs = ["Tools", "Exercises", "Streak", "Badges", "Challenges"] as const;

export function ParentDashboard() {
  const { user } = useAuth();
  const [active, setActive] = useState<(typeof tabs)[number]>("Tools");
  const [upcomingMeeting, setUpcomingMeeting] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meetingRes, statsRes] = await Promise.all([
          fetch('/api/parent/meetings-test'),
          fetch('/api/parent/dashboard-stats')
        ]);

        if (meetingRes.ok) {
          const result = await meetingRes.json();
          if (result.success && result.data.length > 0) {
            const sorted = result.data
              .filter((m: any) => ['SCHEDULED', 'PENDING'].includes(m.status))
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            if (sorted.length > 0) {
              setUpcomingMeeting(sorted[0]);
            }
          }
        }

        if (statsRes.ok) {
          const result = await statsRes.json();
          if (result.success) {
            setDashboardStats(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { icon: BookOpen, label: "Tools Used", value: dashboardStats?.stats?.toolsUsed || 0 },
    { icon: Dumbbell, label: "Exercises Done", value: dashboardStats?.stats?.exercisesDone || 0 },
    { icon: Trophy, label: "Challenges", value: dashboardStats?.stats?.challenges || 0 },
    { icon: MessageSquare, label: "Total counsel Session", value: dashboardStats?.stats?.sessions || 0 },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && !dashboardStats) {
    return (
      <ParentLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D85F2]"></div>
          <p className="text-[#707D8F] mt-4 font-medium">Loading child's progress...</p>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        <header>
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#3A3A3A]">
            Welcome back, {user?.firstName || 'Parent'} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm sm:text-[16px] text-[#707D8F]">
            Here's how {dashboardStats?.childName || 'your child'} is doing this week.
          </p>
        </header>

        {/* Upcoming Meeting */}
        <section className="rounded-[20px] border border-[#2D85F2]/20 bg-[#2D85F2]/5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#2D85F2]">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-[18px] font-bold text-[#3A3A3A]">Upcoming Meeting</p>
                <p className="mt-1 text-xs sm:text-[14px] text-[#707D8F] line-clamp-2">
                  {upcomingMeeting ? (
                    `${formatDate(upcomingMeeting.date)} · ${upcomingMeeting.time} · ${upcomingMeeting.counselorName} · Duration : 01 hr`
                  ) : (
                    "No upcoming meetings scheduled"
                  )}
                </p>
              </div>
            </div>
            {upcomingMeeting && (
              <div className="flex gap-2 sm:gap-3">
                <Button className="flex-1 sm:flex-none rounded-[12px] bg-[#2D85F2] hover:bg-[#2D85F2]/90 px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm font-semibold">
                  Confirm
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none rounded-[12px] border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/5 px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm font-semibold">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Activity Summary */}
        <section className="rounded-[24px] border border-[#E5E5E5] bg-white p-5 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-[20px] font-bold text-[#3A3A3A]">Activity Summary</h2>
          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-[20px] bg-[#F8FAFC] p-4 sm:p-6 text-center border border-[#F1F5F9]"
              >
                <Icon className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-[#2D85F2]" />
                <p className="mt-2 sm:mt-3 text-xl sm:text-[28px] font-bold text-[#3A3A3A]">{value}</p>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-[13px] text-[#707D8F] font-medium leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Trends */}
        <section className="rounded-[24px] border border-[#E5E5E5] bg-white p-5 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg sm:text-[20px] font-bold text-[#3A3A3A]">Activity Trends</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={cn(
                    "rounded-[10px] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[13px] font-semibold transition-all",
                    active === tab
                      ? "bg-[#2D85F2] text-white shadow-md shadow-[#2D85F2]/20"
                      : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 h-[250px] sm:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={dashboardStats?.datasets?.[active] || []} 
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tickCount={5}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    fontSize: 11,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "#3A3A3A", fontWeight: 'bold', marginBottom: 2 }}
                  formatter={(value: any) => [`${value}`, active]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2D85F2"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, stroke: "#2D85F2", fill: "#ffffff", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-[14px] text-[#707D8F] bg-[#F8FAFC] p-3 sm:p-4 rounded-[12px] border border-[#F1F5F9]">
            <TrendingUp className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
            <span className="line-clamp-1">Your child used {dashboardStats?.stats?.toolsUsed || 0} tools this week — <span className="font-bold text-[#10B981]">live tracking!</span></span>
          </div>
        </section>
      </div>
    </ParentLayout>
  );
}
