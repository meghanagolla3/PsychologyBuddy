'use client';

import { Clock, Calendar, User, Play, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  sessionType: string;
  status: string;
  scheduledAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
    classRef?: {
      id: string;
      name: string;
      grade: number;
      section: string;
    };
  };
  counselor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class?: {
    id: string;
    name: string;
    grade: number;
    section: string;
  };
}

interface SessionListProps {
  sessions: Session[];
  activeTab: 'upcoming' | 'completed' | 'cancelled';
  onStartSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string) => void;
  onCancelSession: (sessionId: string) => void;
  onViewDetails: (sessionId: string) => void;
}

export function SessionList({ 
  sessions, 
  activeTab, 
  onStartSession, 
  onCompleteSession, 
  onCancelSession, 
  onViewDetails 
}: SessionListProps) {
  const formatSessionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'INTAKE': 'Intake',
      'FOLLOW_UP': 'Follow-up',
      'CRISIS': 'Crisis',
      'WELLNESS_CHECK': 'Wellness Check',
      'PARENT_MEETING': 'Parent Meeting',
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'SCHEDULED': 'text-blue-600 bg-blue-50',
      'IN_PROGRESS': 'text-green-600 bg-green-50',
      'COMPLETED': 'text-gray-600 bg-gray-50',
      'CANCELLED': 'text-red-600 bg-red-50',
      'MISSED': 'text-orange-600 bg-orange-50',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionButtons = (session: Session) => {
    switch (session.status) {
      case 'SCHEDULED':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onStartSession(session.id)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            >
              <Play className="h-3 w-3" />
              Start
            </button>
            <button
              onClick={() => onViewDetails(session.id)}
              className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-3 w-3" />
              Details
            </button>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onCompleteSession(session.id)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="h-3 w-3" />
              Complete
            </button>
            <button
              onClick={() => onViewDetails(session.id)}
              className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-3 w-3" />
              Details
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={() => onViewDetails(session.id)}
            className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-3 w-3" />
            View Details
          </button>
        );
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} sessions</h3>
          <p className="text-gray-600">
            {activeTab === 'upcoming' && 'No upcoming sessions scheduled'}
            {activeTab === 'completed' && 'No completed sessions found'}
            {activeTab === 'cancelled' && 'No cancelled sessions found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Stamp
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                      {session.student.firstName?.[0]}{session.student.lastName?.[0]}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {session.student.firstName} {session.student.lastName}
                      </div>
                      {session.student.studentId && (
                        <div className="text-xs text-gray-500">
                          ID: {session.student.studentId}
                        </div>
                      )}
                      {session.student.classRef && (
                        <div className="text-xs text-gray-500">
                          {session.student.classRef.name} - Grade {session.student.classRef.grade}
                          {session.student.classRef.section && ` - Section ${session.student.classRef.section}`}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formatSessionType(session.sessionType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.class?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(session.scheduledAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {getActionButtons(session)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
