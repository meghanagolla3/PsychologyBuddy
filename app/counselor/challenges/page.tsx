"use client";

import { useState } from "react";
import { Plus, MoreVertical, Eye, UserPlus, Trophy, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { CreateChallengeDialog } from "@/src/components/shared/CreateChallengeDialog";
import { AssignChallengeDialog } from "@/src/components/shared/AssignChallengeDialog";
import { ChallengeDetailsDialog } from "@/src/components/shared/ChallengeDetailsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  name: string;
  category: string;
  description: string;
  startsAt: string;
  endsAt: string;
  assignmentType: "INDIVIDUAL" | "CLASS" | "SCHOOL";
  isActive: boolean;
  // Backend fields
  instructions: string;
  requiresMeditation: boolean;
  requiresMusic: boolean;
  requiresPsychoeducation: boolean;
  requiresJournaling: boolean;
  createdBy: string;
  creatorRole: string;
  schoolName: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const response = await fetch("/api/counselor/all-challenges", {
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
    
    console.log('Frontend - Received data:', data);
    console.log('Frontend - Data length:', data.data?.length);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid data format received:', data);
      return [];
    }
    
    const mappedChallenges = data.data.map((challenge: any) => {
      console.log('Mapping challenge:', challenge);
      const mappedChallenge = {
        ...challenge,
        name: challenge.name,
        category: (challenge.category && !challenge.category.includes('-')) ? challenge.category : "Wellbeing",
        startsAt: challenge.startsAt,
        endsAt: challenge.endsAt,
        schoolId: challenge.schoolId,
        assignmentType: challenge.assignmentType,
        isActive: challenge.isActive,
        participantCount: challenge.participantCount || 0,
      };
      
      console.log('Mapped challenge:', mappedChallenge);
      return mappedChallenge;
    });
    
    console.log('Final mapped challenges:', mappedChallenges);
    return mappedChallenges;
  } catch (error) {
    console.error("Error fetching challenges:", error);
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
      <div className="flex items-start justify-between bg-gradient-to-l from-[#F9FEFF] to-[#F3FAFF] to-[#EEF8FF] px-4 py-6">
        <div className="flex gap-3">
          <div className="flex items-center px-4 py-4 justify-center rounded-[11px] bg-white shadow-sm border border-[#E2E8F0]">
            <Trophy className="h-[21px] w-[21px] text-[#3C83F6]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-[#DDEBFC] px-2.5 py-0.5 text-[12px] font-medium text-[#2474F5] whitespace-nowrap">
                {challenge.category}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
                {status}
              </span>
            </div>

            <h3 className="mt-2 ml-2 text-[18px] font-medium leading-tight text-[#3A3A3A]">
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
            <DropdownMenuItem onClick={() => onAssign(challenge)}>
              <UserPlus className="h-4 w-4" /> Assign to Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-5">
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

type Tab = "Challenges" | "Activity";

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Challenges");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const { data: challenges = [], isLoading, error } = useQuery({
    queryKey: ["counselor-challenges"],
    queryFn: fetchChallenges,
  });

  // Handle query errors
  if (error) {
    console.error('Query error:', error);
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
    <div className="min-h-screen bg-[#f2f3f4]">
      {/* Header Section */}
      <div className="bg-[#f2f3f4]">
        <div className="mx-auto max-w-8xl px-4 md:px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[24px] md:text-2xl font-bold text-[#1E293B]">Challenges</h1>
              <p className="mt-1 text-[13px] md:text-sm text-[#64748B]">
                Create and assign wellness challenges to students
              </p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="w-full md:w-auto h-10 gap-2 bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#3B82F6]/90 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add Challenges
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-8xl px-4 md:px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center">
          <div className="inline-flex rounded-full bg-[#F1F5F9] p-1 w-full sm:w-auto">
            {(["Challenges", "Activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 sm:flex-none rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  activeTab === t
                    ? "bg-[#3B82F6] text-[#FFFFFF] shadow-sm"
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
            <div className="flex items-center justify-center">
              <div className="text-sm text-[#64748B]">Loading challenges...</div>
            </div>
          ) : challenges.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-10 text-center text-sm text-[#64748B]">
              No challenges found. Create your first challenge to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c) => (
                <ChallengeCard 
                  key={c.id} 
                  challenge={c} 
                  onAssign={(challenge) => {
                    setSelectedChallenge(challenge);
                    setAssignOpen(true);
                  }}
                  onDetails={(challenge) => {
                    console.log('Counselor View Details clicked for challenge:', challenge);
                    setSelectedChallenge(challenge);
                    setDetailsOpen(true);
                  }}
                />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-10 text-center text-sm text-[#64748B]">
            No activity yet.
          </div>
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
            startDate: selectedChallenge.startsAt?.split('T')[0],
            endDate: selectedChallenge.endsAt?.split('T')[0],
            description: selectedChallenge.description,
            instructions: selectedChallenge.description, // You might want to add instructions field to the schema
            assigned: Math.floor(Math.random() * 100) + 50, // Mock data - replace with real API call
            completed: Math.floor(Math.random() * 80) + 20, // Mock data - replace with real API call
          } : undefined}
        />
      </div>
    </div>
  );
}

