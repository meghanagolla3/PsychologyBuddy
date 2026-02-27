import BadgeProgress from "@/src/components/StudentDashboard/Dashboard/BadgeProgress";
import CurrentStreak from "@/src/components/StudentDashboard/Dashboard/CurrentStreak";
import DailyMotivation from "@/src/components/StudentDashboard/Dashboard/DailyMotivation";
import EmotionalPatterns from "@/src/components/StudentDashboard/Dashboard/EmotionalPatterns";
import ExerciseCard from "@/src/components/StudentDashboard/Dashboard/ExerciseCard";
import ExploreSpace from "@/src/components/StudentDashboard/Dashboard/ExploreSpace";
import HeaderGreeting from "@/src/components/StudentDashboard/Dashboard/HeaderGreeting";
import StatsCards from "@/src/components/StudentDashboard/Dashboard/StatsCards";
import WeeklyMoodTrends from "@/src/components/StudentDashboard/Dashboard/WeeklyMoodTrends";
import RecentActivity from "@/src/components/StudentDashboard/Dashboard/RecentActivity";
import StudentLayout from "@/src/components/StudentDashboard/Layout/StudentLayout";

export default function DashboardPage() {
  return (
    <StudentLayout>
      <div className="flex justify-center w-full">
        <div className="p-6 space-y-6 w-full max-w-[1212px]">

          {/* Greeting */}
          <HeaderGreeting />

          {/* Stats Row */}
          <StatsCards />

          {/* Explore Section */}
          <ExploreSpace />

          {/* GRID LAYOUT STARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* Left Column */}
            <div className="space-y-6">
              <DailyMotivation />
              <BadgeProgress />
              <CurrentStreak />
              <EmotionalPatterns />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <WeeklyMoodTrends />
              <ExerciseCard />
              <RecentActivity />
            </div>

          </div>
          {/* GRID END */}

        </div>
      </div>
    </StudentLayout>
  );
}