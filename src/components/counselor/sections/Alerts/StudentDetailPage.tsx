'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  CircleAlert,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  classRef?: {
    name: string;
  };
  school?: {
    name: string;
  };
  status: string;
  createdAt: string;
  lastActiveAt?: string;
  escalationAlerts: Array<{
    id: string;
    category: string;
    severity: string;
    description: string;
    createdAt: string;
    status: string;
  }>;
  counselingSessions: Array<{
    id: string;
    name: string;
    counselorName: string;
    notes: string;
    text: string;
    tags: string[];
    date: string;
    createdAt: string;
    highlight?: boolean;
  }>;
  platformActivity: Array<{
    type: string;
    count: number;
    fill?: string;
  }>;
  stats: {
    currentStreak: number;
    badgesEarned: number;
    challengesCompleted: number;
    engagementStatus: string;
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  badge,
}: {
  label: string;
  value?: string;
  icon?: React.ElementType;
  iconColor?: string;
  badge?: { text: string; tone: "destructive" | "orange" | "success" };
}) {
  return (
    <div className="rounded-[20px] bg-white p-5 border border-[#E1E1E1]/50">
      <div className="flex items-start justify-between">
        <span className="text-[18px] font-medium text-gray-600">{label}</span>
        {Icon && <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={2} />}
      </div>
      {value && (
        <div className="mt-6 text-[32px] font-medium leading-none tracking-tight text-gray-900">
          {value}
        </div>
      )}
      {badge && (
        <div className="mt-3">
          <span
            className={[
              "inline-flex h-7 items-center rounded-full px-3 text-[12px] font-semibold",
              badge.tone === "destructive" && "bg-red-100 text-red-700",
              badge.tone === "orange" && "bg-orange-100 text-orange-700",
              badge.tone === "success" && "bg-green-100 text-green-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching student details for ID:', studentId);
        const response = await fetch(`/api/counselor/students/${studentId}`);
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API Response data:', result);
        
        if (result.success) {
          console.log('Student data received:', result.data);
          console.log('Platform activity from API:', result.data.platformActivity);
          setStudent(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch student details');
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>
        <div className="text-center py-12">
          <div className="text-red-500 text-sm font-medium mb-2">Error loading student details</div>
          <div className="text-gray-500 text-xs">{error}</div>
        </div>
      </div>
    );
  }

  const initials = `${student.firstName[0]}${student.lastName[0]}`;
  const fullName = `${student.firstName} ${student.lastName}`;
  
  // Platform activity data from API
  const platformActivity = student.platformActivity || [];
  
  // Debug logging
  console.log('Platform Activity Data:', platformActivity);
  console.log('Platform Activity Details:');
  platformActivity.forEach((item, index) => {
    console.log(`  ${index}:`, item);
  });
  
  // Fallback data if API returns empty
  const chartData = platformActivity.length > 0 ? platformActivity : [
    { type: "Articles", count: 0, fill: "#10B981" },
    { type: "Journaling", count: 0, fill: "#3B82F6" },
    { type: "Music", count: 0, fill: "#8B5CF6" },
    { type: "Meditation", count: 0, fill: "#F59E0B" },
    { type: "Badges", count: 0, fill: "#EF4444" },
    { type: "Challenges", count: 0, fill: "#6366F1" },
  ];

  // Add colors to actual data if not present
  const coloredChartData = chartData.map((item, index) => ({
    ...item,
    fill: item.fill || [
      "#10B981", // Green - Articles
      "#3B82F6", // Blue - Journaling  
      "#8B5CF6", // Purple - Music
      "#F59E0B", // Amber - Meditation
      "#EF4444", // Red - Badges
      "#6366F1", // Indigo - Challenges
    ][index] || "#3B82F6"
  }));

  const previousAlerts = student.escalationAlerts || [
    { 
      status: "Active", 
      severity: "destructive" as const,
      id: "1",
      category: "Behavioral",
      description: "Student showed negative sentiment patterns in recent journal entries",
      createdAt: "2026-04-12T10:30:00Z"
    },
    { 
      status: "Resolved", 
      severity: "orange" as const,
      id: "2",
      category: "Engagement",
      description: "Student activity levels have decreased significantly",
      createdAt: "2026-03-25T14:20:00Z"
    },
  ];

  const counselingHistory = student.counselingSessions || [
    {
      name: "Dr. Mehra",
      tags: ["Stress", "Family"],
      text: "Discussed academic stress and family dynamics. Student expressed feeling overwhelmed. Introduced coping strategies.",
      date: "Apr 12,2026",
      highlight: true,
      id: "1",
      counselorName: "Dr. Mehra",
      notes: "Discussed academic stress and family dynamics. Student expressed feeling overwhelmed. Introduced coping strategies.",
      createdAt: "2026-04-12T09:00:00Z"
    },
  ];

  const stats = student.stats || {
    currentStreak: 2,
    badgesEarned: 3,
    challengesCompleted: 1,
    engagementStatus: "Low"
  };

  const getEngagementBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high':
        return { text: "High", tone: "success" as const };
      case 'medium':
        return { text: "Medium", tone: "orange" as const };
      case 'low':
        return { text: "Low", tone: "destructive" as const };
      default:
        return { text: "Unknown", tone: "orange" as const };
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </button>

      {/* Student header */}
      <div className="rounded-[24px] bg-white p-8 border border-[#E1E1E1]/50">
        <div className="flex items-start gap-4">
          <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full bg-[#ECF4FF] text-[18px] mt-3 font-medium text[#3C83F6]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-medium tracking-tight text-gray-900">
                {fullName}
              </h1>
              <span className="inline-flex h-6 items-center rounded-full bg-red-100 px-2.5 text-[11px] font-semibold text-red-700">
                Level 01
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[16px] text-[#767676]">
              <span>{student.email}</span>
              <span>•</span>
              <span>{student.classRef?.name || 'No class'}</span>
              {student.studentId && (
                <>
                  <span>•</span>
                  <span>ID: {student.studentId}</span>
                </>
              )}
            </div>
            <div className="mt-1 text-[16px] text-[#767676]">
              Last active: {student.lastActiveAt ? 
                new Date(student.lastActiveAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 
                'Unknown'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-4 gap-6">
        <StatCard 
          label="Current Streak" 
          value={`${stats.currentStreak} days`} 
          icon={TrendingUp} 
          iconColor="text-[#3C83F6]" 
        />
        <StatCard 
          label="Badges Earned" 
          value={stats.badgesEarned.toString()} 
          icon={Award} 
          iconColor="text-red-600" 
        />
        <StatCard 
          label="Challenges Completion" 
          value={stats.challengesCompleted.toString()} 
          icon={CheckCircle2} 
          iconColor="text-[#3C83F6]" 
        />
        <StatCard 
          label="Engagement Status" 
          badge={getEngagementBadge(stats.engagementStatus)} 
        />
      </div>

      {/* Key Observations */}
      <div className="mt-6 rounded-[24px] bg-white p-8 border border-[#E1E1E1]/50">
        <h2 className="text-[20px] font-medium text-gray-900">Key Observations</h2>
        <p className="mb-3 text-[14px] text-[#868585]">
          Source: Latest Alerts • {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
        <ul className="mt-4 space-y-3">
          {previousAlerts.slice(0, 3).map((alert) => (
            <li key={alert.id} className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" strokeWidth={2} />
              <span className="text-[13px] text-gray-900">{alert.description}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Previous Alerts */}
      <div className="mt-6 rounded-[24px] bg-white p-8 border border-[#E1E1E1]/50">
        <h2 className="text-[20px] font-medium text-gray-900">Previous Alerts</h2>
        <div className="mt-8 max-h-[380px] overflow-y-auto pr-4 custom-scrollbar">
          <ul className="space-y-0 relative">
            {/* Vertical Timeline Line */}
            {previousAlerts.length > 1 && (
              <div className="absolute left-[11px] top-6 bottom-6 w-[1px] bg-[#E1E1E1]" />
            )}
            
            {previousAlerts.map((alert, index) => (
              <li key={alert.id} className="relative flex items-center gap-6 pb-8 last:pb-0">
                {/* Icon Wrapper */}
                <div className="relative z-10 flex h-6 w-6 items-center justify-center bg-white rounded-full border-dashed border-gray-100">
                  {alert.status === "Active" || alert.status === "open" ? (
                    <CircleAlert className="h-[22px] w-[22px] shrink-0 text-[#F87171]" strokeWidth={2} />
                  ) : (
                    <CheckCircle2 
                      className={cn(
                        "h-[20px] w-[20px] shrink-0",
                        alert.status === "Resolved" || alert.status === "resolved" 
                          ? "text-[#22C55E]" 
                          : "text-[#F59E0B]"
                      )} 
                      strokeWidth={2} 
                    />
                  )}
                </div>

                {/* Content Area */}
                <div className="flex flex-1 items-center justify-between gap-4">
                  <span
                    className={cn(
                      "text-[15px] flex-1",
                      alert.status === "Resolved" || alert.status === "resolved" ? "text-[#868585]" : "text-[#1E293B] font-medium",
                    )}
                  >
                    {alert.description}
                  </span>

                  <div className="flex items-center gap-8">
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "inline-flex h-[26px] items-center rounded-full px-3 text-[12px] font-medium border",
                        alert.status === "Active" || alert.status === "open"
                          ? "bg-[#FFF1F1] text-[#F87171] border-[#FEE2E2]"
                          : "bg-[#F1FDF5] text-[#22C55E] border-[#DCFCE7]",
                      )}
                    >
                      {alert.status}
                    </span>

                    {/* Date */}
                    <span className="text-[14px] text-[#767676] min-w-[100px] text-right">
                      {new Date(alert.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Counseling History */}
      <div className="mt-6 rounded-[24px] bg-white p-8 border border-[#E1E1E1]/50">
        <h2 className="text-[20px] font-medium text-gray-900">Counseling History</h2>
        <div className="mt-6 max-h-[380px] overflow-y-auto pr-4 custom-scrollbar">
          <ul className="space-y-4">
          {counselingHistory.map((session) => (
            <li
              key={session.id}
              className={cn(
                "rounded-[20px] border p-2 transition-all",
                session.highlight ? "border-[#3C83F6]/30 bg-[#F6F9FE]" : "border-[#E1E1E1]/50 bg-white hover:border-[#E1E1E1]",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECF4FF] text-[#3C83F6]">
                  <CalendarDays className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[18px] font-medium text-[#1E293B]">{session.name}</span>
                      <div className="flex items-center gap-1.5">
                        {session.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex h-[22px] items-center rounded-full border border-[#E1E1E1] bg-white px-2.5 text-[11px] font-medium text-[#767676]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[14px] text-[#767676]">{session.date}</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#5A5A5A] line-clamp-2">{session.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

      {/* Platform Activity */}
      <div className="mt-6 rounded-[24px] bg-white p-8 border border-[#E1E1E1]/50">
        <h2 className="text-[20px] font-medium text-gray-900">Platform Activity</h2>
        <div className="mt-8 flex gap-6">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between h-[260px] pb-12 text-right pr-2">
            {[25, 20, 15, 10, 5, 0].map((tick) => (
              <div key={tick} className="text-[12px] text-gray-500 font-medium leading-none">
                {tick}
              </div>
            ))}
          </div>
          
          {/* Chart Area */}
          <div className="flex-1">
            {/* Grid Lines */}
            <div className="relative h-[260px] pb-12">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="absolute w-full border-t border-dashed border-gray-200"
                  style={{ bottom: `${(i / 5) * 100}%` }}
                />
              ))}
              
              {/* Bars */}
              <div className="flex items-end gap-3 h-full px-2 relative z-10">
                {chartData.map((item, index) => {
                  const maxVal = 25;
                  const heightPercent = Math.min((item.count / maxVal) * 100, 100);
                  const barHeight = Math.max(heightPercent, 2);
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 min-w-0 h-full justify-end">
                      <div 
                        className="w-full max-w-[48px] bg-[#3B82F6] rounded-t-md transition-all duration-500 ease-out"
                        style={{ height: `${barHeight}%`, minHeight: '2px' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* X-Axis Labels */}
            <div className="flex gap-3 px-2 mt-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 text-center min-w-0">
                  <div className="text-[11px] font-medium text-gray-600 leading-tight">
                    {item.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
