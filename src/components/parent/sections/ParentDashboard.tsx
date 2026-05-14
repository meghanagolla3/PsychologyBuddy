"use client";

import React from 'react';
import { ParentLayout } from '../layout/ParentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Clock,
  Star,
  Heart,
  Brain,
  Users
} from 'lucide-react';

export function ParentDashboard() {
  return (
    <ParentLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome back, Jane!</h1>
          <p className="text-sm sm:text-base text-blue-100">Here's what's happening with your child's progress today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Next Session</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">Tomorrow</p>
                  <p className="text-xs text-gray-500">2:00 PM</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">5</p>
                  <p className="text-xs text-gray-500">2 unread</p>
                </div>
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">85%</p>
                  <p className="text-xs text-gray-500">Good</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Child Info Card */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Your Child's Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Quick overview of your child's current status
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src="/placeholder-child.jpg" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm sm:text-lg">
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">John Smith</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Class 9-A • Student ID: STU001</p>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                  <Badge variant="outline" className="text-xs">Good Progress</Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">On Track</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Completed meditation session</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Submitted mood check-in</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Attended counseling session</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Created art journal entry</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                Wellness Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  <span className="text-xs sm:text-sm font-medium">Mood</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500"></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">Good</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium">Stress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-yellow-500"></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">Low</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                  <span className="text-xs sm:text-sm font-medium">Social</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-blue-500"></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">Moderate</span>
                </div>
              </div>

              <Button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm py-2" variant="outline">
                View Detailed Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Upcoming Events</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Important dates and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium">Counseling Session</p>
                  <p className="text-xs text-gray-600">With Dr. Sarah Johnson</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs sm:text-sm font-medium">Tomorrow</p>
                  <p className="text-xs text-gray-600">2:00 PM</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-green-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium">Parent-Teacher Meeting</p>
                  <p className="text-xs text-gray-600">Quarterly progress review</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs sm:text-sm font-medium">Dec 15</p>
                  <p className="text-xs text-gray-600">10:00 AM</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-purple-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium">Wellness Workshop</p>
                  <p className="text-xs text-gray-600">Stress management techniques</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs sm:text-sm font-medium">Dec 20</p>
                  <p className="text-xs text-gray-600">4:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}
