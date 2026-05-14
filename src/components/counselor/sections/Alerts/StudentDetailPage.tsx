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
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-gray-600">{label}</span>
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />}
      </div>
      {value && (
        <div className="mt-3 text-[26px] font-bold leading-none tracking-tight text-gray-900">
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
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[14px] font-semibold text-blue-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
                {fullName}
              </h1>
              <span className="inline-flex h-6 items-center rounded-full bg-red-100 px-2.5 text-[11px] font-semibold text-red-700">
                Level 01
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-gray-600">
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
            <div className="mt-1 text-[12px] text-gray-500">
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
          iconColor="text-blue-600" 
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
          iconColor="text-orange-600" 
        />
        <StatCard 
          label="Engagement Status" 
          badge={getEngagementBadge(stats.engagementStatus)} 
        />
      </div>

      {/* Key Observations */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-[16px] font-semibold text-gray-900">Key Observations</h2>
        <p className="mt-1 text-[12px] text-gray-600">
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
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-[16px] font-semibold text-gray-900">Previous Alerts</h2>
        <ul className="mt-4 space-y-4">
          {previousAlerts.map((alert) => (
            <li key={alert.id} className="flex items-center gap-3">
              {alert.severity === "destructive" ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />
              ) : alert.severity === "success" ? (
                <CircleAlert className="h-4 w-4 shrink-0 text-green-600" strokeWidth={2} />
              ) : (
                <CircleAlert className="h-4 w-4 shrink-0 text-orange-600" strokeWidth={2} />
              )}
              <span
                className={[
                  "flex-1 text-[13px]",
                  alert.status === "Resolved" ? "text-gray-600" : "text-gray-900",
                ].join(" ")}
              >
                {alert.description}
              </span>
              <span
                className={[
                  "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold",
                  alert.status === "Active"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700",
                ].join(" ")}
              >
                {alert.status}
              </span>
              <span className="w-[80px] text-right text-[12px] text-gray-600">
                {new Date(alert.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Counseling History */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-[16px] font-semibold text-gray-900">Counseling History</h2>
        <ul className="mt-4 space-y-3">
          {counselingHistory.map((session) => (
            <li
              key={session.id}
              className={[
                "rounded-xl border p-4",
                session.highlight ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-gray-900">{session.name}</span>
                    {session.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex h-5 items-center rounded-full border border-gray-300 px-2 text-[10px] font-medium text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[13px] text-gray-600">{session.text}</p>
                </div>
                <span className="shrink-0 text-[12px] text-gray-600">{session.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Platform Activity */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-[16px] font-semibold text-gray-900">Platform Activity</h2>
        <div className="mt-6 flex gap-4">
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
