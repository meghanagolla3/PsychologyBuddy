"use client";

import { useState } from "react";
import { Plus, MoreVertical, Eye, UserPlus, Trophy, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useSchoolFilter } from "@/src/contexts/SchoolFilterContext";
import { AdminHeader } from "@/src/components/admin/layout/AdminHeader";
import { CreateChallengeDialog } from "@/src/components/shared/CreateChallengeDialog";
import { AssignChallengeDialog } from "@/src/components/shared/AssignChallengeDialog";
import { ChallengeDetailsDialog } from "@/src/components/shared/ChallengeDetailsDialog";
import { ChallengeActivity } from "@/src/components/shared/ChallengeActivity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string;
  assignmentType: "INDIVIDUAL" | "CLASS" | "SCHOOL";
  isActive: boolean;
  participantCount: number;
  createdBy: string;
  creatorRole: string;
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const response = await fetch("/api/challenges", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch challenges (${response.status})`);
    }
    
    const data = await response.json();
    
    console.log('Admin Frontend - Received data:', data);
    console.log('Admin Frontend - Data length:', data.data?.length);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Admin - Invalid data format received:', data);
      return [];
    }
    
    const mappedChallenges = data.data.map((challenge: any) => {
      console.log('Admin - Mapping challenge:', challenge);
      
      return {
        ...challenge,
        title: challenge.name,
        category: (challenge.category && !challenge.category.includes('-')) ? challenge.category : "Wellbeing",
        startsAt: challenge.startsAt,
        endsAt: challenge.endsAt,
        createdBy: `${challenge.creator?.firstName || ''} ${challenge.creator?.lastName || ''}`.trim(),
        creatorRole: challenge.creator?.role?.name || 'Admin',
        schoolId: challenge.schoolId,
        schoolName: challenge.school?.name || 'Unknown School',
        participantCount: challenge._count?.userChallenges || 0,
        completed: challenge.participantCount || 0,
        total: 96, // Default total
      };
    });
    
    console.log('Admin - Final mapped challenges:', mappedChallenges);
    return mappedChallenges;
  } catch (error) {
    console.error("Admin - Error fetching challenges:", error);
    return [];
  }
}

function ChallengeCard({ challenge, onAssign, onDetails }: { challenge: Challenge; onAssign: (challenge: Challenge) => void; onDetails: (challenge: Challenge) => void }) {
  // Only log if challenge has valid data
  if (challenge && challenge.id) {
    console.log('ChallengeCard - Rendering challenge:', challenge);
  }
  
  // Calculate status based on timing and isActive
  const now = new Date();
  const startsAt = new Date(challenge.startsAt);
  const endsAt = new Date(challenge.endsAt);
  
  let status: "Active" | "Upcoming" | "Expired";
  if (!challenge.isActive) {
    status = "Expired";
  } else if (now < startsAt) {
    status = "Upcoming";
  } else if (now > endsAt) {
    status = "Expired";
  } else {
    status = "Active";
  }

  const statusStyles: Record<typeof status, string> = {
    Active: "bg-[#10B981]/15 text-[#10B981]",
    Upcoming: "bg-[#F59E0B]/15 text-[#F59E0B]",
    Expired: "bg-[#EF4444]/15 text-[#EF4444]",
  };
  const statusDot: Record<typeof status, string> = {
    Active: "bg-[#10B981]",
    Upcoming: "bg-[#F59E0B]",
    Expired: "bg-[#EF4444]",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]">
      {/* <div className="flex items-center justify-between gap-2 bg-[#3B82F6]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFFFFF] shadow-sm">
            <Trophy className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#3B82F6]">
            {challenge.category}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[challenge.status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[challenge.status]}`} />
            {challenge.status}
          </span>
        </div> */}
        <div className="flex items-start justify-between bg-gradient-to-l from-[#F9FEFF] to-[#F3FAFF] to-[#e7f5ff] px-4 py-6">
  <div className="flex gap-3">
    <div className="flex items-center px-4.5 py-4 justify-center rounded-[16px] bg-white  ">
      <Trophy className="h-[26px] w-[26px] text-[#3C83F6]" />
    </div>

    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#DDEBFC] px-2.5 py-0.5 text-[12px] font-medium text-[#2474F5]">
            {challenge.category}
          </span>

        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
            {status}
          </span>
      </div>

      <h3 className="mt-1 text-[18px] mt-2 ml-2 font-medium leading-tight text-[#3A3A3A]">
        {challenge.name}
      </h3>
    </div>
  </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-md p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onDetails(challenge)}>
              <Eye className="h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="h-4 w-4" /> Assign to Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-5">
        {/* <h3 className="text-center text-base font-semibold text-[#1E293B]">{challenge.title}</h3> */}

        <p className="text-sm leading-relaxed text-[#65758B]">
          {challenge.description}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-[15px] text-[#64748B]">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          <span>
            {new Date(challenge.startsAt).toLocaleDateString()} → {new Date(challenge.endsAt).toLocaleDateString()}
          </span>
        </div>

       

        <div className="mt-4 flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex-1 rounded-[12px] gap-1.5"
            onClick={() => onDetails(challenge)}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <Button 
            className="flex-1 gap-1.5 bg-[#3C83F6] rounded-[12px] text-[#FFFFFF] hover:bg-[#3B82F6]/90"
            onClick={() => onAssign(challenge)}
          >
            <UserPlus className="h-4 w-4" />
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function Challenges() {
  const [activeTab, setActiveTab] = useState<"Challenges" | "Activity">("Challenges");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const { selectedSchoolId, schools, isSuperAdmin, setSelectedSchoolId } = useSchoolFilter();
  const { data: challenges = [], isLoading, error } = useQuery({
    queryKey: ["admin-challenges", selectedSchoolId],
    queryFn: fetchChallenges,
  });

  // Handle query errors
  if (error) {
    console.error('Admin query error:', error);
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#EF4444] mb-2">Error Loading Challenges</h1>
          <p className="text-sm text-[#64748B]">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminHeader
        title="Challenges"
        subtitle="Create and assign wellness challenges to students"
        showSchoolFilter={isSuperAdmin}
        schoolFilterValue={selectedSchoolId}
        onSchoolFilterChange={setSelectedSchoolId}
        schools={schools.map(s => ({ id: s.id, name: s.name }))}
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#3B82F6]/90"
          >
            <Plus className="h-4 w-4" />
            Add Challenges
          </Button>
        }
      />
      <div className="mx-auto max-w-8xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex rounded-full bg-[#F1F5F9] p-1">
            {(["Challenges", "Activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === t
                    ? "bg-[#3B82F6] text-[#FFFFFF]"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Challenges" ? (
          isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
                <div className="text-sm text-[#64748B]">Loading challenges...</div>
              </div>
            </div>
          ) : challenges.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-20 text-center">
              <div className="bg-[#F1F5F9] h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-[#64748B]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">No challenges found</h3>
              <p className="text-sm text-[#64748B]">Create your first challenge to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {challenges
                .filter(c => selectedSchoolId === "all" || c.schoolId === selectedSchoolId)
                .map((c) => (
                <ChallengeCard 
                  key={c.id} 
                  challenge={c} 
                  onAssign={(challenge) => {
                    setSelectedChallenge(challenge);
                    setAssignOpen(true);
                  }}
                  onDetails={(challenge) => {
                    setSelectedChallenge(challenge);
                    setDetailsOpen(true);
                  }}
                />
              ))}
            </div>
          )
        ) : (
          <ChallengeActivity isAdmin />
        )}

        <CreateChallengeDialog 
          open={createOpen} 
          onOpenChange={setCreateOpen} 
        />
        
        <AssignChallengeDialog 
          open={assignOpen} 
          onOpenChange={setAssignOpen}
          challengeName={selectedChallenge?.name}
          challengeId={selectedChallenge?.id}
        />
        
        <ChallengeDetailsDialog 
          open={detailsOpen} 
          onOpenChange={setDetailsOpen}
          challenge={selectedChallenge ? {
            id: selectedChallenge.id,
            title: selectedChallenge.name,
            category: selectedChallenge.category,
          } : undefined}
        />
      </div>
    </div>
  );
}
