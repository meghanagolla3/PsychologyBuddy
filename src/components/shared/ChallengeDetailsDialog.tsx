import { useState, useEffect } from "react";
import { Trophy, Users, CheckCircle2, UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChallengeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge?: {
    id: string;
    title: string;
    category: string;
  };
}

export function ChallengeDetailsDialog({
  open,
  onOpenChange,
  challenge,
}: ChallengeDetailsDialogProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && challenge?.id) {
      fetchChallengeStats();
    }
  }, [open, challenge?.id]);

  const fetchChallengeStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/counselor/challenges/${challenge?.id}/stats`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching challenge stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const platformData = data ? [
    { name: "In progress", value: data.stats.inProgress },
    { name: "Completed", value: data.stats.completed },
  ] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
              <Trophy className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <div>
              <DialogTitle className="text-xl text-[#1E293B]">{data?.title || challenge?.title || "Challenge Details"}</DialogTitle>
              <div className="text-sm text-[#64748B]">
                {data?.category || challenge?.category || "Loading..."}
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                <div>
                  <div className="text-xs text-[#64748B]">Start Date</div>
                  <div className="font-medium text-[#1E293B]">{data.startDate}</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748B]">End Date</div>
                  <div className="font-medium text-[#1E293B]">{data.endDate}</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748B]">Created By</div>
                  <div className="font-medium line-clamp-1 text-[#1E293B]">{data.createdBy}</div>
                </div>
              </div>

              <div>
                <h3 className="mb-1 font-semibold text-[#1E293B]">Description</h3>
                <p className="text-sm text-[#64748B]">{data.description}</p>
              </div>

              <div>
                <h3 className="mb-1 font-semibold text-[#1E293B]">Instructions</h3>
                <p className="text-sm text-[#64748B]">{data.instructions}</p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-[#1E293B]">Challenge activity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/5 p-4">
                    <div className="flex items-center justify-between text-sm text-[#64748B]">
                      Assigned
                      <Users className="h-4 w-4 text-[#3B82F6]" />
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-[#1E293B]">
                      {data.stats.assigned}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 p-4">
                    <div className="flex items-center justify-between text-sm text-[#64748B]">
                      Completed
                      <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-[#1E293B]">
                      {data.stats.completed}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#E2E8F0] p-4">
                <h3 className="mb-3 font-semibold text-[#1E293B]">Platform Activity</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-[#1E293B]">
                  Assigned Students ({data.students.length})
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.students.map((s: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
                          {s.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#1E293B] truncate">{s.name}</div>
                          <div className="text-xs text-[#64748B] truncate">
                            {s.className}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium shrink-0 ${
                          s.status === "Completed"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#3B82F6]/10 text-[#3B82F6]"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                ))}
              </div>
            </div>

            <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white" size="lg">
              <UserPlus className="mr-2 h-4 w-4" />
              Assign More Student
            </Button>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-[#64748B]">
            No data available for this challenge.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
