"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParentLayout } from '../layout/ParentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  ClipboardCheck
} from 'lucide-react';
import { ParentRequestMeetingModal } from './ParentRequestMeetingModal';

interface Meeting {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  counselorName: string;
  counselorEmail: string;
  date: string;
  time: string;
  purpose: string;
  level: string;
  status: 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  parentName: string;
  parentId?: string;
  requestedBy: 'COUNSELOR' | 'PARENT';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function MeetingsSection() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    studentId: '',
    date: '',
    time: '',
    purpose: '',
    level: 'medium'
  });
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchMeetings();
    fetchChildren();
    
    // Set up polling to check for meeting updates every 10 seconds
    const interval = setInterval(() => {
      fetchMeetings();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchChildren = async () => {
    try {
      // For now, we'll extract unique students from existing meetings
      // In a real app, you'd have a dedicated API to get parent's children
      const response = await fetch('/api/parent/meetings-test');
      const result = await response.json();
      
      if (result.success) {
        const uniqueStudents = result.data.reduce((acc: any[], meeting: Meeting) => {
          // Check if we already have this student
          if (!acc.find(student => student.id === meeting.studentId)) {
            acc.push({
              id: meeting.studentId,
              name: meeting.studentName,
              email: meeting.studentEmail
            });
          }
          return acc;
        }, []);
        setChildren(uniqueStudents);
        console.log('Fetched children:', uniqueStudents);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleRequestMeeting = async () => {
    try {
      const response = await fetch('/api/parent/meetings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestForm),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting request submitted:', result);
        
        // Reset form and close modal
        setRequestForm({
          studentId: '',
          date: '',
          time: '',
          purpose: '',
          level: 'medium'
        });
        setShowRequestModal(false);
        
        // Refresh meetings
        fetchMeetings();
      } else {
        const errorText = await response.text();
        console.error('Failed to submit meeting request:', errorText);
      }
    } catch (error) {
      console.error('Error submitting meeting request:', error);
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      // This function can be used for counselor-side cancel if needed
      console.log('Canceling meeting:', meetingId);
    } catch (error) {
      console.error('Error canceling meeting:', error);
    }
  };

  const handleConfirmMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/parent/meetings/${meetingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting confirmed:', result);
        fetchMeetings(); // Refresh meetings list
      } else {
        const errorText = await response.text();
        console.error('Failed to confirm meeting:', errorText);
      }
    } catch (error) {
      console.error('Error confirming meeting:', error);
    }
  };

  const handleParentCancelMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/parent/meetings/${meetingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting cancelled:', result);
        fetchMeetings(); // Refresh meetings list
      } else {
        const errorText = await response.text();
        console.error('Failed to cancel meeting:', errorText);
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      console.log('Fetching parent meetings...');
      const response = await fetch('/api/parent/meetings-test');
      
      if (!response) {
        console.error('No response from meetings API');
        setLoading(false);
        return;
      }
      
      console.log('Parent meetings API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Parent meetings API error:', errorText);
        console.error('Error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200)
        });
        
        if (errorText.includes('<!DOCTYPE')) {
          console.error('Authentication or routing error - received HTML instead of JSON');
        }
        
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      
      console.log('Meetings API Response success:', result.success);
      console.log('Meetings data length:', result.data?.length);
      
      if (result.success) {
        const newMeetings = result.data;
        const currentPendingCount = newMeetings.filter((m: Meeting) => m.status === 'PENDING').length;
        
        // Check if there are new PENDING meetings
        if (previousPendingCount > 0 && currentPendingCount > previousPendingCount) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000); // Hide after 5 seconds
        }
        
        setMeetings(newMeetings);
        setPreviousPendingCount(currentPendingCount);
      } else {
        console.error('Meetings API Error:', result.message);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
  const matchesSearch = searchTerm === '' || 
    meeting.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.counselorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.purpose.toLowerCase().includes(searchTerm.toLowerCase());
  
  switch (activeFilter) {
    case 'upcoming':
      return matchesSearch && (meeting.status === 'SCHEDULED' || meeting.status === 'IN_PROGRESS');
    case 'completed':
      return matchesSearch && meeting.status === 'COMPLETED';
    case 'cancelled':
      return matchesSearch && meeting.status === 'CANCELLED';
    default:
      return matchesSearch;
  }
});

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge className="bg-green-100 text-green-800 border-green-200">In Session</Badge>;
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case 'SCHEDULED':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Completed</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getRequestTypeLabel = (requestedBy: string) => {
  switch (requestedBy) {
    case 'COUNSELOR':
      return 'Counselor Requested';
    case 'PARENT':
      return 'Parent Requested';
    default:
      return 'Counselor Requested';
  }
};

const getRequestTypeColor = (requestedBy: string) => {
  switch (requestedBy) {
    case 'COUNSELOR':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PARENT':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

  return (
    <ParentLayout>
      <div className="p-6 space-y-6">
        {/* Notification Alert */}
        {showNotification && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h4 className="text-sm font-semibold text-green-800">New Meeting Request!</h4>
                <p className="text-xs text-green-600">A counselor has started a session. Join now!</p>
              </div>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage upcoming and past meetings with the counselor.
            </p>
          </div>
          <Button onClick={() => setShowRequestModal(true)}>
            <ClipboardCheck />
            Request meeting
          </Button>
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading meetings...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm ? 'No meetings match your search criteria' : 'No meetings found for the selected filter'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="flex items-center justify-between gap-4 p-5 flex-wrap bg-[#EFF3F9] border-[#1279F8]/50 rounded-[16px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#3A3A3A] leading-tight">
                      {meeting.status === 'IN_PROGRESS' ? 'Meeting in Progress' : 'Upcoming Meeting'}
                    </h3>
                    <p className="text-[14px] text-[#707D8F] mt-1">
                      {formatDate(meeting.date)} · {meeting.time} · {meeting.counselorName} · Duration : 01 hr
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {meeting.status === 'IN_PROGRESS' ? (
                    <Button className="bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-xl px-6">
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                  ) : meeting.status === 'PENDING' ? (
                    meeting.requestedBy === 'PARENT' ? (
                      <Button
                        variant="outline"
                        className="text-[#EF4444] border-[#EF4444] hover:bg-[#EF44440D] rounded-xl px-8"
                        onClick={() => handleParentCancelMeeting(meeting.id)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <>
                        <Button 
                          className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-xl px-8"
                          onClick={() => handleConfirmMeeting(meeting.id)}
                        >
                          Confirm Meeting
                        </Button>
                        <Button
                          variant="outline"
                          className="text-[#EF4444] border-[#EF4444] hover:bg-[#EF44440D] rounded-xl px-8"
                          onClick={() => handleParentCancelMeeting(meeting.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )
                  ) : (
                    <Button 
                      variant="outline" 
                      className="border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC] rounded-xl px-6"
                      onClick={() => router.push(`/parent/parent-meetings/${meeting.id}${meeting.status === 'COMPLETED' ? '?mode=preview' : ''}`)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Request Meeting Modal */}
        <ParentRequestMeetingModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          onMeetingCreated={() => {
            setShowRequestModal(false);
            fetchMeetings();
          }}
        />
      </div>
    </ParentLayout>
  );
}
