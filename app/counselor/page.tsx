'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  AlertTriangle,
  Calendar,
  UserCheck,
  CheckCircle2,
  Video,
  Award,
  CalendarCheck,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    highRiskAlerts: string;
    todaySessions: string;
    todayParentMeetings: string;
    completedSessions: string;
  };
  students: {
    initials: string;
    name: string;
    active: string;
    level: number;
  }[];
  recentSessions: {
    name: string;
    type: string;
    date: string;
  }[];
  upcomingSessions: {
    name: string;
    type: string;
    date: string;
  }[];
  lineData: any[];
  barData: any[];
}

export default function CounselorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recent" | "upcoming">("recent");

  useEffect(() => {
    if (!authLoading && (!user || user.role.name !== 'COUNSELOR')) {
      router.push('/');
      return;
    }
    if (user?.role.name === 'COUNSELOR') {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/counselor/dashboard-stats');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
    
  }

  if (!user || user.role.name !== 'COUNSELOR' || !data) {
    return null;
  }

  const sessionsList = tab === "recent" ? data.recentSessions : data.upcomingSessions;

  const statCards = [
    { label: "High Risk Alerts", value: data.stats.highRiskAlerts, Icon: AlertTriangle, bg: "bg-red-500" },
    { label: "Today's Sessions", value: data.stats.todaySessions, Icon: Calendar, bg: "bg-blue-500" },
    { label: "Today's Parent Meetings", value: data.stats.todayParentMeetings, Icon: UserCheck, bg: "bg-purple-500" },
    { label: "Completed Sessions", value: data.stats.completedSessions, Icon: CheckCircle2, bg: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-3">
      <div className="mx-auto max-w-8xl space-y-6">
        <header>
          <h1 className="text-3xl font-medium tracking-tight text-[#3A3A3A]">Dashboard</h1>
          <p className="mt-1 text-[#767676]">Welcome back, {user.firstName} 👋</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="flex items-start justify-between rounded-2xl border border-[#E1E1E1] bg-white px-5 py-7 ">
              <div>
                <p className="text-[16px] text-[#3A3A3A]">{s.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#3A3A3A]">{s.value}</p>
              </div>
              <div className={cn("grid h-10 w-10 place-items-center rounded-[13px] text-white", s.bg)}>
                <s.Icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Priority Students */}
          <div className="rounded-[16px] border border-[#E1E1E1]/50 bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-medium text-[#3A3A3A]">Recent Escalations</h2>
            <div className="mt-4 space-y-2">
              {data.students.length > 0 ? data.students.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 rounded-[20px] p-4 transition-colors",
                    i === 0 ? "bg-[#F9FBFD] border border-[#F1F4F8]" : "hover:bg-[#F9FBFD] hover:border hover:border-[#F1F4F8]"
                  )}
                >
                  <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-[#F1F6FF] text-[16px] font-medium text-[#3A3A3A]">
                    {s.initials}
                  </div>
                  <div className="min-w-0 ml-2 flex-1">
                    <p className="font-medium text-[16px] py-1 text-[#0C3A50]">{s.name}</p>
                    <p className="text-[14px] text-[#80888C]">Last active: {s.active}</p>
                  </div>
                  <LevelBadge level={s.level} />
                  <button 
                    onClick={() => router.push('/counselor/sessions')}
                    className="inline-flex items-center mr-4 gap-1 text-sm font-medium text-[#3C83F6] cursor-pointer"
                  >
                    View Case <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )) : (
                <p className="text-center py-10 text-muted-foreground">No high priority students at the moment.</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#E1E1E1]/50 bg-white p-6">
              <h2 className="text-lg font-medium text-[#3A3A3A]">Quick Actions</h2>
              <div className="mt-4 space-y-3">
                <button 
                  onClick={() => router.push('/counselor/sessions')}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#3C83F6] px-4 py-3 text-[14px] text-white transition-colors hover:bg-blue-700"
                >
                  <Video className="h-5 w-5" /> Start Session
                </button>
                <button 
                  onClick={() => router.push('/counselor/challenges')}
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#E1E1E1]/50 bg-white px-4 py-3 font-normal text-[#3A3A3A] hover:bg-[#F1F4F8]"
                >
                  <Award className="h-5 w-5" /> Assign Challenge
                </button>
                <button 
                  onClick={() => router.push('/counselor/sessions')}
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#E1E1E1]/50 bg-white px-4 py-3 font-normal text-[#3A3A3A] hover:bg-[#F1F4F8]"
                >
                  <CalendarCheck className="h-5 w-5" /> Schedule Meeting
                </button>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#E1E1E1]/50 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#3A3A3A]">Sessions</h2>
                <button 
                  onClick={() => router.push('/counselor/sessions')}
                  className="text-sm font-normal text-[#3C83F6] cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="mt-4 flex gap-6 border-b border-[#E1E1E1]">
                {(["recent", "upcoming"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "relative pb-2 text-sm font-medium capitalize transition-colors",
                      tab === t ? "text-[#3A3A3A]" : "text-[#767676]"
                    )}
                  >
                    {t}
                    {tab === t && (
                      <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[#3A3A3A]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 divide-y divide-border">
                {sessionsList.length > 0 ? sessionsList.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.type} • {s.date}
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push('/counselor/sessions')}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#F1F6FF] px-2.5 py-1.5 text-xs font-medium text-[#3C83F6] hover:bg-[#F1F6FF] hover:border hover:border-[#E1E1E1] cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" /> Report
                    </button>
                  </div>
                )) : (
                  <p className="text-center py-6 text-xs text-muted-foreground">No {tab} sessions found.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Sessions &amp; Parent Meetings Over Time
            </h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis domain={[0, 'auto']} stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="Sessions"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Parent Meetings"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Sessions
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Parent Meetings
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-foreground">Challenges Assigned Over Time</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis domain={[0, 'auto']} stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="Challenges" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const styles =
    level === 3
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-4 py-2 mr-2 text-xs font-medium", styles)}>
      Level 0{level}
    </span>
  );
}
