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

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchSessionReportData = async (sessionId: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      setModalData(null);

      // Fetch session details
      const sessionResponse = await fetch(`/api/counselor/sessions/${sessionId}`);
      const sessionResult = await sessionResponse.json();

      if (!sessionResult.success) {
        throw new Error(sessionResult.message || "Failed to fetch session data");
      }

      const sessionData = sessionResult.data;

      let intakeData = null;
      const isFollowUpSession = sessionData.sessionType === "FOLLOW_UP";

      if (isFollowUpSession) {
        // Fetch current follow-up report
        const currentReportResponse = await fetch(`/api/counselor/sessions/${sessionId}/report`);
        const currentReportResult = await currentReportResponse.json();

        if (!currentReportResult.success) {
          throw new Error(currentReportResult.message || "Failed to fetch follow-up report data");
        }

        // Traverse to find the original intake data
        let originalIntakeData = null;
        let currentSessionId = sessionData.previousSessionId;
        let traversalCount = 0;
        const maxTraversal = 10;

        while (currentSessionId && traversalCount < maxTraversal) {
          try {
            const intakeResponse = await fetch(`/api/counselor/sessions/${currentSessionId}/intake`);
            const intakeResult = await intakeResponse.json();
            
            if (intakeResult.success && intakeResult.data) {
              originalIntakeData = intakeResult.data;
              break;
            } else {
              const prevSessionResponse = await fetch(`/api/counselor/sessions/${currentSessionId}`);
              const prevSessionResult = await prevSessionResponse.json();
              
              if (prevSessionResult.success && prevSessionResult.data?.previousSessionId) {
                currentSessionId = prevSessionResult.data.previousSessionId;
              } else {
                break;
              }
            }
          } catch (err) {
            break;
          }
          traversalCount++;
        }

        // Fetch previous reports
        const allPreviousReports = [];
        let currentPreviousSessionId = sessionData.previousSessionId;
        let reportTraversalCount = 0;

        while (currentPreviousSessionId && reportTraversalCount < maxTraversal) {
          try {
            const previousSessionResponse = await fetch(`/api/counselor/sessions/${currentPreviousSessionId}`);
            const previousSessionResult = await previousSessionResponse.json();
            
            if (!previousSessionResult.success) break;
            const prevSessionData = previousSessionResult.data;
            
            if (prevSessionData?.sessionType === "FOLLOW_UP") {
              const previousReportResponse = await fetch(`/api/counselor/sessions/${currentPreviousSessionId}/report`);
              const previousReportResult = await previousReportResponse.json();
              
              if (previousReportResult.success) {
                allPreviousReports.unshift({
                  sessionId: currentPreviousSessionId,
                  report: previousReportResult.data
                });
              }
            } else {
              break;
            }
            currentPreviousSessionId = prevSessionData?.previousSessionId;
          } catch (err) {
            break;
          }
          reportTraversalCount++;
        }

        const sessionReports: any[] = [];
        if (sessionData.previousSessionId && originalIntakeData) {
          const intakeBehavioralTags = originalIntakeData?.sessionReport?.behaviors || 
                                     originalIntakeData?.sessionReport?.behavioralTags || 
                                     originalIntakeData?.sessionReport?.customTags || [];
          sessionReports.push({
            sessionNumber: 1,
            sessionId: "intake-session",
            report: {
              behavioralTags: intakeBehavioralTags,
              summary: originalIntakeData?.sessionReport?.sessionSummary || originalIntakeData?.sessionReport?.summary || "Intake session completed",
              recommendations: originalIntakeData?.sessionReport?.recommendations || ["Continue with follow-up sessions as needed"],
              notes: originalIntakeData?.sessionReport?.notes || "Initial intake session completed."
            }
          });
        }

        allPreviousReports.forEach((prevReport, index) => {
          sessionReports.push({
            sessionNumber: sessionReports.length + 1,
            sessionId: prevReport.sessionId,
            report: prevReport.report
          });
        });

        sessionReports.push({
          sessionNumber: sessionReports.length + 1,
          sessionId: sessionId,
          report: currentReportResult.data
        });

        intakeData = {
          ...originalIntakeData,
          basicInfo: {
            ...(originalIntakeData?.basicInfo || {}),
            date: new Date(sessionData.scheduledAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            monthYear: new Date(sessionData.scheduledAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            place: originalIntakeData?.basicInfo?.place || sessionData.student?.school?.city || "Not specified",
            age: originalIntakeData?.basicInfo?.age || sessionData.student?.age?.toString(),
            gender: originalIntakeData?.basicInfo?.gender || sessionData.student?.gender,
            informant: originalIntakeData?.basicInfo?.informant || "Follow-up Session",
          },
          sessionReports,
          sessionReport: {
            behaviors: currentReportResult.data.behavioralTags || [],
            customTags: currentReportResult.data.behavioralTags || [],
            sessionSummary: currentReportResult.data.summary || currentReportResult.data.notes || "",
            manualRecommendations: currentReportResult.data.recommendations?.join("\n") || "",
            recommendations: currentReportResult.data.recommendations || [],
            selectedResources: [],
            notes: currentReportResult.data.notes || "",
          }
        };
      } else {
        const intakeResponse = await fetch(`/api/counselor/sessions/${sessionId}/intake`);
        const intakeResult = await intakeResponse.json();

        if (!intakeResult.success) {
          throw new Error(intakeResult.message || "Failed to fetch intake data");
        }

        intakeData = intakeResult.data;
      }

      setModalData({
        session: sessionData,
        intakeData,
        isFollowUpSession
      });
    } catch (err: any) {
      console.error("Error fetching modal session report:", err);
      setModalError(err.message || "Failed to load session report data");
    } finally {
      setModalLoading(false);
    }
  };

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
                            onClick={() => {
                              setSelectedSessionId(s.id);
                              fetchSessionReportData(s.id);
                            }}
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

      {/* Session Report Preview Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-[#1E293B] dark:text-white">Session Report Preview</h2>
                {modalData && (
                  <p className="text-sm text-[#767676] dark:text-slate-400 mt-0.5">
                    Student: <span className="font-semibold text-[#3A3A3A] dark:text-slate-200">{modalData.session.student ? `${modalData.session.student.firstName} ${modalData.session.student.lastName}` : "N/A"}</span> | 
                    Counselor: <span className="font-semibold text-[#3A3A3A] dark:text-slate-200">{modalData.session.counselor ? `${modalData.session.counselor.firstName} ${modalData.session.counselor.lastName}` : "N/A"}</span>
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedSessionId(null);
                  setModalData(null);
                  setModalError(null);
                }}
                className="p-2 text-[#767676] hover:text-[#3A3A3A] dark:hover:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D85F2] border-t-transparent"></div>
                  <p className="text-sm text-[#767676]">Generating report preview...</p>
                </div>
              ) : modalError ? (
                <div className="text-center py-16">
                  <p className="text-red-500 font-semibold mb-2">{modalError}</p>
                  <button
                    onClick={() => fetchSessionReportData(selectedSessionId)}
                    className="text-xs bg-[#F0F7FF] text-[#2D85F2] px-4 py-2 rounded-xl font-medium"
                  >
                    Retry Fetching
                  </button>
                </div>
              ) : !modalData ? (
                <div className="text-center py-16 text-[#767676]">
                  No report details found for this session.
                </div>
              ) : (() => {
                const { intakeData, session, isFollowUpSession } = modalData;
                const basicInfo = intakeData.basicInfo || {};
                const complaints = intakeData.complaints || {};
                const factors = intakeData.factors || {};
                const sessionReport = intakeData.sessionReport || {};

                const SectionTitle = ({ num, title }: { num: string; title: string }) => (
                  <div className="mb-4 mt-8 border-b border-[#E2E8F0] dark:border-slate-800 pb-2">
                    <h3 className="text-sm font-semibold tracking-wide text-[#2D85F2] uppercase">
                      {num} &nbsp; {title}
                    </h3>
                  </div>
                );

                const Row = ({ label, value }: { label: string; value: string }) => (
                  <div className="grid grid-cols-[140px_1fr] gap-4 py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">{label}</div>
                    <div className="text-sm text-[#1E293B] dark:text-slate-200">{value || "Not specified"}</div>
                  </div>
                );

                const Bullet = ({ text }: { text: string }) => (
                  <li className="flex gap-3 py-1.5 items-start">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2D85F2]" />
                    <span className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300">{text}</span>
                  </li>
                );

                const formatDuration = () => {
                  if (complaints.durationStart && complaints.durationEnd) {
                    return `From ${complaints.durationStart} to ${complaints.durationEnd}`;
                  }
                  return "Not specified";
                };

                const safeString = (value: any): string => {
                  if (value === null || value === undefined) return "";
                  if (typeof value === "string") return value;
                  if (typeof value === "number") return value.toString();
                  if (typeof value === "object") {
                    if (value.text && typeof value.text === "string") return value.text;
                    return JSON.stringify(value);
                  }
                  return String(value);
                };

                return (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
                      <h1 className="text-2xl font-bold text-[#1E293B] dark:text-white">Counselling Session Report</h1>
                      <div className="mt-2 md:mt-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#767676] dark:text-slate-400">
                        <span>Date: {basicInfo.date || "N/A"}</span>
                        <span>Period: {basicInfo.monthYear || "N/A"}</span>
                        <span>Place: {basicInfo.place || "N/A"}</span>
                      </div>
                    </div>

                    {isFollowUpSession ? (
                      <>
                        <SectionTitle num="01" title="BASIC INFORMATION" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                          <Row label="STUDENT NAME" value={`${session.student?.firstName || ""} ${session.student?.lastName || ""}`.trim()} />
                          <Row label="STUDENT ID" value={session.student?.studentId} />
                          <Row label="AGE" value={basicInfo.age ? `${basicInfo.age} Yrs` : `${session.student?.age || ""} Yrs`} />
                          <Row label="GENDER" value={basicInfo.gender || session.student?.gender} />
                          <Row label="CLASS" value={session.student?.classRef?.name || session.student?.classRef?.grade || "Not specified"} />
                        </div>

                        <SectionTitle num="02" title="PREDISPOSING & PRECIPITATING FACTORS" />
                        <ul className="space-y-1">
                          {intakeData.factors?.predisposing && intakeData.factors.predisposing.length > 0 ? (
                            intakeData.factors.predisposing.map((factor: string, index: number) => (
                              <Bullet key={index} text={factor} />
                            ))
                          ) : (
                            <Bullet text="Not specified" />
                          )}
                        </ul>

                        <SectionTitle num="03" title="FAMILY HISTORY" />
                        <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300">
                          {safeString(intakeData.familyHistory) || "Not specified"}
                        </p>

                        <SectionTitle num="04" title="PERSONAL HISTORY" />
                        <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300">
                          {safeString(intakeData.personalHistory?.text || intakeData.personalHistory) || "Not specified"}
                        </p>

                        <SectionTitle num="05" title="CHIEF COMPLAINTS" />
                        <p className="text-xs text-[#767676] dark:text-slate-400 mb-2">
                          Duration: {intakeData.complaints?.durationStart && intakeData.complaints?.durationEnd 
                            ? `${intakeData.complaints.durationStart} — ${intakeData.complaints.durationEnd}`
                            : "Not specified"}
                        </p>
                        <ul className="space-y-1">
                          {intakeData.complaints?.complaints && intakeData.complaints.complaints.length > 0 ? (
                            intakeData.complaints.complaints.map((complaint: string, index: number) => (
                              <Bullet key={index} text={complaint} />
                            ))
                          ) : (
                            <Bullet text="Not specified" />
                          )}
                        </ul>

                        {intakeData.sessionReports && intakeData.sessionReports.length > 0 ? (
                          intakeData.sessionReports.map((sessionReportData: any, index: number) => (
                            <div key={sessionReportData.sessionId} className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                              <SectionTitle 
                                num={`0${6 + index}`} 
                                title={`SESSION REPORT ${sessionReportData.sessionNumber}`} 
                              />
                              <p className="mb-3 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">OBSERVATIONS DURING SESSION</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {sessionReportData.report.behavioralTags && sessionReportData.report.behavioralTags.length > 0 ? (
                                  sessionReportData.report.behavioralTags.map((behavior: string, tagIndex: number) => (
                                    <span
                                      key={`${behavior}-${tagIndex}`}
                                      className="rounded-full border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800 px-3 py-1 text-xs font-medium text-[#1E293B] dark:text-slate-200"
                                    >
                                      {behavior}
                                    </span>
                                  ))
                                ) : (
                                  <span className="rounded-full border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800 px-3 py-1 text-xs text-[#767676]">
                                    Not specified
                                  </span>
                                )}
                              </div>

                              <p className="mb-2 mt-4 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">
                                SESSION SUMMARY / INTERPRETATION
                              </p>
                              <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                                {sessionReportData.report.summary || sessionReportData.report.notes || "Not specified"}
                              </p>

                              <p className="mb-2 mt-4 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">
                                RECOMMENDATIONS
                              </p>
                              <ul className="space-y-1">
                                {sessionReportData.report.recommendations && sessionReportData.report.recommendations.length > 0 ? (
                                  sessionReportData.report.recommendations.map((recommendation: string, idx: number) => (
                                    <Bullet key={idx} text={recommendation} />
                                  ))
                                ) : (
                                  <Bullet text="Not specified" />
                                )}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <>
                            <SectionTitle num="06" title="SESSION REPORT" />
                            <p className="mb-3 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">OBSERVATIONS DURING SESSION</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {sessionReport.behaviors && sessionReport.behaviors.length > 0 ? (
                                sessionReport.behaviors.map((behavior: string) => (
                                  <span
                                    key={behavior}
                                    className="rounded-full border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800 px-3 py-1 text-xs font-medium text-[#1E293B] dark:text-slate-200"
                                  >
                                    {behavior}
                                  </span>
                                ))
                              ) : (
                                <span className="rounded-full border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800 px-3 py-1 text-xs text-[#767676]">
                                  Not specified
                                </span>
                              )}
                            </div>

                            <p className="mb-2 mt-4 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">
                              SESSION SUMMARY / INTERPRETATION
                            </p>
                            <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                              {sessionReport.sessionSummary || "Not specified"}
                            </p>

                            <p className="mb-2 mt-4 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">
                              RECOMMENDATIONS
                        </p>
                            <ul className="space-y-1">
                              {sessionReport.recommendations && sessionReport.recommendations.length > 0 ? (
                                sessionReport.recommendations.map((recommendation: string, idx: number) => (
                                  <Bullet key={idx} text={recommendation} />
                                ))
                              ) : (
                                <Bullet text="Not specified" />
                              )}
                            </ul>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <SectionTitle num="01" title="BASIC INFORMATION" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                          <Row label="STUDENT NAME" value={`${session.student?.firstName || ""} ${session.student?.lastName || ""}`.trim()} />
                          <Row label="STUDENT ID" value={session.student?.studentId} />
                          <Row label="AGE" value={basicInfo.age ? `${basicInfo.age} Yrs` : `${session.student?.age || ""} Yrs`} />
                          <Row label="GENDER" value={basicInfo.gender || session.student?.gender} />
                          <Row label="CLASS" value={session.student?.classRef?.name || (session.student?.classRef?.grade ? `${session.student.classRef.grade} - ${session.student.classRef.section || ""}` : "") || "Not specified"} />
                          <Row label="INFORMANTS" value={basicInfo.informant} />
                        </div>

                        <SectionTitle num="02" title="PREDISPOSING & PRECIPITATING FACTORS" />
                        <ul className="space-y-1">
                          {factors.predisposing && factors.predisposing.length > 0 ? (
                            factors.predisposing.map((factor: string, idx: number) => (
                              <Bullet key={idx} text={factor} />
                            ))
                          ) : (
                            <Bullet text="Not specified" />
                          )}
                        </ul>

                        <SectionTitle num="03" title="FAMILY HISTORY" />
                        <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300">
                          {safeString(intakeData.familyHistory) || "Not specified"}
                        </p>

                        <SectionTitle num="04" title="PERSONAL HISTORY" />
                        <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300">
                          {safeString(intakeData.personalHistory?.text) || "Not specified"}
                        </p>

                        <SectionTitle num="05" title="CHIEF COMPLAINTS" />
                        <p className="text-xs text-[#767676] dark:text-slate-400 mb-2">{formatDuration()}</p>
                        <p className="mt-3 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">AS PER STUDENT</p>
                        <ul className="space-y-1 mt-2">
                          {complaints.complaints && complaints.complaints.length > 0 ? (
                            complaints.complaints.map((complaint: string, idx: number) => (
                              <Bullet key={idx} text={complaint} />
                            ))
                          ) : (
                            <Bullet text="Not specified" />
                          )}
                        </ul>

                        <SectionTitle num="06" title="SESSION REPORT" />
                        <p className="mb-3 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">OBSERVATIONS DURING SESSION</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {sessionReport.behaviors && sessionReport.behaviors.length > 0 ? (
                            sessionReport.behaviors.map((behavior: string) => (
                              <span
                                key={behavior}
                                className="rounded-full border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800 px-3 py-1 text-xs font-medium text-[#1E293B] dark:text-slate-200"
                              >
                                {behavior}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800 px-3 py-1 text-xs text-[#767676]">
                              Not specified
                            </span>
                          )}
                        </div>

                        <p className="mb-2 mt-4 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">
                          SESSION SUMMARY / INTERPRETATION
                        </p>
                        <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                          {sessionReport.sessionSummary || "Not specified"}
                        </p>

                        <p className="mb-2 mt-4 text-[11px] font-bold tracking-wide text-[#767676] dark:text-slate-400 uppercase">
                          RECOMMENDATIONS
                        </p>
                        <ul className="space-y-1">
                          {sessionReport.recommendations && sessionReport.recommendations.length > 0 ? (
                            sessionReport.recommendations.map((recommendation: string, idx: number) => (
                              <Bullet key={idx} text={recommendation} />
                            ))
                          ) : (
                            <Bullet text="Not specified" />
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50">
              <button
                onClick={() => {
                  setSelectedSessionId(null);
                  setModalData(null);
                  setModalError(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-[#767676] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
              {modalData && (
                <button
                  onClick={() => {
                    setSelectedSessionId(null);
                    router.push(`/admin/sessions/${selectedSessionId}/completed`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2D85F2] hover:bg-[#2574d6] text-white text-sm font-semibold transition-colors"
                >
                  View Full Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

