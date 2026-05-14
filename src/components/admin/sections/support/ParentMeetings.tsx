"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Mail, CalendarDays, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MeetingAcceptModal } from "@/src/components/counselor/sections/ParentMeetings/MeetingAcceptModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type Status = "completed" | "decline" | "requested" | "schedule";

interface Meeting {
  id: string;
  title: string;
  parent: string;
  counselor: string;
  date: string;
  time: string;
  status: Status;
  initiatedBy: "parent" | "counselor";
  studentName?: string;
  studentClass?: string;
  parentEmail?: string;
  parentPhone?: string;
}

const statusStyles: Record<Status, { label: string; className: string; dot: string }> = {
  completed: {
    label: "Completed",
    className: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20",
    dot: "bg-[#10B981]",
  },
  decline: {
    label: "Decline",
    className: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20",
    dot: "bg-[#EF4444]",
  },
  requested: {
    label: "Requested",
    className: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20",
    dot: "bg-[#F59E0B]",
  },
  schedule: {
    label: "Schedule",
    className: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/20",
    dot: "bg-[#3B82F6]",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        s.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function MeetingCard({ meeting, onViewDetails, onDeclineViewDetails }: { meeting: Meeting; onViewDetails: (meeting: Meeting) => void; onDeclineViewDetails: (meeting: Meeting) => void }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/admin/parent-meetings/${meeting.id}`);
  };

  return (
    <Card className="p-5 shadow-sm border-[#E2E8F0] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-[#1E293B]">{meeting.title}</h3>
          <p className="text-sm text-[#64748B]">
            {meeting.parent} <span className="mx-1">↔</span> {meeting.counselor}
          </p>
          <p className="text-sm text-[#64748B]">
            {meeting.date} - {meeting.time}
          </p>
        </div>
        <StatusBadge status={meeting.status} />
      </div>
      <div className="my-4 h-px bg-[#E2E8F0]" />
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#64748B]">
          Initiated by {meeting.initiatedBy}
        </span>
        {meeting.status === 'completed' && (
          <button
            onClick={handleViewDetails}
            className="text-sm font-medium text-[#3B82F6] hover:text-[#3B82F6]/80 hover:underline"
          >
            View Details
          </button>
        )}
        {meeting.status === 'requested' && (
          <button
            onClick={() => onViewDetails(meeting)}
            className="text-sm font-medium text-[#3B82F6] hover:text-[#3B82F6]/80 hover:underline"
          >
            View Details
          </button>
        )}
        {meeting.status === 'decline' && (
          <button
            onClick={() => onDeclineViewDetails(meeting)}
            className="text-sm font-medium text-[#3B82F6] hover:text-[#3B82F6]/80 hover:underline"
          >
            View Details
          </button>
        )}
      </div>
    </Card>
  );
}

async function fetchMeetings(): Promise<Meeting[]> {
  try {
    const response = await fetch("/api/parent-meetings/all");
    if (!response.ok) throw new Error("Failed to fetch meetings");
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch meetings");
    
    return data.data.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.purpose || "Meeting",
      parent: meeting.parentName,
      counselor: meeting.counselorName,
      date: new Date(meeting.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: meeting.time,
      status: meeting.status === 'COMPLETED' ? 'completed' :
              meeting.status === 'CANCELLED' ? 'decline' :
              meeting.status === 'PENDING' ? 'requested' : 'schedule',
      initiatedBy: meeting.requestedBy === 'PARENT' ? 'parent' : 'counselor',
      studentName: meeting.studentName,
      studentClass: meeting.studentClass,
      parentEmail: meeting.parentEmail,
      parentPhone: meeting.parentPhone,
    }));
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }
}

export default function ParentMeetingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedDeclineMeeting, setSelectedDeclineMeeting] = useState<Meeting | null>(null);
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["admin-parent-meetings"],
    queryFn: fetchMeetings,
  });

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setModalOpen(true);
  };

  const handleDeclineViewDetails = (meeting: Meeting) => {
    setSelectedDeclineMeeting(meeting);
    setDeclineModalOpen(true);
  };

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      const matchesQuery =
        !query ||
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.parent.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || m.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [meetings, query, status]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Parent Meetings</h1>
            <p className="text-sm text-[#64748B]">
              All parent-counselor meetings and requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Parent and student"
                className="w-72 pl-9 bg-[#FFFFFF]"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36 bg-[#FFFFFF]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="decline">Decline</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="text-sm text-[#64748B]">Loading meetings...</div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filtered.map((m) => (
              <MeetingCard key={m.id} meeting={m} onViewDetails={handleViewDetails} onDeclineViewDetails={handleDeclineViewDetails} />
            ))}
          </div>
        )}

        <MeetingAcceptModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          meeting={selectedMeeting ? {
            id: selectedMeeting.id,
            studentName: selectedMeeting.studentName || 'Student',
            studentClass: selectedMeeting.studentClass,
            parentName: selectedMeeting.parent,
            parentEmail: selectedMeeting.parentEmail,
            parentPhone: selectedMeeting.parentPhone,
            date: selectedMeeting.date,
            time: selectedMeeting.time,
            purpose: selectedMeeting.title,
            requestedBy: selectedMeeting.initiatedBy === 'parent' ? 'PARENT' : 'COUNSELOR',
          } : null}
          readOnly
        />

        <Dialog open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
          <DialogContent className="w-full max-w-[520px] gap-0 rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[17px] font-semibold text-[#1E293B]">
                <User className="h-4 w-4" />
                Parent Meeting Details
              </DialogTitle>
              <p className="mt-1 text-[12px] text-[#64748B]">
                Review the meeting information and parent details.
              </p>
            </DialogHeader>

            {selectedDeclineMeeting && (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#64748B]">Student Name</span>
                    <span className="text-[13px] font-medium text-[#1E293B]">{selectedDeclineMeeting.studentName || 'N/A'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[12px] text-[#64748B]">Class</span>
                    <span className="text-[13px] font-medium text-[#1E293B]">{selectedDeclineMeeting.studentClass || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Parent Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <User className="h-3 w-3" /> Parent name
                      </div>
                      <div className="mt-1 text-[13px] text-[#1E293B]">{selectedDeclineMeeting.parent}</div>
                    </div>
                    <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <Mail className="h-3 w-3" /> Email
                      </div>
                      <div className="mt-1 truncate text-[13px] text-[#1E293B]">{selectedDeclineMeeting.parentEmail || 'Not available'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Meeting Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <CalendarDays className="h-3 w-3" /> Scheduled Date
                      </div>
                      <div className="mt-1 text-[13px] text-[#1E293B]">{selectedDeclineMeeting.date} at {selectedDeclineMeeting.time}</div>
                    </div>
                    <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <Clock className="h-3 w-3" /> Status
                      </div>
                      <div className="mt-1">
                        <span className="rounded-full bg-[#EF4444]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#EF4444]">
                          Declined
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Purpose</h3>
                  <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3 text-[13px] text-[#1E293B]/80">
                    {selectedDeclineMeeting.title || "No purpose provided"}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
