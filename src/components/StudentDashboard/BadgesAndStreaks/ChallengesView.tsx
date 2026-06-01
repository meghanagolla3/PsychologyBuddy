import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, Users, CheckCircle2, Clock, TrendingUp, Target, Flame, Award, Star, X, User } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
import { ModuleType, ChallengeType, UserChallengeStatus } from "@/src/services/challenges/types/challenge.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category?: string;
  moduleType: ModuleType;
  challengeType: ChallengeType;
  targetValue: number;
  targetUnit: string;
  rewardPoints: number;
  difficulty: string;
  status?: UserChallengeStatus;
  currentProgress?: number;
  progressPercentage?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  daysLeft?: number;
  completedOn?: string;
  tone?: "warning" | "info" | "success";
  instructions?: string;
  createdBy?: string;
}

interface ModuleChallenges {
  active: any[];
  completed: any[];
  available: Challenge[];
}

interface ChallengeStats {
  totalActiveChallenges: number;
  totalCompletedChallenges: number;
  totalXp: number;
  currentLevel: number;
  badgesEarned: number;
  currentStreak: number;
}

interface ChallengeDashboard {
  journaling: ModuleChallenges;
  meditation: ModuleChallenges;
  music: ModuleChallenges;
  article: ModuleChallenges;
  profile: any;
  stats: ChallengeStats;
}

