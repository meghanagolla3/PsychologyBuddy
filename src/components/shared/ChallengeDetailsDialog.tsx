import { Trophy, Users, CheckCircle2, UserPlus } from "lucide-react";
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
    id?: string;
    title: string;
    category: string;
    startDate?: string;
    endDate?: string;
    createdBy?: string;
    description?: string;
    instructions?: string;
    assigned?: number;
    completed?: number;
  };
}

const platformData = [
  { name: "Assigned", value: 5 },
  { name: "Completed", value: 11 },
  { name: "In progress", value: 9 },
];

const students = [
  { name: "Michael Chen", className: "Class 3-A", status: "In progress" },
  { name: "Michael Chen", className: "Class 3-A", status: "Completed" },
  { name: "Michael Chen", className: "Class 3-A", status: "Completed" },
  { name: "Michael Chen", className: "Class 3-A", status: "Completed" },
];

export function ChallengeDetailsDialog({
  open,
  onOpenChange,
  challenge,
}: ChallengeDetailsDialogProps) {
  console.log('ChallengeDetailsDialog rendered with:', { open, challenge });
  const data = {
    title: challenge?.title ?? "Gratitude Journal - 7 Days",
    category: challenge?.category ?? "Mindfulness",
    startDate: challenge?.startDate ?? "2026-04-08",
    endDate: challenge?.endDate ?? "2026-04-15",
    createdBy: challenge?.createdBy ?? "Dr. Sarah Chen",
    description:
      challenge?.description ??
      "Practice daily gratitude by writing three things you're thankful for each day.",
    instructions:
      challenge?.instructions ??
      "Each day, write down three specific things you're grateful for. Focus on different aspects of your life.",
    assigned: challenge?.assigned ?? 201,
    completed: challenge?.completed ?? 180,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{data.title}</DialogTitle>
              <div className="text-sm text-muted-foreground">
                {data.category}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
            <div>
              <div className="text-xs text-muted-foreground">Start Date</div>
              <div className="font-medium">{data.startDate}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">End Date</div>
              <div className="font-medium">{data.endDate}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created By</div>
              <div className="font-medium">{data.createdBy}</div>
            </div>
          </div>

          <div>
            <h3 className="mb-1 font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold">Instructions</h3>
            <p className="text-sm text-muted-foreground">{data.instructions}</p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Challenge activity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  Assigned
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {data.assigned}
                </div>
              </div>
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  Completed
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {data.completed}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Platform Activity</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">
              Assigned Students ({students.length})
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {students.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {s.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.className}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      s.status === "Completed"
                        ? "bg-green-500/10 text-green-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Assign More Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
