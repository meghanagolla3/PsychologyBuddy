import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, Users, CheckCircle2, Clock, TrendingUp, Star, Target, Flame, Award } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ModuleType, ChallengeType, UserChallengeStatus } from "@/src/services/challenges/types/challenge.types";

interface Challenge {
  id: string;
  title: string;
  description: string;
  moduleType: ModuleType;
  challengeType: ChallengeType;
  targetValue: number;
  targetUnit: string;
  rewardPoints: number;
  difficulty: string;
  status?: UserChallengeStatus;
  currentProgress?: number;
  progressPercentage?: number;
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

export default function ChallengesPage() {
  const [dashboard, setDashboard] = useState<ChallengeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ModuleType>(ModuleType.JOURNALING);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/challenges');
      const result = await response.json();
      
      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (challengeId: string) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/student/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Challenge Started!",
          description: "You've begun your wellness journey."
        });
        fetchDashboard();
      } else {
        throw new Error(result.error || 'Failed to start challenge');
      }
    } catch (error) {
      console.error('Error starting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to start challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getModuleIcon = (moduleType: ModuleType) => {
    switch (moduleType) {
      case 'JOURNALING':
        return <Target className="h-5 w-5" />;
      case 'MEDITATION':
        return <Flame className="h-5 w-5" />;
      case 'MUSIC':
        return <Trophy className="h-5 w-5" />;
      case 'ARTICLE':
        return <Award className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getChallengeTypeIcon = (challengeType: ChallengeType) => {
    switch (challengeType) {
      case 'DAILY':
        return <Calendar className="h-4 w-4" />;
      case 'WEEKLY':
        return <Calendar className="h-4 w-4" />;
      case 'STREAK':
        return <Flame className="h-4 w-4" />;
      case 'MILESTONE':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: UserChallengeStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ChallengeCard = ({ challenge, showProgress = true }: { challenge: Challenge; showProgress?: boolean }) => (
    <Card className="bg-white border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getChallengeTypeIcon(challenge.challengeType)}
            <h3 className="font-semibold text-lg text-gray-900">{challenge.title}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {challenge.rewardPoints} XP
            </Badge>
            {challenge.status && (
              <Badge className={getStatusColor(challenge.status)}>
                {challenge.status.replace('_', ' ')}
              </Badge>
            )}
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Target: {challenge.targetValue} {challenge.targetUnit}
          </div>

          {showProgress && challenge.currentProgress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{challenge.currentProgress}/{challenge.targetValue}</span>
              </div>
              <Progress 
                value={challenge.progressPercentage || 0} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!challenge.status || challenge.status === 'NOT_STARTED' ? (
          <Button 
            onClick={() => handleStartChallenge(challenge.id)}
            disabled={isUpdating}
            className="flex-1"
          >
            Start Challenge
          </Button>
        ) : challenge.status === 'COMPLETED' ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <span>In Progress</span>
          </div>
        )}
      </div>
    </Card>
  );

  const ModuleTab = ({ moduleType, challenges }: { moduleType: ModuleType; challenges: ModuleChallenges }) => {
    const { active, completed, available } = challenges;

    return (
      <div className="space-y-6">
        {/* Active Challenges */}
        {active.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Active Challenges ({active.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {active.map((userChallenge) => (
                <ChallengeCard 
                  key={userChallenge.id} 
                  challenge={{
                    ...userChallenge.challenge,
                    status: userChallenge.status,
                    currentProgress: userChallenge.currentProgress,
                    progressPercentage: Math.round((userChallenge.currentProgress / userChallenge.targetValue) * 100)
                  }}
                  showProgress={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Challenges */}
        {available.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Available Challenges ({available.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {available.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  showProgress={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Challenges */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Completed Challenges ({completed.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completed.map((userChallenge) => (
                <ChallengeCard 
                  key={userChallenge.id} 
                  challenge={{
                    ...userChallenge.challenge,
                    status: userChallenge.status,
                    currentProgress: userChallenge.currentProgress,
                    progressPercentage: 100
                  }}
                  showProgress={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {active.length === 0 && available.length === 0 && completed.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Challenges Yet</h3>
            <p className="text-gray-600">Check back soon for new {moduleType.toLowerCase()} challenges!</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load challenges</h3>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-white border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.stats.totalActiveChallenges}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.stats.totalCompletedChallenges}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.stats.totalXp}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.stats.currentLevel}</div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.stats.badgesEarned}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboard.stats.currentStreak}</div>
              <div className="text-sm text-gray-600">Streak</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Module Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ModuleType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="JOURNALING" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Journaling
          </TabsTrigger>
          <TabsTrigger value="MEDITATION" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Meditation
          </TabsTrigger>
          <TabsTrigger value="MUSIC" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="ARTICLE" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="JOURNALING">
          <ModuleTab moduleType={ModuleType.JOURNALING} challenges={dashboard.journaling} />
        </TabsContent>

        <TabsContent value="MEDITATION">
          <ModuleTab moduleType={ModuleType.MEDITATION} challenges={dashboard.meditation} />
        </TabsContent>

        <TabsContent value="MUSIC">
          <ModuleTab moduleType={ModuleType.MUSIC} challenges={dashboard.music} />
        </TabsContent>

        <TabsContent value="ARTICLE">
          <ModuleTab moduleType={ModuleType.ARTICLE} challenges={dashboard.article} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
