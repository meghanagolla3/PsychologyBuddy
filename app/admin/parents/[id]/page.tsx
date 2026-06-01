"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Calendar, CheckCircle2, UserRound, XCircle, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditParentModal } from "@/src/components/admin/modals/EditParentModal";
import { DeleteConfirmModal } from "@/src/components/admin/modals/DeleteConfirmModal";
import { useToast } from "@/components/ui/use-toast";

interface Child {
  id: string;
  studentId: string;
  name: string;
  email: string;
  className: string;
  grade: string;
  section: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "Active" | "Inactive";
  totalMeetings: number;
  firstName?: string;
  lastName?: string;
  children: Child[];
}

interface Meeting {
  id: string;
  title: string;
  meta: string;
  status: "Requested" | "Completed" | "Declined" | "Cancelled";
}

interface Stats {
  totalRequests: number;
  attended: number;
  counselorInitiated: number;
  declinedMissed: number;
}

export default function ParentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const parentId = resolvedParams.id;
  const [parent, setParent] = useState<Parent | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    attended: 0,
    counselorInitiated: 0,
    declinedMissed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchParentData();
  }, [parentId]);

  const handleMeetingClick = (meeting: Meeting) => {
    router.push(`/admin/parent-meetings/${meeting.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/parents/${parentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete parent");
      toast({ title: "Parent deleted successfully" });
      setIsDeleteOpen(false);
      router.back();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchParentData = async () => {
    try {
      setLoading(true);

      // Fetch parent details
      const parentResponse = await fetch(`/api/parents/${parentId}`);
      if (parentResponse.ok) {
        const parentData = await parentResponse.json();
        if (parentData.success) {
          const user = parentData.data;

          let children = [];
          try {
            const childrenResponse = await fetch(`/api/students/by-parent/${user.id}`);
            if (childrenResponse.ok) {
              const childrenData = await childrenResponse.json();
              if (childrenData.success) {
                children = childrenData.data || [];
              }
            }
          } catch (error) {
            console.error('Error fetching children for parent:', user.id, error);
          }

          setParent({
            ...user,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
            email: user.email,
            avatar: user.adminProfile?.profileImageUrl || undefined,
            status: user.status === "ACTIVE" ? "Active" : "Inactive",
            totalMeetings: user.parentProfile?.totalMeetings || 0,
            firstName: user.firstName,
            lastName: user.lastName,
            children: children,
          });
        }
      }

      // Fetch meetings
      const meetingsResponse = await fetch(`/api/parents/${parentId}/meetings`);
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json();
        if (meetingsData.success) {
          const meetingsList = meetingsData.data || [];
          const completedMeetings = meetingsList.filter((m: Meeting) => m.status === "Completed");
          setMeetings(completedMeetings);

          // Calculate stats
          const totalRequests = meetingsList.length;
          const attended = meetingsList.filter((m: Meeting) => m.status === "Completed").length;
          const counselorInitiated = meetingsList.filter((m: Meeting) => m.meta?.includes("Counsellor")).length;
          const declinedMissed = meetingsList.filter((m: Meeting) => m.status === "Declined" || m.status === "Cancelled").length;

          setStats({
            totalRequests,
            attended,
            counselorInitiated,
            declinedMissed,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching parent data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: "Total Meeting Requests", value: stats.totalRequests, icon: Calendar, tint: "bg-[#DBEAFE] text-[#3B82F6]" },
    { label: "Attended Meetings", value: stats.attended, icon: CheckCircle2, tint: "bg-[#D1FAE5] text-[#10B981]" },
    { label: "Counsellor-Initiated", value: stats.counselorInitiated, icon: UserRound, tint: "bg-[#E0E7FF] text-[#6366F1]" },
    { label: "Declined / Missed", value: stats.declinedMissed, icon: XCircle, tint: "bg-[#FEE2E2] text-[#EF4444]" },
  ];

  function StatusPill({ status }: { status: string }) {
    const styles =
      status === "Requested"
        ? "bg-[#FEF3C7] text-[#92400E]"
        : status === "Completed"
        ? "bg-[#D1FAE5] text-[#065F46]"
        : "bg-[#FEE2E2] text-[#991B1B]";
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === "Requested" ? "bg-[#F59E0B]" : status === "Completed" ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
        {status}
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

  if (!parent) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-muted-foreground">Parent not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Profile card */}
        <div className="rounded-2xl bg-[#FFFFFF] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEditOpen(true)}
                className="relative group"
              >
                <img
                  src={parent.avatar || `https://i.pravatar.cc/97?img=${parent.id.length}`}
                  alt={parent.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#3B82F6] transition-all"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-[#1E293B]">{parent.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2 py-0.5 text-xs font-medium text-[#065F46]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> {parent.status}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748B]">
                  <Mail className="h-3.5 w-3.5" /> {parent.email}
                </p>
                {parent.children.length > 0 && (
                  <p className="text-sm text-[#64748B]">
                    {parent.children.map((child) => `${child.name} · Class ${child.grade}-${child.section}`).join(", ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2563EB]"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#DC2626]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((s) => (
            <div key={s.label} className="rounded-2xl bg-[#FFFFFF] p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-[#64748B]">{s.label}</p>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${s.tint}`}>
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#1E293B]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Meeting history */}
        <div className="rounded-2xl bg-[#FFFFFF] p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-[#1E293B]">Meeting History</h2>
          {meetings.length > 0 ? (
            <ul className="mt-4 divide-y divide-[#E2E8F0]">
              {meetings.map((m, i) => (
                <li 
                  key={i} 
                  className="flex items-center justify-between gap-4 py-4 cursor-pointer hover:bg-[#F8FAFC] transition-colors rounded-lg px-2 -mx-2"
                  onClick={() => handleMeetingClick(m)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#3B82F6]">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{m.title}</p>
                      <p className="text-xs text-[#64748B]">{m.meta}</p>
                    </div>
                  </div>
                  <StatusPill status={m.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No meetings found</p>
          )}
        </div>
      </div>

      {isEditOpen && parent && (
        <EditParentModal
          parent={{
            ...parent,
            childName: parent.children[0]?.name || '',
            childClass: parent.children[0]?.className || ''
          }}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            fetchParentData();
            toast({ title: "Parent updated successfully" });
          }}
          onDelete={() => {
            router.back();
            toast({ title: "Parent deleted successfully" });
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Parent"
        description="Are you sure you want to delete this parent? This action cannot be undone."
        itemName={parent?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
