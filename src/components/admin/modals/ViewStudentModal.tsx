"use client";

import React, { useState, useEffect } from 'react';
import { X, Eye, Calendar, TrendingUp, MessageSquare, BookOpen, AlertTriangle, Activity } from 'lucide-react';

interface ViewStudentModalProps {
  student: any;
  onClose: () => void;
}

interface TabContent {
  overview: any;
  analytics: any;
  journals: any;
  sessions: any;
}

export function ViewStudentModal({ student, onClose }: ViewStudentModalProps) {
  const [activeTab, setActiveTab] = useState<keyof TabContent>('overview');
  const [tabData, setTabData] = useState<TabContent>({
    overview: null,
    analytics: null,
    journals: null,
    sessions: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      fetchTabData(activeTab);
    }
  }, [student, activeTab]);

  const fetchTabData = async (tab: keyof TabContent) => {
    if (tabData[tab]) return; // Already loaded

    setLoading(true);
    try {
      const response = await fetch(`/api/students/${student.id}/${tab}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setTabData(prev => ({ ...prev, [tab]: data.data }));
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50';
      case 'SUSPENDED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Student ID</label>
            <p className="text-gray-900">{student.studentId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-gray-900">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{student.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900">{student.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
            <p className="text-gray-900">{student.dateOfBirth || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
              {student.status}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">School</label>
            <p className="text-gray-900">{student.school?.name || 'Not assigned'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Class</label>
            <p className="text-gray-900">{student.classRef?.name || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Contact Name</label>
            <p className="text-gray-900">{student.emergencyContact?.name || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Contact Phone</label>
            <p className="text-gray-900">{student.emergencyContact?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Relationship</label>
            <p className="text-gray-900">{student.emergencyContact?.relationship || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{student._count?.chatSessions || 0}</div>
            <div className="text-sm text-gray-500">Chat Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{student._count?.moodCheckins || 0}</div>
            <div className="text-sm text-gray-500">Mood Check-ins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{student.studentProfile?.streaks || 0}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRiskColor(student.studentProfile?.riskLevel)}`}>
              {student.studentProfile?.riskLevel || 'LOW'}
            </div>
            <div className="text-sm text-gray-500">Risk Level</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Average Mood Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Very Happy</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm text-gray-700 ml-2">75%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Happy</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm text-gray-700 ml-2">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Neutral</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm text-gray-700 ml-2">40%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sad</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm text-gray-700 ml-2">20%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Weekly Mood Trend</h4>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p>Chart integration coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Anxiety Triggers</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Stress Triggers</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <div className="text-sm text-gray-600">Social Triggers</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-sm text-gray-600">Academic Triggers</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJournalsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Journals</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">Writing Journal</h4>
                <p className="text-sm text-gray-600 mt-1">Had a good day today. Feeling positive about upcoming exams...</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  2 days ago
                </div>
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Writing</span>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">Art Journal</h4>
                <p className="text-sm text-gray-600 mt-1">Expressed feelings through drawing today...</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  3 days ago
                </div>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Art</span>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">Audio Journal</h4>
                <p className="text-sm text-gray-600 mt-1">Recorded thoughts about presentation anxiety...</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  5 days ago
                </div>
              </div>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">Audio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Sessions</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">Session about exam stress</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  Yesterday, 3:30 PM
                </div>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Completed</span>
            </div>
            <p className="text-sm text-gray-600">Student discussed anxiety about upcoming exams and received coping strategies...</p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">Social anxiety session</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  3 days ago, 2:15 PM
                </div>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Completed</span>
            </div>
            <p className="text-sm text-gray-600">Focused on social situations and building confidence...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'journals', label: 'Journals', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
              {getInitials(student.firstName, student.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{student.firstName} {student.lastName}</h2>
              <p className="text-sm text-gray-500">{student.studentId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as keyof TabContent)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'analytics' && renderAnalyticsTab()}
              {activeTab === 'journals' && renderJournalsTab()}
              {activeTab === 'sessions' && renderSessionsTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
