"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Pencil,
  Sparkles,
  Trophy,
  User,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EditCounselorModal } from "@/src/components/admin/modals/EditCounselorModal";
import { useAuth } from "@/src/contexts/AuthContext";
import { useSchoolFilter } from "@/src/contexts/SchoolFilterContext";

interface CounselorProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
  };
  counselorProfile?: {
    profileImageUrl?: string;
    specialization?: string;
    department?: string;
  };
  sessionStats?: {
    todayCounsels: number;
    totalCounsels: number;
    declinedCounsels: number;
  };
}

interface Session {
  id: string;
  scheduledAt: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  notes?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  };
}

interface Challenge {
  id: string;
  level: string;
  category: string;
  context?: string;
  createdAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    email: string;
  };
}

type WellnessChallenge = {
  id: string;
  title: string;
  active: boolean;
  days: number;
  studentCount: number;
  completionPct: number;
  start?: string;
  end?: string;
  completedRatio?: string;
  students?: WellnessChallengeStudent[];
};

type WellnessChallengeStudent = {
  id: string;
  name: string;
  className: string;
  avatar?: string;
  status: "Completed" | "In progress";
};

type SlotStatus = "available" | "booked" | "declined" | "completed";

interface Slot {
  start: string;
  end: string;
  status: SlotStatus;
  student?: string;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function sessionsToSlots(sessions: Session[]): Slot[] {
  return sessions.map((session) => {
    const startTime = new Date(session.scheduledAt);
    const endTime = new Date(startTime.getTime() + 45 * 60000); // 45 min sessions
    const start = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
    const end = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

    let status: SlotStatus = "booked";
    if (session.status === "COMPLETED") status = "completed";
    if (session.status === "CANCELLED" || session.status === "MISSED") status = "declined";

    return {
      start,
      end,
      status,
      student: session.student ? `${session.student.firstName} ${session.student.lastName}` : undefined,
      className: session.student?.studentId || undefined,
    };
  });
}

function getMarkers(sessions: Session[]): SlotStatus[] {
  const set = new Set<SlotStatus>();
  sessions.forEach((session) => {
    let status: SlotStatus = "booked";
    if (session.status === "COMPLETED") status = "completed";
    if (session.status === "CANCELLED" || session.status === "MISSED") status = "declined";
    set.add(status);
  });
  return Array.from(set);
}

export default function CounselorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const counselorId = params.id as string;
  const { user } = useAuth();
  const { schools } = useSchoolFilter();

