"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Calendar, UserRound, Loader2, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingDetail {
  id: string;
  purpose: string;
  discussion?: string;
  recommendations?: string;
  level: string;
  status: string;
  requestedBy: string;
  date: string;
  time: string;
  parentName: string;
  counselor: {
    firstName: string;
    lastName: string;
  };
  student: {
    firstName: string;
    lastName: string;
    classRef?: {
      grade: string;
      section: string;
    };
  };
}

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetingDetail();
  }, [meetingId]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/parent-meetings/${meetingId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMeeting(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching meeting detail:', error);
    } finally {
      setLoading(false);
    }
  };

  function StatusPill({ status }: { status: string }) {
    const styles =
      status === "PENDING"
        ? "bg-[#F59E0B]/15 text-[#F59E0B]"
        : status === "COMPLETED"
        ? "bg-[#10B981]/15 text-[#10B981]"
        : status === "CANCELLED"
        ? "bg-[#EF4444]/15 text-[#EF4444]"
        : "bg-[#3B82F6]/15 text-[#3B82F6]";
    const label = status === "PENDING" ? "Pending" : status === "COMPLETED" ? "Completed" : status === "CANCELLED" ? "Cancelled" : status;
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles}`}>
        {label}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-muted-foreground">Meeting not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[520px] space-y-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="rounded-2xl bg-[#FFFFFF] p-6 shadow-sm">
          <h1 className="text-[17px] font-semibold text-[#1E293B] flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Parent Meeting Details
          </h1>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Review the meeting information and parent details.
          </p>
        </div>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#64748B]">Student Name</span>
              <span className="text-[13px] font-medium text-[#1E293B]">
                {meeting.student.firstName} {meeting.student.lastName}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12px] text-[#64748B]">Class</span>
              <span className="text-[13px] font-medium text-[#1E293B]">
                {meeting.student.classRef ? `Class ${meeting.student.classRef.grade}-${meeting.student.classRef.section}` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Parent Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <UserRound className="h-3 w-3" /> Parent name
                </div>
                <div className="mt-1 text-[13px] text-[#1E293B]">{meeting.parentName}</div>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Mail className="h-3 w-3" /> Email
                </div>
                <div className="mt-1 text-[13px] text-[#1E293B]">Not available</div>
              </div>
            </div>
          </div>

          {/* Meeting Information */}
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Meeting Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Calendar className="h-3 w-3" /> Scheduled Date
                </div>
                <div className="mt-1 text-[13px] text-[#1E293B]">
                  {new Date(meeting.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })} at {meeting.time}
                </div>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Clock className="h-3 w-3" /> Status
                </div>
                <div className="mt-1">
                  <StatusPill status={meeting.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Purpose</h3>
            <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3 text-[13px] text-[#1E293B]/80">
              {meeting.purpose}
            </div>
          </div>

          {/* Discussion */}
          {meeting.discussion && (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Discussion</h3>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3 text-[13px] text-[#1E293B]/80 whitespace-pre-wrap">
                {meeting.discussion}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {meeting.recommendations && (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Recommendations</h3>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3 text-[13px] text-[#1E293B]/80 whitespace-pre-wrap">
                {meeting.recommendations}
              </div>
            </div>
          )}

          {/* Requested By */}
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Requested By</h3>
            <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
              <div className="text-[13px] text-[#1E293B] capitalize">
                {meeting.requestedBy === 'PARENT' ? 'Parent' : 'Counselor'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
