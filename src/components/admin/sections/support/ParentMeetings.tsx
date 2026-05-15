"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Mail, CalendarDays, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MeetingAcceptModal } from "@/src/components/counselor/sections/ParentMeetings/MeetingAcceptModal";
import { AdminHeader } from "@/src/components/admin/layout/AdminHeader";
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
    className: "bg-[#EBFFF2] text-[#16A249] border-[#16A249]",
    dot: "bg-[#16A249]",
  },
  decline: {
    label: "Decline",
    className: "bg-[#FFF7F7] text-[#E53935] border-[#E53935]",
    dot: "bg-[#EF4444]",
  },
  requested: {
    label: "Requested",
    className: "bg-[#FFFAF3] text-[#F59E0B] border-[#F59E0B]",
    dot: "bg-[#F59E0B]",
  },
  schedule: {
    label: "Schedule",
    className: "bg-[#3B82F6]/5 text-[#3B82F6] border-[#3B82F6]",
    dot: "bg-[#3B82F6]",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[12px] border px-4 py-1 text-[14px] font-medium",
        s.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/admin/parent-meetings/${meeting.id}`);
  };

  return (
    <Card className="p-8 shadow-none rounded-[20px] border-none hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-medium text-[20px] text-[#3A3A3A]">{meeting.parent}'s Session</h3>
          <p className="text-[14px] text-[#767676]">
            {meeting.parent} <span className="mx-1">↔</span> {meeting.counselor}
          </p>
          <p className="text-[14px] text-[#767676]">
            {meeting.date} - {meeting.time}
          </p>
        </div>
        <StatusBadge status={meeting.status} />
      </div>
      <div className="my-4 h-px bg-[#D6D6D6]" />
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-[#767676]">
          Initiated by {meeting.initiatedBy}
        </span>
        <button
          onClick={handleViewDetails}
          className="text-[14px] font-medium text-[#2D85F2] hover:text-[#3B82F6]/80 cursor-pointer"
        >
          View Details
        </button>
      </div>
    </Card>
  );
}

async function fetchMeetings({ page = 1, limit = 9 }): Promise<any> {
  try {
    const response = await fetch(`/api/parent-meetings/all?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch meetings");
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch meetings");
    
    return {
      data: data.data.map((meeting: any) => ({
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
      })),
      pagination: data.pagination
    };
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return { data: [], pagination: { totalPages: 0, page: 1 } };
  }
}

export default function ParentMeetingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-parent-meetings", page],
    queryFn: () => fetchMeetings({ page, limit }),
  });

  const meetings = data?.data || [];
  const pagination = data?.pagination;

  const filtered = useMemo(() => {
    return meetings.filter((m: any) => {
      const matchesQuery =
        !query ||
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.parent.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || m.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [meetings, query, status]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f3f4]">
      <AdminHeader
        title="Parent Meetings"
        subtitle="All parent-counselor meetings and requests."
        showSchoolFilter={true}
        showTimeFilter={true}
        
      />

      <div className="mx-auto w-full max-w-8xl px-6 py-8">
        <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Parent and student"
                className="w-72 pl-9 bg-[#FFFFFF] border-none shadow-sm h-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36 bg-[#FFFFFF] border-none shadow-sm h-9">
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

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="text-sm text-[#64748B]">Loading meetings...</div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {filtered.map((m: any) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border-none shadow-sm rounded-[12px] bg-white text-[#767676] disabled:opacity-40"
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
              className="px-4 py-2 border-none shadow-sm rounded-[12px] bg-white text-[#767676] disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