  const [counselor, setCounselor] = useState<CounselorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [viewMonth, setViewMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  // Dynamic data states
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [selectedDateSessions, setSelectedDateSessions] = useState<Session[]>([]);
  const [monthlySessions, setMonthlySessions] = useState<Session[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [wellnessChallenges, setWellnessChallenges] = useState<WellnessChallenge[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [openChallengeIdx, setOpenChallengeIdx] = useState(0);

  // Fetch counselor
  useEffect(() => {
    async function fetchCounselor() {
      try {
        const res = await fetch(`/api/counselors/${counselorId}`);
        const data = await res.json();
        if (data.success) {
          setCounselor(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch counselor:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounselor();
  }, [counselorId, isEditModalOpen]); // Re-fetch when modal closes to get updated data

  // Fetch session history
  useEffect(() => {
    async function fetchSessionHistory() {
      try {
        setLoadingSessions(true);
        const res = await fetch(`/api/counselors/${counselorId}/sessions/history`);
        const data = await res.json();
        if (data.success) {
          setSessionHistory(data.data.sessions || []);
        }
      } catch (error) {
        console.error("Failed to fetch session history:", error);
      } finally {
        setLoadingSessions(false);
      }
    }
    fetchSessionHistory();
  }, [counselorId]);

  // Fetch challenges
  useEffect(() => {
    async function fetchChallenges() {
      try {
        setLoadingChallenges(true);
        const res = await fetch(`/api/counselors/${counselorId}/challenges`);
        const data = await res.json();
        if (data.success) {
          setChallenges(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoadingChallenges(false);
      }
    }
    fetchChallenges();
  }, [counselorId]);

  // Fetch sessions for selected date
  useEffect(() => {
    async function fetchSessionsForDate() {
      try {
        const dateStr = selected.toISOString().split('T')[0];
        const res = await fetch(`/api/counselors/${counselorId}/sessions/by-date?date=${dateStr}`);
        const data = await res.json();
        if (data.success) {
          setSelectedDateSessions(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch sessions for date:", error);
      }
    }
    fetchSessionsForDate();
  }, [counselorId, selected]);

  // Fetch monthly sessions for calendar
  useEffect(() => {
    async function fetchMonthlySessions() {
      try {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const res = await fetch(`/api/counselors/${counselorId}/sessions/by-month?year=${year}&month=${month}`);
        const data = await res.json();
        if (data.success) {
          setMonthlySessions(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch monthly sessions:", error);
      }
    }
    fetchMonthlySessions();
  }, [counselorId, viewMonth]);

  // Fetch wellness challenges
  useEffect(() => {
    async function fetchWellnessChallenges() {
      try {
        const res = await fetch(`/api/counselors/${counselorId}/wellness-challenges`);
        const data = await res.json();
        if (data.success) {
          setWellnessChallenges(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch wellness challenges:", error);
      }
    }
    fetchWellnessChallenges();
  }, [counselorId]);

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month - 1, prevDays - i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    return cells;
  }, [viewMonth]);

  const slots = sessionsToSlots(selectedDateSessions);

  // Helper to get sessions for a specific date from monthly sessions
  const getSessionsForDate = (date: Date): Session[] => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return monthlySessions.filter(session => {
      const sessionDate = new Date(session.scheduledAt);
      return sessionDate >= dateStart && sessionDate <= dateEnd;
    });
  };
  const dayName = selected.toLocaleDateString("en-US", { weekday: "long" });
  const monthShort = selected.toLocaleDateString("en-US", { month: "short" });

  const stats = [
    { label: "Total Sessions", value: counselor?.sessionStats?.totalCounsels ?? 0, icon: CalendarIcon, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Today's Sessions", value: counselor?.sessionStats?.todayCounsels ?? 0, icon: CalendarIcon, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Completed", value: (counselor?.sessionStats?.totalCounsels ?? 0) - (counselor?.sessionStats?.declinedCounsels ?? 0), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Declined", value: counselor?.sessionStats?.declinedCounsels ?? 0, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading counselor profile...</div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Counselor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <button
          onClick={() => router.push("/admin/users/counselors")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Counselor
        </button>

        {/* Profile header */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={counselor.counselorProfile?.profileImageUrl || ""}
                  alt={`${counselor.firstName} ${counselor.lastName}`}
                />
                <AvatarFallback className="bg-purple-100 text-purple-600 font-medium text-lg">
                  {counselor.firstName[0]}{counselor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-slate-900">
                    {counselor.firstName} {counselor.lastName}
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {counselor.counselorProfile?.specialization || counselor.counselorProfile?.department || "Not specified"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  {counselor.email}
                </p>
              </div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm text-slate-500">{s.label}</p>
                <div className={cn("rounded-md p-1.5", s.bg)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="availability" className="w-full">
          <TabsList className="bg-transparent p-0 gap-2">
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md px-4 py-1.5"
            >
              Session History
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md px-4 py-1.5"
            >
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md px-4 py-1.5"
            >
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="p-6">
              {loadingSessions ? (
                <div className="text-center text-sm text-slate-500">Loading session history...</div>
              ) : sessionHistory.length === 0 ? (
                <div className="text-center text-sm text-slate-500">No session history to show.</div>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map((session) => (
                    <div key={session.id} className="border-b border-slate-100 pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {session.student ? `${session.student.firstName} ${session.student.lastName}` : 'Unknown Student'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {session.student?.studentId || 'No student ID'} · {new Date(session.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "font-medium",
                            session.status === "COMPLETED"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : session.status === "CANCELLED"
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          )}
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Calendar */}
              <Card className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {MONTHS[viewMonth.getMonth()]}
                    </h2>
                    <p className="text-xs text-slate-400">{viewMonth.getFullYear()}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                      }
                      className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                      }
                      className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
                  {WEEKDAYS.map((w, i) => (
                    <div key={i} className="py-2">{w}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map(({ date, inMonth }, i) => {
                    const isSelected = date.toDateString() === selected.toDateString();
                    const dateSessions = getSessionsForDate(date);
                    const markers = getMarkers(dateSessions);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelected(date)}
                        className={cn(
                          "relative aspect-square rounded-md text-sm cursor-pointer transition-colors",
                          inMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300",
                          isSelected && "bg-blue-500 text-white hover:bg-blue-500",
                        )}
                      >
                        <span className="block pt-1.5 font-medium">{date.getDate()}</span>
                        <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {markers.includes("available") && (
                            <span className={cn("h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-emerald-500")} />
                          )}
                          {markers.includes("booked") && (
                            <span className={cn("h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-blue-500")} />
                          )}
                          {markers.includes("declined") && (
                            <span className={cn("h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-rose-500")} />
                          )}
                          {markers.includes("completed") && (
                            <span className={cn("h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-slate-500")} />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-center gap-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Booked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Declined
                  </span>
                </div>
              </Card>

              {/* Schedule list */}
              <Card className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Schedule for
                </p>
                <h2 className="mb-4 text-xl font-semibold text-slate-900">
                  {dayName}, {monthShort} {selected.getDate()}
                </h2>

                <div className="space-y-2.5">
                  {slots.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 py-4">No sessions scheduled for this date</div>
                  ) : (
                    slots.map((slot, i) => (
                      <SlotRow key={i} slot={slot} />
                    ))
                  )}
                </div>
              </Card>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              <CalendarIcon className="mr-1 inline h-3 w-3" />
              Tip: click any date to view its slots, including past and future days.
            </p>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-500">Challenges Created</p>
                    <div className="rounded-md p-1.5 bg-blue-50">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{wellnessChallenges.length}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-500">Students Assigned</p>
                    <div className="rounded-md p-1.5 bg-amber-50">
                      <Trophy className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {wellnessChallenges.reduce((sum, c) => sum + c.studentCount, 0)}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-500">Completion Rate</p>
                    <div className="rounded-md p-1.5 bg-emerald-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {wellnessChallenges.length > 0
                      ? Math.round(wellnessChallenges.reduce((sum, c) => sum + c.completionPct, 0) / wellnessChallenges.length) + '%'
                      : '0%'}
                  </p>
                </Card>
              </div>

              {/* Wellness Challenges List */}
              <div className="space-y-3">
                {wellnessChallenges.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-slate-500">No wellness challenges to show.</Card>
                ) : (
                  wellnessChallenges.map((challenge, i) => (
                    <WellnessChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      open={openChallengeIdx === i}
                      onToggle={() => setOpenChallengeIdx(openChallengeIdx === i ? -1 : i)}
                    />
                  ))
                )}
              </div>

              {/* Escalation Alerts */}
              {loadingChallenges ? (
                <div className="text-center text-sm text-slate-500">Loading escalation alerts...</div>
              ) : challenges.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-slate-900 mt-6">Escalation Alerts</h3>
                  <div className="space-y-3">
                    {challenges.map((challenge) => (
                      <Card key={challenge.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  "font-medium",
                                  challenge.level === "CRITICAL"
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : challenge.level === "HIGH"
                                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                    : challenge.level === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                )}
                              >
                                {challenge.level}
                              </Badge>
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                {challenge.category}
                              </Badge>
                            </div>
                            <p className="mt-2 font-medium text-slate-900">
                              {challenge.student ? `${challenge.student.firstName} ${challenge.student.lastName}` : 'Unknown Student'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {challenge.student?.studentId || 'No student ID'} · {challenge.student?.email || 'No email'}
                            </p>
                            {challenge.context && (
                              <p className="mt-1 text-sm text-slate-600">{challenge.context}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                              Created: {new Date(challenge.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Counselor Modal */}
      {isEditModalOpen && counselor && (
        <EditCounselorModal
          counselor={counselor}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => setIsEditModalOpen(false)}
          schools={schools}
        />
      )}
    </div>
  );
}

function SlotRow({ slot }: { slot: Slot }) {
  const styles = {
    available: {
      bg: "bg-emerald-50",
      icon: "bg-white text-emerald-500",
      badge: "bg-emerald-500 text-white",
      label: "AVAILABLE",
      sub: (
        <span className="flex items-center gap-1 text-xs text-emerald-700">
          <CheckCircle2 className="h-3 w-3" /> Available
        </span>
      ),
    },
    booked: {
      bg: "bg-blue-50",
      icon: "bg-white text-blue-500",
      badge: "bg-blue-500 text-white",
      label: "BOOKED",
      sub: (
        <span className="flex items-center gap-1 text-xs text-blue-700">
          <User className="h-3 w-3" /> Booked · {slot.student} · {slot.className}
        </span>
      ),
    },
    declined: {
      bg: "bg-rose-50",
      icon: "bg-white text-rose-500",
      badge: "bg-rose-500 text-white",
      label: "DECLINED",
      sub: (
        <span className="flex items-center gap-1 text-xs text-rose-700">
          <XCircle className="h-3 w-3" /> Declined
        </span>
      ),
    },
    completed: {
      bg: "bg-slate-50",
      icon: "bg-white text-slate-500",
      badge: "bg-slate-500 text-white",
      label: "COMPLETED",
      sub: (
        <span className="flex items-center gap-1 text-xs text-slate-700">
          <CheckCircle2 className="h-3 w-3" /> Completed · {slot.student} · {slot.className}
        </span>
      ),
    },
  }[slot.status];

  if (!styles) return null;

  return (
    <div className={cn("flex items-center justify-between rounded-lg px-3 py-2.5", styles.bg)}>
      <div className="flex items-center gap-3">
        <div className={cn("grid h-8 w-8 place-items-center rounded-md", styles.icon)}>
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {slot.start} – {slot.end}
          </p>
          {styles.sub}
        </div>
      </div>
      <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold tracking-wider", styles.badge)}>
        {styles.label}
      </span>
    </div>
  );
}

function WellnessChallengeCard({
  challenge,
  open,
  onToggle,
}: {
  challenge: WellnessChallenge;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="p-5">
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-4 text-left cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{challenge.title}</h3>
              {challenge.active && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {challenge.days} days · {challenge.studentCount} Students · {challenge.completionPct}% Completed
            </p>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && challenge.students && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-4">
            <Field label="Duration" value={`${challenge.days} days`} />
            <Field label="Start" value={challenge.start!} />
            <Field label="End" value={challenge.end!} />
            <Field label="Completed" value={challenge.completedRatio!} />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-900">
              Assigned students ({challenge.studentCount})
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {challenge.students.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center gap-2.5">
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.className}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      s.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700",
                    )}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
