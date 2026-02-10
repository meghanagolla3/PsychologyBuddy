"use client";

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  Users, 
  School, 
  BookOpen, 
  Heart, 
  TrendingUp,
  Activity,
  Award,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { AdminHeader } from '../layout/AdminHeader';

interface DashboardStats {
  totalStudents: number;
  totalSchools: number;
  articles: number;
  activeSessions: number;
  checkinsToday: number;
  activeAlerts: number;
}

export function DashboardOverview() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalSchools: 0,
    articles: 0,
    activeSessions: 0,
    checkinsToday: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  // Mock data for class-wise wellness heatmap
  const classWellnessData = [
    { className: '10-A', students: 45, alerts: 0 },
    { className: '10-B', students: 42, alerts: 0 },
    { className: '10-C', students: 38, alerts: 0 },
    { className: '10-D', students: 40, alerts: 3 },
    { className: '11-A', students: 35, alerts: 4 },
    { className: '11-B', students: 41, alerts: 1 },
    { className: '11-C', students: 37, alerts: 0 },
    { className: '11-D', students: 39, alerts: 0 },
    { className: '12-A', students: 33, alerts: 0 },
    { className: '12-B', students: 36, alerts: 2 },
    { className: '12-C', students: 34, alerts: 0 },
    { className: '12-D', students: 32, alerts: 0 },
  ];

  useEffect(() => {
    // Check for selected school in sessionStorage
    const storedSchool = sessionStorage.getItem('selectedSchool');
    if (storedSchool) {
      const school = JSON.parse(storedSchool);
      setSelectedSchool(school);
      // Clear sessionStorage after using it
      sessionStorage.removeItem('selectedSchool');
    }
    
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // If we have a selected school, use its data
      if (selectedSchool) {
        setStats({
          totalStudents: selectedSchool._count?.users || 0,
          totalSchools: 1,
          articles: 0, // TODO: Implement per-school articles count
          activeSessions: 0, // TODO: Implement per-school active sessions
          checkinsToday: 0, // TODO: Implement per-school check-ins
          activeAlerts: 0, // TODO: Implement per-school alerts
        });
        setLoading(false);
        return;
      }
      
      // Fetch metrics data
      const metricsResponse = await fetch('/api/schools/metrics', {
        credentials: 'include'
      });
      const metricsData = await metricsResponse.json();
      
      if (metricsData.success) {
        let dashboardStats = metricsData.data;
        
        // If user is ADMIN, adjust stats to show only their school's data
        if (permissions.isAdmin && permissions.userSchoolId) {
          // For ADMIN, we need to get their specific school data
          const schoolsResponse = await fetch('/api/schools', {
            credentials: 'include'
          });
          const schoolsData = await schoolsResponse.json();
          
          if (schoolsData.success) {
            const userSchool = schoolsData.data.find((school: any) => 
              school.id === permissions.userSchoolId
            );
            
            if (userSchool) {
              dashboardStats = {
                totalStudents: userSchool._count.users,
                totalSchools: 1,
                articles: 0, // TODO: Implement per-school articles count
                activeSessions: 0, // TODO: Implement per-school active sessions
                checkinsToday: 0, // TODO: Implement per-school check-ins
                activeAlerts: 0, // TODO: Implement per-school alerts
              };
            }
          }
        }
        
        setStats(dashboardStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic stats based on user role
  const statsCards = [
    {
      title: 'Total Students',
      value: loading ? '...' : stats.totalStudents.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      permission: 'users.view',
    },
    {
      title: 'Organizations',
      value: loading ? '...' : stats.totalSchools,
      icon: <School className="w-6 h-6" />,
      color: 'bg-green-500',
      permission: 'organizations.view',
    },
    {
      title: 'Articles',
      value: loading ? '...' : stats.articles,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-purple-500',
      permission: 'psycho.education.view',
    },
    {
      title: 'Active Sessions',
      value: loading ? '...' : stats.activeSessions,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      permission: 'analytics.view',
    },
  ];

  const recentActivities = [
    {
      title: 'New student registration',
      time: '2 hours ago',
      type: 'student',
    },
    {
      title: 'Article published: "Managing Anxiety"',
      time: '4 hours ago',
      type: 'article',
    },
    {
      title: 'Journaling session completed',
      time: '6 hours ago',
      type: 'activity',
    },
    {
      title: 'New admin account created',
      time: '1 day ago',
      type: 'admin',
    },
  ];

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Create a new student account',
      icon: <Users className="w-5 h-5" />,
      action: 'students',
      permission: 'users.create',
    },
    {
      title: 'Create Article',
      description: 'Add new psycho-education content',
      icon: <BookOpen className="w-5 h-5" />,
      action: 'psycho-education',
      permission: 'psycho.education.create',
    },
    {
      title: 'View Analytics',
      description: 'Check platform usage statistics',
      icon: <TrendingUp className="w-5 h-5" />,
      action: 'analytics',
      permission: 'analytics.view',
    },
    {
      title: 'Manage Settings',
      description: 'Configure platform features',
      icon: <Activity className="w-5 h-5" />,
      action: 'settings',
      permission: 'settings.update',
    },
  ];

  return (
    <div>
      {/* Header */}
      <AdminHeader 
                  title="Welcome back, Sarah" 
                  subtitle="Here's what's happening with your students today"
                />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards
          .filter((stat: any) => !stat.permission || permissions.hasPermission(stat.permission))
          .map((stat: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Selected School Info */}
      {selectedSchool && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">School Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">{selectedSchool.name}</h3>
              <p className="text-sm text-gray-500">School Name</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">{selectedSchool._count?.users || 0}</h3>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Active</h3>
              <p className="text-sm text-gray-500">School Status</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>School ID:</strong> {selectedSchool.id}
            </p>
            {selectedSchool.address && (
              <p className="text-sm text-gray-600">
                <strong>Address:</strong> {selectedSchool.address}
              </p>
            )}
            {selectedSchool.email && (
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedSchool.email}
              </p>
            )}
            {selectedSchool.phone && (
              <p className="text-sm text-gray-600">
                <strong>Phone:</strong> {selectedSchool.phone}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Admin School Info (when no selected school) */}
      {!selectedSchool && permissions.isAdmin && user?.school && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your School Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">{user.school.name}</h3>
              <p className="text-sm text-gray-500">School Name</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">{loading ? '...' : stats.totalStudents}</h3>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Active</h3>
              <p className="text-sm text-gray-500">School Status</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>School ID:</strong> {user.school.id}
            </p>
          </div>
        </div>
      )}

      {/* Class-wise Wellness Heatmap */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Class-wise Wellness Heatmap</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">No Alerts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Has Alerts</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classWellnessData.map((classData, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${
                classData.alerts > 0 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{classData.className}</h3>
                {classData.alerts > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{classData.alerts} alerts</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{classData.students} students</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'student' ? 'bg-blue-500' :
                    activity.type === 'article' ? 'bg-purple-500' :
                    activity.type === 'activity' ? 'bg-green-500' :
                    'bg-orange-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions
              .filter(action => !action.permission || permissions.hasPermission(action.permission))
              .map((action, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // This would navigate to the respective section
                    console.log('Navigate to:', action.action);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600">{action.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* SuperAdmin Only Info */}
      {permissions.isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Award className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">SuperAdmin Access</h3>
              <p className="text-blue-700 mt-1">
                You have full system access. You can manage all organizations, users, and platform settings.
                Use the Access Control section to manage admin permissions and feature toggles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Only Info */}
      {permissions.isAdmin && user?.school && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <School className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">School Admin Access</h3>
              <p className="text-green-700 mt-1">
                You are managing <strong>{user.school.name}</strong>. You can add students, 
                create educational content, and manage self-help tools for your school.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
