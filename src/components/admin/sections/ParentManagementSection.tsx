"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, ChevronRight, Loader2, X } from "lucide-react";
import { AdminHeader } from "@/src/components/admin/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddParentModal } from "@/src/components/admin/modals/AddParentModal";
import { EditParentModal } from "@/src/components/admin/modals/EditParentModal";

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
  department: string;
  status: "Active" | "Inactive";
  totalMeetings: number;
  firstName?: string;
  lastName?: string;
  children: Child[];
}

async function fetchParents(search?: string): Promise<Parent[]> {
  const url = new URL("/api/parents", window.location.origin);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch parents");
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch parents");
  const parents = data.data?.parents || data.data || [];

  const parentsWithChildren = await Promise.all(
    parents.map(async (user: any) => {
      const department = user.parentProfile?.department || "Parent Services";

      // Fetch child information for this parent
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
      
      return {
        ...user,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
        avatar: user.adminProfile?.profileImageUrl || undefined,
        department: department,
        status: user.status === "ACTIVE" ? "Active" : "Inactive",
        totalMeetings: user.parentProfile?.totalMeetings || 0,
        firstName: user.firstName,
        lastName: user.lastName,
        children: children,
      };
    })
  );

  const parentsWithClassNames = await Promise.all(
    parents.map(async (user: any) => {
      const department = user.parentProfile?.department || "Parent Services";

      // Fetch child information for this parent
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

      return {
        ...user,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
        avatar: user.adminProfile?.profileImageUrl || undefined,
        department: department,
        status: user.status === "ACTIVE" ? "Active" : "Inactive",
        totalMeetings: user.parentProfile?.totalMeetings || 0,
        firstName: user.firstName,
        lastName: user.lastName,
        children: children,
      };
    })
  );

  return parentsWithChildren;
}

export default function ParentManagementSection() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: parents = [], isLoading } = useQuery({
    queryKey: ["parents", debouncedSearch],
    queryFn: () => fetchParents(debouncedSearch),
  });

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this parent?")) return;
    try {
      const res = await fetch(`/api/parents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete parent");
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      toast({ title: "Parent deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }, [queryClient, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Parents"
        subtitle="View registered parents, their children, and meeting activity."
        showTimeFilter={false}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-start">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 px-6 py-4 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
            <div>Parent</div>
            <div>Children</div>
            <div>Status</div>
            <div>Total Meetings</div>
            <div></div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/parents/${parent.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={parent.avatar} />
                      <AvatarFallback>
                        {parent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{parent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{parent.email}</p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    {parent.children.length > 0 ? (
                      <div className="space-y-1">
                        {parent.children.map((child) => (
                          <div key={child.id} className="p-2 border-b">
                            <p className="text-sm font-medium">{child.name}</p>
                            <p className="text-xs text-muted-foreground">{child.studentId}</p>
                            <p className="text-xs text-muted-foreground">{child.className} - Grade {child.grade}, Section {child.section}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No children assigned</p>
                    )}
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                        parent.status === "Active"
                          ? "border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/5"
                          : "border-muted-foreground/30 text-muted-foreground bg-muted/40"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          parent.status === "Active" ? "bg-green-500" : "bg-muted-foreground"
                        )}
                      />
                      {parent.status}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-primary">{parent.totalMeetings}</div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}

              {parents.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No parents found.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {isAddOpen && (
        <AddParentModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            queryClient.invalidateQueries({ queryKey: ["parents"] });
            toast({ title: "Parent added successfully" });
          }}
        />
      )}

      {editParent && (
        <EditParentModal
          parent={editParent}
          onClose={() => setEditParent(null)}
          onSuccess={() => {
            setEditParent(null);
            queryClient.invalidateQueries({ queryKey: ["parents"] });
            toast({ title: "Parent updated successfully" });
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
