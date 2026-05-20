"use client";

import React, { useState } from "react";
import { 
  Check, 
  X, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  Clock,
  ExternalLink,
  Users,
  ChevronRight,
  Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

interface ActivityItem {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  challengeName: string;
  challengeId: string;
  status: 'COMPLETED' | 'EXPIRED' | 'IN_PROGRESS' | string;
  duration: string;
  timestamp: string;
}

export function ChallengeActivity({ isAdmin = false }: { isAdmin?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["challenge-activity", isAdmin],
    queryFn: async () => {
      const response = await fetch(`/api/counselor/challenges/activity`);
      if (!response.ok) throw new Error("Failed to fetch activity");
      const result = await response.json();
      return result.data as ActivityItem[];
    }
  });

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          activity.challengeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || activity.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input 
            placeholder="Search by student or challenge..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-[#E2E8F0] rounded-xl focus-visible:ring-[#3B82F6]"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[140px] bg-white border-[#E2E8F0] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[140px] bg-white border-[#E2E8F0] rounded-xl">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
            <div className="bg-[#F1F5F9] h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-[#64748B]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E293B]">No activity found</h3>
            <p className="text-[#64748B]">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const isCompleted = activity.status === 'COMPLETED';
  const isExpired = activity.status === 'EXPIRED';

  return (
    <div className="relative group">
      {/* Connector Line (optional visual fluff) */}
      <div className="absolute left-[26px] top-0 bottom-0 w-[2px] bg-[#E2E8F0] -z-10 group-first:top-1/2 group-last:bottom-1/2" />
      
      <div className="flex gap-4 sm:gap-6">
        {/* Status Icon Indicator */}
        <div className={cn(
          "h-[52px] w-[52px] rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm z-10",
          isCompleted ? "bg-[#10B981]" : isExpired ? "bg-[#EF4444]" : "bg-[#F59E0B]"
        )}>
          {isCompleted ? (
            <Check className="h-6 w-6 text-white" />
          ) : (
            <X className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Content Card */}
        <div className={cn(
          "flex-1 bg-white border rounded-[24px] overflow-hidden transition-all hover:shadow-md",
          isCompleted ? "border-[#10B981]/20" : isExpired ? "border-[#EF4444]/20" : "border-[#E2E8F0]"
        )}>
          <div className={cn(
            "p-5 sm:p-6",
            isCompleted ? "bg-[#10B981]/[0.02]" : isExpired ? "bg-[#EF4444]/[0.02]" : ""
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-lg font-bold",
                    isCompleted ? "text-[#10B981]" : isExpired ? "text-[#EF4444]" : "text-[#1E293B]"
                  )}>
                    {activity.studentName}
                  </span>
                  <span className="text-[#64748B] text-sm">
                    {isCompleted ? "completed" : isExpired ? "expired" : "updated"} 
                    <span className="font-bold mx-1 text-[#1E293B]">{activity.challengeName}</span>
                    — {formatDistanceToNow(new Date(activity.timestamp))} ago
                  </span>
                </div>
                
                <div className="mt-4 flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <User className="h-4 w-4" />
                    <span className="text-[13px] font-medium uppercase tracking-wider">{activity.studentId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Users className="h-4 w-4" />
                    <span className="text-[13px] font-medium uppercase tracking-wider">{activity.className}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[13px] font-medium uppercase tracking-wider">{activity.duration}</span>
                  </div>
                </div>
              </div>

              <div className={cn(
                "self-start sm:self-center px-4 py-1.5 rounded-xl border text-sm font-bold uppercase tracking-wider",
                isCompleted 
                  ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]" 
                  : "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
              )}>
                {activity.status}
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-3 flex items-center gap-6">
            <button className="text-[13px] font-bold text-[#64748B] hover:text-[#3B82F6] transition-colors flex items-center gap-1.5">
              View Student
            </button>
            <div className="h-4 w-[1px] bg-[#E2E8F0]" />
            <button className="text-[13px] font-bold text-[#64748B] hover:text-[#3B82F6] transition-colors flex items-center gap-1.5">
              View Challenge Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
