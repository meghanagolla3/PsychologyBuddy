"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Activity, BookOpen, Wind, Brain, Heart, Target, FileText } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";

interface ActivityItem {
  id: string;
  type: 'checkin' | 'assessment' | 'exercise' | 'reading' | 'meditation' | 'goal' | 'journaling' | 'tool' | 'Chat Session';
  title: string;
  time: string;
  timestamp?: string;
  details?: string;
  date: string;
}

// API function to fetch recent activity (same as StudentProfile)
async function fetchStudentProfile(id: string) {
  const res = await fetch(`/api/students/${id}/profile`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch profile");
  return json.data;
}

function ActivitySection({ activities }: { activities: ActivityItem[] }) {
  const getIcon = (type: string) => {
    if (type === "journaling") return <FileText className="w-5 h-5 text-purple-500" />;
    if (type === "exercise") return <Wind className="w-5 h-5 text-green-500" />;
    if (type === "tool") return <Brain className="w-5 h-5 text-indigo-500" />;
    if (type === "checkin") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (type === "assessment") return <Activity className="w-5 h-5 text-blue-600" />;
    if (type === "reading") return <BookOpen className="w-5 h-5 text-purple-600" />;
    if (type === "meditation") return <Brain className="w-5 h-5 text-indigo-600" />;
    if (type === "goal") return <Target className="w-5 h-5 text-orange-600" />;
    if (type === "Chat Session") return <Activity className="w-5 h-5 text-blue-500" />;
    return <Activity className="w-5 h-5 text-blue-500" />;
  };

  // Sort activities by date (most recent first)
  const sortedActivities = activities.sort((a: ActivityItem, b: ActivityItem) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
      </div>

      {sortedActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No activities yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Start using journaling, exercises, or self-help tools to see your activity here
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
          {sortedActivities.map((activity: ActivityItem) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {getIcon(activity.type)}
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
                {activity.details && (
                  <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecentActivity() {
  const { user } = useAuth();
  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => fetchStudentProfile(user!.id),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4 border-l-2 border-gray-200 pl-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
     );
  }

  if (isError || !profileData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-gray-500">Failed to load recent activity</p>
        </div>
      </div>
    );
  }

  const { activities } = profileData;
  return <ActivitySection activities={activities || []} />;
}