'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface SessionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
}

export function SessionDetailsModal({ open, onOpenChange, session }: SessionDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !session) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Student Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {session.student?.firstName} {session.student?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.student?.email}
                      </div>
                      {session.student?.studentId && (
                        <div className="text-xs text-gray-500">
                          ID: {session.student.studentId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Student ID:</span> {session.student?.studentId || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Class:</span> {session.student?.classRef?.name || 'N/A'}
                    </div>
                    {session.student?.classRef?.grade && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Grade:</span> {session.student.classRef.grade}
                      </div>
                    )}
                    {session.student?.classRef?.section && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Section:</span> {session.student.classRef.section}
                      </div>
                    )}
                  </div>
                </div>

                {/* Counselor Info */}
                <div>
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Counselor:</span> {session.counselor?.firstName} {session.counselor?.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {session.counselor?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Session Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Session Type:</span> {formatSessionType(session.sessionType)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> 
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Scheduled Time:</span> {formatDate(session.scheduledAt)}
                  </div>
                  {session.startedAt && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Started At:</span> {formatDate(session.startedAt)}
                    </div>
                  )}
                  {session.endedAt && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Ended At:</span> {formatDate(session.endedAt)}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Title & Agenda</h4>
                  <div className="text-sm text-gray-800 mb-2">
                    <span className="font-medium">Title:</span> {session.title}
                  </div>
                  {session.agenda && (
                    <div className="text-sm text-gray-800">
                      <span className="font-medium">Agenda:</span> {session.agenda}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Linked Escalation */}
            {session.escalation && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  Linked Escalation Alert
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {session.escalation.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Severity:</span> {session.escalation.severity}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {session.escalation.status}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-800">{session.escalation.description}</p>
                    </div>
                    {session.escalation.detectedPhrases && session.escalation.detectedPhrases.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Detected Phrases</h4>
                        <div className="flex flex-wrap gap-2">
                          {session.escalation.detectedPhrases.map((phrase: string, index: number) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {phrase}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Outcome */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes & Outcome</h3>
              <div className="space-y-4">
                {session.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Session Notes</h4>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                      {session.notes}
                    </p>
                  </div>
                )}
                
                {session.outcome && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Session Outcome</h4>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                      {session.outcome}
                    </p>
                  </div>
                )}
                
                {session.followUpNeeded !== undefined && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${session.followUpNeeded ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-600">
                      Follow-up needed: {session.followUpNeeded ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                
                {session.nextSessionAt && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Next Session:</span> {formatDate(session.nextSessionAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Previous Sessions */}
            {session.previousSessions && session.previousSessions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Sessions</h3>
                <div className="space-y-3">
                  {session.previousSessions.map((prevSession: any, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prevSession.counselor?.firstName} {prevSession.counselor?.lastName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatDate(prevSession.scheduledAt)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {prevSession.status}
                        </div>
                      </div>
                      {prevSession.notes && (
                        <p className="text-sm text-gray-700 mt-2">{prevSession.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Trend */}
            {session.moodCheckins && session.moodCheckins.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Mood Check-ins</h3>
                <div className="space-y-2">
                  {session.moodCheckins.slice(0, 5).map((mood: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Mood:</span> {mood.mood}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(mood.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
