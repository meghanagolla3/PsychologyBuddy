"use client";

import React from 'react';
import { ParentLayout } from '../layout/ParentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  Heart,
  Brain
} from 'lucide-react';

export function ActivitySection() {
  const activities = [
    {
      id: 1,
      type: 'meditation',
      title: 'Completed meditation session',
      description: '10-minute mindfulness exercise',
      time: '2 hours ago',
      status: 'completed',
      icon: Brain
    },
    {
      id: 2,
      type: 'mood',
      title: 'Submitted mood check-in',
      description: 'Reported feeling happy and focused',
      time: '5 hours ago',
      status: 'completed',
      icon: Heart
    },
    {
      id: 3,
      type: 'session',
      title: 'Attended counseling session',
      description: 'Weekly session with school counselor',
      time: 'Yesterday',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'journal',
      title: 'Created art journal entry',
      description: 'Expressed feelings through drawing',
      time: '2 days ago',
      status: 'completed',
      icon: Activity
    },
    {
      id: 5,
      type: 'exercise',
      title: 'Physical activity',
      description: 'Completed daily exercise routine',
      time: '3 days ago',
      status: 'completed',
      icon: TrendingUp
    }
  ];

  const upcomingActivities = [
    {
      id: 1,
      title: 'Meditation Session',
      description: 'Guided mindfulness practice',
      time: 'Tomorrow, 9:00 AM',
      icon: Brain
    },
    {
      id: 2,
      title: 'Mood Check-in',
      description: 'Daily wellness assessment',
      time: 'Tomorrow, 2:00 PM',
      icon: Heart
    }
  ];

  return (
    <ParentLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-600 mt-1">Track your child's wellness activities and progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <Calendar className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">92%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>
              Scheduled activities for your child
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Your child's completed wellness activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{activity.time}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Load More Button */}
        <div className="flex justify-center">
          <Button variant="outline">Load More Activities</Button>
        </div>
      </div>
    </ParentLayout>
  );
}
