import { X, User, GraduationCap, Mail, Phone, Calendar, Clock, MessageSquare, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { RingSpinner } from "@/src/components/ui/Spinners";

interface MeetingAcceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: {
    id: string;
    studentName: string;
    studentClass?: string;
    parentName: string;
    parentEmail?: string;
    parentPhone?: string;
    date: string;
    time: string;
    purpose?: string;
    requestedBy: string;
  } | null;
  onConfirm?: () => void;
  onDecline?: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

export function MeetingAcceptModal({ open, onOpenChange, meeting, onConfirm, onDecline, readOnly = false, isLoading = false }: MeetingAcceptModalProps) {
  if (!meeting) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <VisuallyHidden>
          <DialogTitle>Meeting Request Details</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full rounded-2xl bg-card p-5 shadow-xl">
          {/* Top badges + close */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-medium bg-[#1866E0]/10 text-[#1866E0] border border-[#1866E0]/25">
                                              <UserRound className="h-4 w-4 mr-2" />
                Parent requested
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[15px] font-normal bg-[#EBA941]/15 text-[#331B06] border border-[#EBA941]/30">
                            <Clock className="h-3 w-3 mr-1" />
                Pending
              </span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-[#64748B] transition hover:bg-accent hover:text-[#1E293B]"
            >
              {/* <X className="size-4" /> */}
            </button>
          </div>

          {/* Name */}
          <h2 className="mt-4 text-[19px] font-semibold text-[#1E293B]">{meeting.studentName}</h2>

          {/* Student details */}
          <Section title="STUDENT DETAILS">
            <Row icon={User} label="Name" value={meeting.studentName} />
            <Row icon={GraduationCap} label="Class" value={meeting.studentClass || "Grade 8 — B"} />
          </Section>

          {/* Parent contact */}
          <Section title="PARENT CONTACT">
            <Row icon={User} label="Parent" value={meeting.parentName} />
            <Row icon={Mail} label="Email" value={meeting.parentEmail || "priya.sharma@email.com"} />
            <Row icon={Phone} label="Phone" value={meeting.parentPhone || "+1 (555) 234-1098"} />
          </Section>

          {/* Requested schedule */}
          <Section title="REQUESTED SCHEDULE">
            <Row icon={Calendar} label="Date" value={formatDate(meeting.date)} />
            <Row icon={Clock} label="Time" value={meeting.time} />
          </Section>

          {/* Reason */}
          <Section title="REASON FOR MEETING">
            <div className="flex gap-3 rounded-lg bg-[#E2E8F0]/60 p-3">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-[#64748B]" />
              <p className="text-sm leading-relaxed text-[#1E293B]">
                {meeting.purpose || "No reason provided"}
              </p>
            </div>
          </Section>

          {/* Actions */}
          {!readOnly && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                className="text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                onClick={onDecline}
                disabled={isLoading}
              >
                {isLoading ? <RingSpinner size="sm" color="blue" /> : "Decline"}
              </Button>
              <Button
                className="bg-[#10B981] text-white hover:bg-[#059669]"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? <RingSpinner size="sm" color="white" /> : "Confirm meeting"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-[12px] font-semibold tracking-wider text-[#5F6A7B]">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-[#5F6A7B]">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium text-[#5F6A7B]">{value}</span>
    </div>
  );
}
