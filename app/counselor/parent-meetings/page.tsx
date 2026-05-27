'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarIcon, CalendarPlus, Clock, Eye, Play, Plus, User, Mail, FileText, CalendarDays, UserRound, Briefcase, CircleCheck, CalendarClock } from 'lucide-react';
import { AdminLoader } from '@/src/components/admin/ui/AdminLoader';
import { RingSpinner } from '@/components/ui/Spinners';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ParentMeetingModal } from '@/src/components/counselor/sections/ParentMeetings/ParentMeetingModal';
import { MeetingAcceptModal } from '@/src/components/counselor/sections/ParentMeetings/MeetingAcceptModal';

type Tab = "Pending" | "Upcoming" | "Completed" | "Cancelled";

interface Meeting {
  id: string;
  parentName: string;
  parentEmail: string;
  initials: string;
  studentName: string;
  start: string;
  end: string;
  note?: string;
  notes?: string;
  purpose?: string;
  level?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'IN_PROGRESS';
  requestedBy?: string;
  studentClass?: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[13px] font-medium text-[#1E293B]">
      {children} <span className="text-[#EF4444]">*</span>
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-lg border-[#E2E8F0] bg-[#E2E8F0]/40 px-3 pr-9 text-[14px] text-[#1E293B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
      >
        <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ScheduleSessionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [classValue, setClassValue] = useState("9th Class");
  const [section, setSection] = useState("Section - A");
  const [student, setStudent] = useState("Michael Chen");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sessionType, setSessionType] = useState("Session Intake");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[480px] gap-0 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold text-[#1E293B]">
            Schedule Session
          </DialogTitle>
        </DialogHeader>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Select Class</FieldLabel>
            <SelectField
              value={classValue}
              onChange={setClassValue}
              options={["7th Class", "8th Class", "9th Class", "10th Class"]}
            />
          </div>
          <div>
            <FieldLabel>Section</FieldLabel>
            <SelectField
              value={section}
              onChange={setSection}
              options={["Section - A", "Section - B", "Section - C"]}
            />
          </div>

          <div className="col-span-2">
            <FieldLabel>Student Name</FieldLabel>
            <SelectField
              value={student}
              onChange={setStudent}
              options={["Michael Chen", "Emma Thompson", "James Martinez", "Olivia Williams"]}
            />
          </div>

          <div>
            <FieldLabel>Date</FieldLabel>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-lg border-[#E2E8F0] bg-[#E2E8F0]/40 px-3 pr-9 text-[14px] text-[#1E293B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              />
              <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            </div>
          </div>
          <div>
            <FieldLabel>Time</FieldLabel>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 w-full rounded-lg border-[#E2E8F0] bg-[#E2E8F0]/40 px-3 pr-9 text-[14px] text-[#1E293B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              />
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            </div>
          </div>

          <div className="col-span-2">
            <FieldLabel>Session Type</FieldLabel>
            <SelectField
              value={sessionType}
              onChange={setSessionType}
              options={["Session Intake", "Follow-up", "Crisis Intervention", "Group Session"]}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            className="h-10 flex-1 rounded-lg bg-[#3B82F6] text-[14px] font-medium text-[#FFFFFF] hover:bg-[#3B82F6]/90"
            onClick={() => onOpenChange(false)}
          >
            Create
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-lg border-[#E2E8F0] text-[14px] font-medium"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MeetingDetailsDialog({
  meeting,
  onClose,
  onCancel,
}: {
  meeting: Meeting | null;
  onClose: () => void;
  onCancel: (id: string) => void;
}) {
  return (
    <Dialog open={!!meeting} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-full max-w-[520px] gap-0 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[17px] font-semibold text-[#1E293B]">
            <User className="h-4 w-4" />
            Parent Meeting Details
          </DialogTitle>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Review the meeting information, consent status, and parent details.
          </p>
        </DialogHeader>

        {meeting && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#64748B]">Student Name</span>
                <span className="text-[13px] font-medium text-[#1E293B]">{meeting.studentName}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[12px] text-[#64748B]">Risk Level</span>
                <span className="rounded-full bg-[#EF4444]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#EF4444]">
                  {meeting.level || 'Level 03'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Parent Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <User className="h-3 w-3" /> Parent name
                  </div>
                  <div className="mt-1 text-[13px] text-[#1E293B]">{meeting.parentName}</div>
                </div>
                <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="mt-1 truncate text-[13px] text-[#1E293B]">{meeting.parentEmail}</div>
                </div>
                <div className="col-span-2 rounded-lg border border-[#E2E8F0] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <FileText className="h-3 w-3" /> Consent
                  </div>
                  <div className="mt-1">
                    <span className="rounded-full bg-[#F59E0B]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#F59E0B]">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Meeting Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <CalendarIcon className="h-3 w-3" /> Scheduled Date
                  </div>
                  <div className="mt-1 text-[13px] text-[#1E293B]">{meeting.start}</div>
                </div>
                <div className="rounded-lg border border-[#E2E8F0] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <Clock className="h-3 w-3" /> Status
                  </div>
                  <div className="mt-1">
                    <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#3B82F6]">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#1E293B]">Purpose</h3>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#E2E8F0]/30 px-4 py-3 text-[13px] text-[#1E293B]/80">
                {meeting.purpose ?? "Discuss recent observations, review wellbeing progress, and align on next steps for support at home and school."}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {meeting.status !== 'CANCELLED' && meeting.status !== 'COMPLETED' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (meeting) {
                      onCancel(meeting.id);
                      onClose();
                    }
                  }}
                  className="h-10 w-full rounded-lg border-[#EF4444] text-[13px] font-medium text-[#EF4444] hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
                >
                  Cancel Meeting
                </Button>
              )}
              <Button
                onClick={onClose}
                className="h-10 w-full rounded-lg bg-[#3B82F6] text-[13px] font-medium text-[#FFFFFF] hover:bg-[#3B82F6]/90"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ParentMeetingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Tab>("Upcoming");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailsMeeting, setDetailsMeeting] = useState<Meeting | null>(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['Pending', 'Upcoming', 'Completed', 'Cancelled'].includes(tabParam)) {
      setActive(tabParam as Tab);
    }
  }, [searchParams]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/counselor/parent-meetings');
      const result = await response.json();
      
      if (result.success) {
        // Transform data to match the new interface
        const transformedMeetings = result.data.map((meeting: any) => ({
          id: meeting.id,
          parentName: meeting.student.parentName,
          parentEmail: meeting.student.parentEmail || 'N/A',
          initials: meeting.student.parentName.split(' ').map((n: string) => n[0]).join(''),
          studentName: meeting.student.name,
          start: `${new Date(meeting.date).toISOString().split('T')[0]} ${meeting.time}`,
          end: `${new Date(meeting.date).toISOString().split('T')[0]} ${meeting.time}`,
          notes: meeting.purpose || '',
          purpose: meeting.purpose || '',
          level: meeting.level,
          status: meeting.status,
          requestedBy: meeting.requestedBy || 'COUNSELOR',
          studentClass: meeting.student.classGrade
        }));
        setMeetings(transformedMeetings);
      }
    } catch (error) {
      console.error('Error fetching parent meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleMeetingCreated = () => {
    setScheduleOpen(false);
    fetchMeetings();
  };

  const handleStartSession = async (meetingId: string) => {
    try {
      setActionLoading(meetingId);
      console.log('Starting session for meeting:', meetingId);
      
      // Notify parent and update meeting status to PENDING
      const response = await fetch(`/api/counselor/parent-meetings/${meetingId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting started and parent notified:', result);
        
        // Navigate to meeting details page
        router.push(`/counselor/parent-meetings/${meetingId}`);
        
        // Refresh meetings to show updated status
        fetchMeetings();
      } else {
        const errorText = await response.text();
        console.error('Failed to start session and notify parent:', errorText);
        console.error('Response status:', response.status);
        
        // If it's HTML, it's likely an authentication or routing error
        if (errorText.includes('<!DOCTYPE')) {
          console.error('Authentication or routing error - received HTML instead of JSON');
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptMeeting = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedMeeting) return;

    try {
      setActionLoading(selectedMeeting.id);
      console.log('Accepting counselor meeting:', selectedMeeting.id);

      const response = await fetch(`/api/counselor/parent-meetings/${selectedMeeting.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting accepted:', result);

        setAcceptModalOpen(false);
        setSelectedMeeting(null);
        fetchMeetings();
      } else {
        const errorText = await response.text();
        console.error('Failed to accept meeting:', errorText);
        console.error('Response status:', response.status);
      }
    } catch (error) {
      console.error('Error accepting meeting:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineFromModal = async () => {
    if (!selectedMeeting) return;

    try {
      setActionLoading(selectedMeeting.id);
      console.log('Declining counselor meeting:', selectedMeeting.id);

      const response = await fetch(`/api/counselor/parent-meetings/${selectedMeeting.id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting declined:', result);

        setAcceptModalOpen(false);
        setSelectedMeeting(null);
        fetchMeetings();
      } else {
        const errorText = await response.text();
        console.error('Failed to decline meeting:', errorText);
        console.error('Response status:', response.status);
      }
    } catch (error) {
      console.error('Error declining meeting:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineMeeting = async (meetingId: string) => {
    try {
      setActionLoading(meetingId);
      console.log('Declining parent meeting request:', meetingId);
      
      // Update meeting status to CANCELLED (declined)
      const response = await fetch(`/api/counselor/parent-meetings/${meetingId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting declined:', result);
        
        // Refresh meetings to show updated status
        fetchMeetings();
      } else {
        const errorText = await response.text();
        console.error('Failed to decline meeting:', errorText);
        console.error('Response status:', response.status);
      }
    } catch (error) {
      console.error('Error declining meeting:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      setActionLoading(meetingId);
      console.log('Canceling counselor meeting:', meetingId);
      
      // Update meeting status to CANCELLED (canceled by counselor)
      const response = await fetch(`/api/counselor/parent-meetings/${meetingId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting canceled:', result);
        
        // Refresh meetings to show updated status
        fetchMeetings();
      } else {
        const errorText = await response.text();
        console.error('Failed to cancel meeting:', errorText);
        console.error('Response status:', response.status);
      }
    } catch (error) {
      console.error('Error canceling meeting:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getTabCount = (tab: Tab) => {
    return meetings.filter(meeting => {
      switch (tab) {
        case "Pending":
          return meeting.status === 'PENDING' || meeting.status === 'SCHEDULED' || meeting.status === 'CANCELLED';
        case "Upcoming":
          return meeting.status === 'SCHEDULED' || meeting.status === 'IN_PROGRESS';
        case "Completed":
          return meeting.status === 'COMPLETED';
        case "Cancelled":
          return meeting.status === 'CANCELLED';
        default:
          return false;
      }
    }).length;
  };

  const filteredMeetings = meetings.filter(meeting => {
    switch (active) {
      case "Pending":
        return meeting.status === 'PENDING' || meeting.status === 'SCHEDULED' || meeting.status === 'CANCELLED';
      case "Upcoming":
        return meeting.status === 'SCHEDULED' || meeting.status === 'IN_PROGRESS';
      case "Completed":
        return meeting.status === 'COMPLETED';
      case "Cancelled":
        return meeting.status === 'CANCELLED';
      default:
        return false;
    }
  });

  const tabs: { key: Tab; count: number }[] = [
    { key: "Pending", count: getTabCount("Pending") },
    { key: "Upcoming", count: getTabCount("Upcoming") },
    { key: "Completed", count: getTabCount("Completed") },
    { key: "Cancelled", count: getTabCount("Cancelled") },
  ];

  return (
    <div className="p-4 md:p-1 max-w-8xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[24px] md:text-[26px] font-bold tracking-tight text-[#1E293B]">Parent Meetings</h1>
          <p className="mt-1 text-[13px] md:text-[14px] text-[#64748B]">
            Manage parent communications and meetings
          </p>
        </div>
        <Button
          onClick={() => setScheduleOpen(true)}
          className="h-10 w-full md:w-auto gap-2 rounded-lg bg-[#3B82F6] px-4 text-[13px] font-medium text-[#FFFFFF] shadow-card hover:bg-[#3B82F6]/90"
        >
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-4 pt-3 overflow-x-auto min-w-full no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {tabs.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={[
                    "relative px-10 pb-4 pt-4 text-[16px] font-normal transition-colors",
                    isActive ? "text-[#3B82F6]" : "text-[#3A3A3A] hover:text-[#1E293B]",
                  ].join(" ")}
                >
                  {t.key} ({String(t.count).padStart(2, "0")})
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#3B82F6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <AdminLoader size="md" message="Loading parent meetings..." />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-16 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
            {active === 'Pending' && (
              <>
                <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarPlus className="h-8 w-8 text-[#F59E0B]" />
                </div>
                <h3 className="text-lg font-medium text-[#1E293B] mb-2">No Pending Meetings</h3>
                <p className="text-[#64748B] mb-6">Meetings that have been started will appear here</p>
              </>
            )}
            {active === 'Upcoming' && (
              <>
                <div className="w-16 h-16 bg-[#DBEAFE] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarPlus className="h-8 w-8 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-medium text-[#1E293B] mb-2">No Upcoming Meetings</h3>
                <p className="text-[#64748B] mb-6">Schedule a parent meeting when a student is in high crisis</p>
                <Button onClick={() => setScheduleOpen(true)} className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </>
            )}
            {active === 'Completed' && (
              <>
                <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-[#10B981]" />
                </div>
                <h3 className="text-lg font-medium text-[#1E293B] mb-2">No Completed Meetings</h3>
                <p className="text-[#64748B] mb-6">Completed parent meetings will appear here</p>
              </>
            )}
            {active === 'Cancelled' && (
              <>
                <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarPlus className="h-8 w-8 text-[#EF4444]" />
                </div>
                <h3 className="text-lg font-medium text-[#1E293B] mb-2">No Cancelled Meetings</h3>
                <p className="text-[#64748B] mb-6">Cancelled parent meetings will appear here</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Header - hidden on mobile */}
            <div className={`hidden lg:grid items-center gap-4 bg-[#E2E8F0]/40 px-6 py-5 ${
              active === 'Pending' 
                ? 'grid-cols-[1.2fr_1.2fr_0.8fr_1.2fr_1.2fr_0.8fr_1.4fr]' 
                : active === 'Upcoming'
                ? 'grid-cols-[1.8fr_1.4fr_1.4fr_2fr_1.8fr]'
                : active === 'Completed'
                ? 'grid-cols-[1.4fr_1.2fr_1.1fr_1.1fr_1.6fr_1.4fr]'
                : 'grid-cols-[1.8fr_1.4fr_1.4fr_2fr_1.8fr]'
            }`}>
              {active === 'Pending' ? (
                <>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Type</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Student Name</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Class</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Parent Name</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Session Start</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Status</div>
                  <div className="text-[16px] font-normal text-center text-[#5F6A7B]">Actions</div>
                </>
              ) : active === 'Upcoming' ? (
                <>
                  <div className="text-[16px] font-medium text-[#3A3A3A]">Parent Name</div>
                  <div className="text-[16px] font-medium text-[#3A3A3A]">Student Name</div>
                  <div className="text-[16px] font-medium text-[#3A3A3A]">Session Start</div>
                  <div className="text-[16px] font-medium text-[#3A3A3A]">Purpose</div>
                  <div className="text-[16px] font-medium text-center text-[#3A3A3A]">Actions</div>
                </>
              ) : active === 'Completed' ? (
                <>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Parent Name</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Student Name</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Session Start</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Session End</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Notes</div>
                  <div className="text-[16px] font-normal text-center text-[#5F6A7B]">Actions</div>
                </>
              ) : (
                <>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Parent Name</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Student Name</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Session Start</div>
                  <div className="text-[16px] font-normal text-[#5F6A7B]">Purpose</div>
                  <div className="text-[16px] font-normal text-center text-[#5F6A7B]">Actions</div>
                </>
              )}
            </div>

            <ul>
              {filteredMeetings.map((m) => (
                <li
                  key={m.id}
                  className={`flex flex-col gap-4 border-t border-[#E2E8F0] px-6 py-4 transition-colors hover:bg-[#E2E8F0]/30 lg:grid lg:items-center lg:gap-4 ${
                    active === 'Pending' 
                      ? 'lg:grid-cols-[1.2fr_1.2fr_0.8fr_1.2fr_1.2fr_0.8fr_1.4fr]' 
                      : active === 'Upcoming'
                      ? 'lg:grid-cols-[1.8fr_1.4fr_1.4fr_2fr_1.8fr]'
                      : active === 'Completed'
                      ? 'lg:grid-cols-[1.4fr_1.2fr_1.1fr_1.1fr_1.6fr_1.4fr]'
                      : 'lg:grid-cols-[1.8fr_1.4fr_1.4fr_2fr_1.8fr]'
                  }`}
                >
                  {active === 'Pending' ? (
                    <>
                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Type:</span>
                        <div className="flex items-center">
                          {m.requestedBy === 'PARENT' ? (
                            <div className="inline-flex items-center px-3 py-2 rounded-full text-[14px] font-medium bg-[#1866E0]/10 text-[#1866E0] border border-[#1866E0]/25">
                              <UserRound className="h-4 w-4 mr-2" />
                              Parent Requested
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-3 py-2 rounded-full text-[14px] font-medium bg-[#DCECFF] text-[#0B2B5F]">
                              <Briefcase className="h-3 w-3 mr-2" />
                              Counselor Requested
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Student:</span>
                        <div className="text-[13px] text-[#1E293B]/80 font-medium lg:font-normal">{m.studentName}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Class:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.studentClass || 'N/A'}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-semibold text-[#1E293B]">{m.parentName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Time:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.start}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Status:</span>
                        <div>
                          {m.status === 'PENDING' && (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[15px] font-normal bg-[#EBA941]/15 text-[#331B06] border border-[#EBA941]/30">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </div>
                          )}
                          {m.status === 'SCHEDULED' && (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[15px] font-normal bg-[#24A965]/15 text-[#1B8F54] border border-[#24A965]/30">
                              <CircleCheck className="h-3 w-3 mr-1" />
                              Confirmed
                            </div>
                          )}
                          {m.status === 'CANCELLED' && (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[15px] font-normal bg-red-100 text-red-800 border border-red-200">
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : active === 'Upcoming' ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-bold text-[#1E293B]">{m.parentName}</div>
                          <div className="truncate text-[12px] text-[#64748B]">{m.parentEmail}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Student:</span>
                        <div className="text-[13px] text-[#3A3A3A]">{m.studentName}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Time:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.start}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Purpose:</span>
                        <div className="text-[13px] text-[#1E293B]/80 truncate max-w-[200px]" title={m.purpose}>
                          {m.purpose || "—"}
                        </div>
                      </div>
                    </>
                  ) : active === 'Completed' ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-bold text-[#1E293B]">{m.parentName}</div>
                          <div className="truncate text-[12px] text-[#64748B]">{m.parentEmail}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Student:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.studentName}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Start:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.start}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">End:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.end}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Notes:</span>
                        <div className="text-[13px] text-[#1E293B]/80 truncate max-w-[200px]" title={m.note}>
                          {m.note || "—"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-bold text-[#1E293B]">{m.parentName}</div>
                          <div className="truncate text-[12px] text-[#64748B]">{m.parentEmail}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Student:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.studentName}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Time:</span>
                        <div className="text-[13px] text-[#1E293B]/80">{m.start}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:block">
                        <span className="lg:hidden text-[12px] font-medium text-[#64748B] min-w-[100px]">Purpose:</span>
                        <div className="text-[13px] text-[#1E293B]/80 truncate max-w-[200px]" title={m.purpose}>
                          {m.purpose || "—"}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 lg:justify-end">
                    {active === 'Pending' && m.status === 'PENDING' && m.requestedBy === 'PARENT' ? (
                      <>
                        <button
                          onClick={() => handleAcceptMeeting(m)}
                          disabled={actionLoading === m.id}
                          className="flex-1 lg:flex-none inline-flex h-9 items-center justify-center gap-1.5 rounded-[14px] bg-[#24A965] px-4 text-[12px] font-normal text-[#FFFFFF] hover:bg-[#24A965]/90 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === m.id ? <RingSpinner size="sm" color="white" /> : "Confirm"}
                        </button>
                        <button
                          onClick={() => handleDeclineMeeting(m.id)}
                          disabled={actionLoading === m.id}
                          className="flex-1 lg:flex-none inline-flex h-9 items-center justify-center gap-1.5 px-4 text-[12px] font-normal text-[#E23439] hover:bg-[#FFEFEF] hover:text-[#E23439]/90 rounded-[14px] transition-colors border border-[#E23439]/90 disabled:opacity-50"
                        >
                          {actionLoading === m.id ? <RingSpinner size="sm" color="blue" /> : "Decline"}
                        </button>
                      </>
                    ) : active === 'Pending' && m.status === 'PENDING' && m.requestedBy === 'COUNSELOR' ? (
                      <button
                        onClick={() => handleCancelMeeting(m.id)}
                        disabled={actionLoading === m.id}
                        className="flex-1 lg:flex-none inline-flex h-9 items-center justify-center gap-1.5 px-4 text-[12px] font-normal text-[#E23439] hover:bg-[#FFEFEF] hover:text-[#E23439]/90 rounded-[14px] transition-colors border border-[#E23439]/90 disabled:opacity-50"
                      >
                        {actionLoading === m.id ? <RingSpinner size="sm" color="blue" /> : "Cancel"}
                      </button>
                    ) : active === 'Pending' && (m.status === 'SCHEDULED' || m.status === 'CANCELLED') ? (
                      <div className="w-full lg:w-auto text-center lg:text-right text-[#64748B] pr-4">—</div>
                    ) : active === 'Completed' ? (
                      <button
                        onClick={() => router.push(`/counselor/parent-meetings/${m.id}`)}
                        className="w-full rounded-[12px] bg-[#F8F8F8] hover:bg-[#F1F3F4] text-[#3A3A3A] px-4 h-[36px] text-[12px] font-medium transition-all md:w-auto flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    ) : active === 'Cancelled' ? (
                      <button
                        onClick={() => setDetailsMeeting(m)}
                        className="w-full rounded-[12px] bg-[#F8F8F8] hover:bg-[#F1F3F4] text-[#3A3A3A] px-4 h-[36px] text-[12px] font-medium transition-all md:w-auto flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    ) : (
                      <>
                      <div className="flex gap-2">
                        <div className="flex gap-2">

                        <button
                          onClick={() => {
                            if (active === 'Pending') {
                              router.push(`/counselor/parent-meetings/${m.id}`);
                            } else {
                              setDetailsMeeting(m);
                            }
                          }}
                          className="w-full rounded-[12px] bg-[#F8F8F8] hover:bg-[#F1F3F4] text-[#3A3A3A] px-4 h-[36px] text-[12px] font-medium transition-all md:w-auto flex items-center justify-center"
                          >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                          </div>
                        <button
                          onClick={() => handleStartSession(m.id)}
                          disabled={actionLoading === m.id}
                          className="w-full md:w-full rounded-[15px] bg-[#3C83F6] hover:from-[#3195E7] hover:to-[#52A9F0] text-white border-none px-6 h-[38px] text-[14px] font-normal transition-all flex items-center justify-center disabled:opacity-50"
                        >
                          {actionLoading === m.id ? (
                            <RingSpinner size="sm" color="white" />
                          ) : (
                            <>
                              {m.status === 'IN_PROGRESS' ? (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Resume
                                </>
                              ) : (
                                <>
                                  <CalendarClock className="h-4 w-4 mr-1" />
                                  Start Session
                                </>
                              )}
                            </>
                          )}
                        </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ParentMeetingModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onMeetingCreated={handleMeetingCreated}
      />

      <MeetingAcceptModal
        open={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
        meeting={selectedMeeting ? {
          id: selectedMeeting.id,
          studentName: selectedMeeting.studentName,
          studentClass: 'Grade 8 — B',
          parentName: selectedMeeting.parentName,
          parentEmail: selectedMeeting.parentEmail,
          parentPhone: '+1 (555) 234-1098',
          date: selectedMeeting.start.split(' ')[0],
          time: selectedMeeting.start.split(' ')[1] || '10:30',
          purpose: selectedMeeting.purpose,
          requestedBy: selectedMeeting.requestedBy || 'COUNSELOR'
        } : null}
        onConfirm={handleConfirmAccept}
        onDecline={handleDeclineFromModal}
        isLoading={actionLoading === selectedMeeting?.id}
      />

      <MeetingDetailsDialog
        meeting={detailsMeeting}
        onClose={() => setDetailsMeeting(null)}
        onCancel={handleCancelMeeting}
      />
    </div>
  );
}