function CategoryPill({ label, tone }: { label: string; tone: "warning" | "info" | "success" }) {
  const map = {
    warning: "bg-[#F59E0B1A] text-[#F59E0B]",
    info: "bg-[#3B82F61A] text-[#3B82F6]", 
    success: "bg-[#10B9811A] text-[#10B981]",
  } as const;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${map[tone]}`}>
      {label}
    </span>
  );
}

function ActiveChallengeCard({ 
  title, 
  category, 
  description, 
  progress, 
  startDate, 
  endDate, 
  daysLeft,
  tone,
  onViewDetails
}: {
  title: string;
  category: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  daysLeft: number;
  tone: "warning" | "info" | "success";
  onViewDetails: () => void;
}) {
  return (
    <Card className="bg-white border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-6 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-[17px] font-bold text-[#1E293B]">{title}</h3>
            <CategoryPill label={category} tone={tone} />
          </div>
          <p className="text-[#64748B] text-sm">{description}</p>
        </div>
        <Button 
          variant="ghost" 
          className="bg-[#3B82F60D] text-[#3B82F6] hover:bg-[#3B82F61A] font-semibold px-6 rounded-xl"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-[#3B82F6] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[#3B82F6] font-bold text-sm">{progress}%</span>
      </div>
    </Card>
  );
}

function CompletedChallengeCard({ 
  title, 
  category, 
  description, 
  completedOn, 
  daysTaken,
  tone,
  onViewDetails
}: {
  title: string;
  category: string;
  description: string;
  completedOn?: string;
  daysTaken?: number;
  tone: "warning" | "info" | "success";
  onViewDetails: () => void;
}) {
  return (
    <Card className="bg-white border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B9810D]">
            <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-[#1E293B] mb-1">{title}</h3>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <CategoryPill label={category} tone={tone} />
              {daysTaken !== undefined && (
                <div className="flex items-center gap-1">
                  <span>• {daysTaken} days</span>
                </div>
              )}
              {completedOn && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Completed {new Date(completedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="bg-[#3B82F60D] text-[#3B82F6] hover:bg-[#3B82F61A] font-semibold px-6 rounded-xl"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}

// Helper function to get tone based on category
const getCategoryTone = (category: string): "warning" | "info" | "success" => {
  if (!category) return "info";
  const lower = category.toLowerCase();
  if (lower.includes('daily') || lower.includes('journal')) return "info";
  if (lower.includes('streak') || lower.includes('milestone')) return "success";
  return "info";
};

export function ChallengesView() {
  const [showAll, setShowAll] = useState(false);
  const [assignedChallenges, setAssignedChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      console.log('Fetching challenges from /api/student/challenges...');
      const response = await fetch('/api/student/challenges');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', response.status, errorText);
        throw new Error(`Failed to fetch challenges: ${response.status} ${errorText}`);
      }
      
      const data: any = await response.json();
      console.log('Challenges data received:', data);
      
      // Handle dashboard API response structure
      if (data.data && data.data.journaling) {
        // Aggregate challenges from all modules
        const allActive = [
          ...(data.data.journaling.active || []),
          ...(data.data.meditation.active || []),
          ...(data.data.music.active || []),
          ...(data.data.article.active || [])
        ];
        
        const allCompleted = [
          ...(data.data.journaling.completed || []),
          ...(data.data.meditation.completed || []),
          ...(data.data.music.completed || []),
          ...(data.data.article.completed || [])
        ];
        
        // Transform to the expected format
        const transformedActive = allActive.map((uc: any) => ({
          id: uc.challenge.id,
          title: uc.challenge.name,
          description: uc.challenge.description,
          category: uc.challenge.category || 'General',
          progress: uc.progressPercentage || 0,
          startDate: uc.assignedAt,
          endDate: uc.challenge.endsAt,
          daysLeft: uc.challenge.endsAt ? Math.ceil((new Date(uc.challenge.endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
          tone: getCategoryTone(uc.challenge.category),
          moduleType: (uc.challenge.moduleType || 'JOURNALING') as ModuleType,
          challengeType: (uc.challenge.challengeType || 'DAILY') as ChallengeType,
          targetValue: uc.challenge.targetValue || 1,
          targetUnit: uc.challenge.targetUnit || 'ENTRIES',
          rewardPoints: uc.challenge.rewardPoints || 10,
          difficulty: uc.challenge.difficulty || 'BEGINNER'
        }));
        
        const transformedCompleted = allCompleted.map((uc: any) => ({
          id: uc.challenge.id,
          title: uc.challenge.name,
          description: uc.challenge.description,
          category: uc.challenge.category || 'General',
          completedOn: uc.completedAt,
          tone: getCategoryTone(uc.challenge.category),
          moduleType: (uc.challenge.moduleType || 'JOURNALING') as ModuleType,
          challengeType: (uc.challenge.challengeType || 'DAILY') as ChallengeType,
          targetValue: uc.challenge.targetValue || 1,
          targetUnit: uc.challenge.targetUnit || 'ENTRIES',
          rewardPoints: uc.challenge.rewardPoints || 10,
          difficulty: uc.challenge.difficulty || 'BEGINNER'
        }));
        
        // Deduplicate challenges by ID to prevent duplicate key errors
        const uniqueActive = Array.from(
          new Map(transformedActive.map((item) => [item.id, item])).values()
        );
        
        const uniqueCompleted = Array.from(
          new Map(transformedCompleted.map((item) => [item.id, item])).values()
        );
        
        setAssignedChallenges(uniqueActive);
        setCompletedChallenges(uniqueCompleted);
      } else if (data.assignedChallenges || data.completedChallenges) {
        // Handle legacy response structure
        setAssignedChallenges(data.assignedChallenges || []);
        setCompletedChallenges(data.completedChallenges || []);
      } else {
        console.warn('Unexpected API response structure:', data);
        setAssignedChallenges([]);
        setCompletedChallenges([]);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      // Set empty arrays on error
      setAssignedChallenges([]);
      setCompletedChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const displayAssignedChallenges = showAll ? assignedChallenges : assignedChallenges.slice(0, 2);
  const displayCompletedChallenges = showAll ? completedChallenges : completedChallenges.slice(0, 2);

  if (loading) {
    return (
      <div className="mt-10 space-y-8">
        <div className="bg-card border-border rounded-[24px] p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#E2E8F0] mx-auto mb-4">
            <Trophy className="h-8 w-8 text-[#64748B] animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Loading Challenges...</h3>
          <p className="text-[#64748B]">
            Fetching your assigned challenges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Assigned Challenges Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-[#1E293B]">Active ({assignedChallenges.length})</h2>
          {assignedChallenges.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show All"}
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {displayAssignedChallenges.map((challenge) => (
            <ActiveChallengeCard
              key={challenge.id}
              title={challenge.title}
              category={challenge.category ?? 'General'}
              description={challenge.description}
              progress={challenge.progress ?? 0}
              startDate={challenge.startDate ?? ''}
              endDate={challenge.endDate ?? ''}
              daysLeft={challenge.daysLeft ?? 0}
              tone={challenge.tone ?? 'info'}
              onViewDetails={() => {
                setSelectedChallenge(challenge);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      </section>

      {/* Completed Challenges Section */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-10">
          <h2 className="text-[18px] font-bold text-[#1E293B]">Completed ({completedChallenges.length})</h2>
          {completedChallenges.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show All"}
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {displayCompletedChallenges.map((challenge) => (
            <CompletedChallengeCard
              key={challenge.id}
              title={challenge.title}
              category={challenge.category ?? 'General'}
              description={challenge.description}
              completedOn={challenge.endDate}
              daysTaken={0}
              tone="success"
              onViewDetails={() => {
                setSelectedChallenge(challenge);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      </section>

      {/* No Challenges State */}
      {assignedChallenges.length === 0 && completedChallenges.length === 0 && (
        <div className="bg-card border-border rounded-[24px] p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#E2E8F0] mx-auto mb-4">
            <Trophy className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No Challenges Yet</h3>
          <p className="text-[#64748B]">
            Start your first challenge to begin tracking your progress and earning badges!
          </p>
          <Button className="mt-4 bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90">
            Browse Challenges
          </Button>
        </div>
      )}

      {/* Challenge Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[480px] p-0 overflow-hidden rounded-[24px] border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedChallenge?.title || "Challenge Details"}</DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-2">
                <CategoryPill label={selectedChallenge?.category || ""} tone={selectedChallenge?.tone || "info"} />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedChallenge ? Math.ceil((new Date(selectedChallenge.endDate ?? '').getTime() - new Date(selectedChallenge.startDate ?? '').getTime()) / (1000 * 60 * 60 * 24)) : 0} Days
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B] mb-3">{selectedChallenge?.title}</h2>
                <p className="text-[#64748B] text-[15px] leading-relaxed">
                  {selectedChallenge?.description}
                </p>
              </div>

              <div>
                <h3 className="text-[16px] font-semibold text-[#1E293B] mb-4">Instructions</h3>
                <div className="space-y-4">
                  {(selectedChallenge?.instructions || "").split('\n').map((step, index) => {
                    // Remove existing numbers if any (e.g. "1. Step" -> "Step")
                    const cleanStep = step.replace(/^\d+[\.\)]\s*/, '').trim();
                    if (!cleanStep) return null;
                    return (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#3B82F61A] text-[#3B82F6] text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-[#64748B] text-[15px] leading-snug pt-0.5">
                          {cleanStep}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-[20px] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#64748B]">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Assigned by</span>
                  </div>
                  <span className="text-sm font-medium text-[#1E293B]">{selectedChallenge?.createdBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#64748B]">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Assigned</span>
                  </div>
                  <span className="text-sm font-medium text-[#1E293B]">
                    {selectedChallenge?.startDate ? new Date(selectedChallenge.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

