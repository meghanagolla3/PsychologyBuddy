"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, ChevronDown, CalendarDays, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "../../layout/AdminHeader";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDay } from "react-day-picker";

type SessionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
type SessionType = "INTAKE" | "FOLLOW_UP";

interface Session {
  id: string;
  counselorId: string;
  counselorName: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  schoolName?: string;
  sessionType: SessionType;
  level?: string;
  status: SessionStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  notes: string | null;
  outcome: string | null;
  followUpNeeded: boolean;
  section: string | null;
}

const statusStyles: Record<SessionStatus, string> = {
  SCHEDULED: "border-[#2D85F2]/30 text-[#2D85F2] dark:text-blue-400 bg-[#ECF4FF]",
  IN_PROGRESS: "border-orange-500/30 text-orange-700 dark:text-orange-400 bg-orange-500/5",
  COMPLETED: "border-[#16A249]/30 text-[#16A249] dark:text-[#16A249] bg-[#EBFFF2]",
  CANCELLED: "border-[#FB2D28]/30 text-[#FB2D28] dark:text-red-400 bg-[#FFF7F7]",
  MISSED: "border-[#C5C5C5]/30 text-[#C5C5C5] dark:text-gray-400 bg-[#C5C5C5]/5",
};

const statusDot: Record<SessionStatus, string> = {
  SCHEDULED: "bg-[#2D85F2]",
  IN_PROGRESS: "bg-orange-500",
  COMPLETED: "bg-[#16A249]",
  CANCELLED: "bg-[#FB2D28]",
  MISSED: "bg-[#C5C5C5]",
};

const statusLabels: Record<SessionStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Declined",
  MISSED: "Missed",
};

const sessionTypes = ["All Types", "INTAKE", "FOLLOW_UP"];
const statuses = ["All Status", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "MISSED"];

export default function Sessions() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sessionType, setSessionType] = useState("All Types");
  const [status, setStatus] = useState("All Status");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (sessionType !== "All Types") params.append('sessionType', sessionType);
      if (status !== "All Status") params.append('status', status);
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/admin/sessions?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        // Transform the data to match our interface
        const transformedSessions = result.data.map((session: any) => ({
          id: session.id,
          counselorId: session.counselorId,
          counselorName: session.counselor
            ? `${session.counselor.firstName} ${session.counselor.lastName}`
            : 'Unknown Counselor',
          studentId: session.studentId,
          studentName: session.student
            ? `${session.student.firstName} ${session.student.lastName}`
            : 'Unknown Student',
          studentClass: session.class?.name || session.student?.classRef?.name || session.section || 'N/A',
          schoolName: session.school?.name,
          sessionType: session.sessionType,
          level: session.escalation?.counselorAssignments?.find((a: any) => a.counselorId === session.counselorId)?.level || 
                 session.level || 
                 session.escalation?.severity,
          status: session.status,
          scheduledAt: session.scheduledAt,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          notes: session.notes,
          outcome: session.outcome,
          followUpNeeded: session.followUpNeeded,
          section: session.section,
        }));
        setSessions(transformedSessions);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change and reset to page 1
  useEffect(() => {
    setPage(1);
    fetchSessions();
  }, [sessionType, status]);

  // Debounced search and reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSessions();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-');
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return { date: dateStr, time: timeStr };
  };

  const calculateDuration = (startedAt: string | null, endedAt: string | null) => {
    if (!startedAt || !endedAt) return '-';
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins}m`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Sessions" subtitle="All counselling sessions across counselors." showTimeFilter={false} />

      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between border border-[#000000]/8 rounded-[12px] text-[#767676] min-w-[140px]">
                {sessionType === "All Types" ? "All Types" : sessionType}
                <ChevronDown className="h-4 w-4 ml-2 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sessionTypes.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setSessionType(t)}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between border border-[#000000]/8 rounded-[12px] text-[#767676] min-w-[140px]">
                {status === "All Status" ? "All Status" : statusLabels[status as SessionStatus]}
                <ChevronDown className="h-4 w-4 ml-2 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statuses.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                  {s === "All Status" ? s : statusLabels[s as SessionStatus]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
            <Input
              placeholder="Search counselor and student"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 border border-[#000000]/8 rounded-[12px] text-[#3A3A3A]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#3A3A3A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EEF1F6] border-b text-[14px] tracking-wide text-[#767676]">
                  <th className="px-6 py-3 font-normal text-center">COUNSELOR</th>
                  <th className="px-6 py-3 font-normal text-left">STUDENT</th>
                  <th className="px-6 py-3 font-normal text-left">TYPE</th>
                  <th className="px-6 py-3 font-normal text-left">LEVEL</th>
                  <th className="px-6 py-3 font-normal text-left">DATE</th>
                  <th className="px-6 py-3 font-normal text-left">TIME</th>
                  <th className="px-6 py-3 font-normal text-left">DURATION</th>
                  <th className="px-6 py-3 font-normal text-left">STATUS</th>
                  <th className="px-6 py-3 font-normal text-left">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      Loading sessions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No sessions found.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => {
                    const { date, time } = formatDateTime(s.scheduledAt);
                    const duration = calculateDuration(s.startedAt, s.endedAt);
                    
                    return (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-md flex items-center justify-center text-[#3A8BEF]">
                              <CalendarDays className="h-[21px] w-[21px] ml-2" />
                            </div>
                            <span className="font-semibold text-[#3A3A3A] text-[16px]">{s.counselorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text[16px] text-[#3A3A3A]">{s.studentName}</p>
                          <p className="text-[14px] text-[#767676]">{s.studentClass}</p>
                        </td>
                        <td className="px-6 py-4 text-[#3A3A3A] text-[16px]">
                          {s.sessionType === 'INTAKE' ? 'Intake' : (() => {
                            const studentFollowUps = sessions
                              .filter(prev => prev.studentId === s.studentId && prev.sessionType === 'FOLLOW_UP')
                              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
                            const count = studentFollowUps.findIndex(prev => prev.id === s.id) + 1;
                            return `Follow Up ${count}`;
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          {s.level ? (
                            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[13px] font-medium bg-[#FFE2E2] border border-[#DB3F22]/30 text-[#C90A0A]">
                              {s.level}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#3A3A3A] text-[15px] whitespace-nowrap">{date}</td>
                        <td className="px-6 py-4 text-[#3A3A3A] text-[15px] whitespace-nowrap">{time}</td>
                        <td className="px-6 py-4 text-[#3A3A3A] text-[15px]">{duration}</td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[12px] font-medium border",
                              statusStyles[s.status]
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[s.status])} />
                            {statusLabels[s.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => router.push(`/admin/sessions/${s.id}/completed`)}
                            className="text-[14px] font-medium bg-[#F0F7FF] px-4 py-2 rounded-[12px] text-[#2D85F2] hover:cursor-pointer hover:bg-[#e5f1ff]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination UI */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border-[#000000]/8 rounded-[12px] text-[#767676] disabled:opacity-40"
            >
              Previous
            </Button>

            <p className="text-sm text-[#767676]">
              Page <span className="font-medium text-[#3A3A3A]">{pagination.page}</span> of <span className="font-medium text-[#3A3A3A]">{pagination.totalPages}</span>
            </p>

            <Button
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border-[#000000]/8 rounded-[12px] text-[#767676] disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}