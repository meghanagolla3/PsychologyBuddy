"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParentLayout } from '../layout/ParentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';
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
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  Eye
} from 'lucide-react';
import { ParentRequestMeetingModal } from './ParentRequestMeetingModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  discussion?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export function MeetingsSection() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/parent/meetings-test');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMeetings(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/parent/meetings/${meetingId}/confirm`, {
        method: 'POST',
      });
      if (response.ok) fetchMeetings();
    } catch (error) {
      console.error('Error confirming meeting:', error);
    }
  };

  const handleParentCancelMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/parent/meetings/${meetingId}/cancel`, {
        method: 'POST',
      });
      if (response.ok) fetchMeetings();
    } catch (error) {
      console.error('Error cancelling meeting:', error);
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

  const upcomingMeetings = meetings.filter(m => 
    ['SCHEDULED', 'PENDING', 'IN_PROGRESS'].includes(m.status)
  );

  const historyMeetings = meetings.filter(m => 
    ['COMPLETED', 'CANCELLED'].includes(m.status)
  );

  return (
    <ParentLayout>
      <div className="p-2 sm:p-4 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap px-2">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#3A3A3A]">Meetings</h1>
            <p className="text-sm sm:text-[14px] text-[#707D8F] mt-1">
              Manage upcoming and past meetings with the counselor.
            </p>
          </div>
          <div 
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-[#2D85F2] hover:bg-[#2D85F2]/90 text-white rounded-[12px] px-4 py-2 sm:py-2.5 cursor-pointer text-sm sm:text-base shadow-sm shadow-[#2D85F2]/20"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Request meeting</span>
          </div>
        </div>

        {/* Upcoming Meetings Section */}
        {upcomingMeetings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
              {upcomingMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="min-w-[280px] sm:min-w-[500px] flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-[#EFF3F9] border-[#1279F8]/30 rounded-[21px] shadow-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-white flex items-center justify-center text-[#3B82F6] shadow-sm">
                      <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-[18px] text-[#3A3A3A] leading-tight">
                        {meeting.status === 'IN_PROGRESS' ? 'Meeting in Progress' : 'Upcoming Meeting'}
                      </h3>
                      <p className="text-xs sm:text-[14px] text-[#707D8F] mt-1 line-clamp-1">
                        {formatDate(meeting.date)} · {meeting.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {meeting.status === 'IN_PROGRESS' ? (
                      <Button 
                        variant="outline"
                        className="w-full sm:w-auto border-[#E2E8F0] text-[#3A3A3A] hover:bg-[#F8FAFC] rounded-[12px] px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm font-semibold flex items-center justify-center gap-2"
                        onClick={() => router.push(`/parent/parent-meetings/${meeting.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    ) : meeting.status === 'PENDING' ? (
                      <>
                        <Button 
                          className="flex-1 sm:flex-none bg-[#2D85F2] hover:bg-[#2D85F2]/90 text-white rounded-[12px] px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm font-semibold"
                          onClick={() => handleConfirmMeeting(meeting.id)}
                        >
                          Confirm Meeting
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444]/5 rounded-[12px] px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm font-semibold"
                          onClick={() => handleParentCancelMeeting(meeting.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                       <Button 
                        variant="outline" 
                        className="w-full sm:w-auto border-[#E2E8F0] text-[#3A3A3A] hover:bg-[#F8FAFC] rounded-[12px] px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm font-semibold"
                        onClick={() => router.push(`/parent/parent-meetings/${meeting.id}`)}
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* Meeting History Section */}
        <div className="bg-white rounded-[24px] border border-[#D5DAE0] -mt-5 p-4 sm:p-8">
          <h2 className="text-xl sm:text-[24px] font-bold text-[#3A3A3A] mb-6 sm:mb-8">Meeting History</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D85F2]"></div>
              <p className="text-[#707D8F] mt-4">Loading history...</p>
            </div>
          ) : historyMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-[#F8FAFC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-[#94A3B8]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#3A3A3A]">No meeting history</h3>
              <p className="text-[#707D8F] mt-1">Your past meetings will appear here.</p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-0 sm:pr-2 custom-scrollbar">
              <Accordion type="single" collapsible className="space-y-4">
                {historyMeetings.map((meeting) => (
                  <AccordionItem 
                    key={meeting.id} 
                    value={meeting.id}
                    className="border-2 border-[#CACFD5]/40 rounded-[20px] sm:rounded-[24px] px-4 sm:px-8 py-0 sm:py-1 data-[state=open]:bg-[#F8FAFC] transition-colors overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-[#94A3B8]">
                      <div className="flex flex-col items-start gap-1 sm:gap-2 w-full text-left">
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <span className="text-lg sm:text-[20px] font-bold text-[#3A3A3A]">
                            {formatDate(meeting.date)}
                          </span>
                          <div className={cn(
                            "rounded-full sm:rounded-[12px] px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-[12px] font-bold uppercase tracking-wider",
                            meeting.status === 'COMPLETED' 
                              ? "bg-[#EEFEF4] text-[#16A249] " 
                              : "bg-[#FFF2F2] text-[#E53935] "
                          )}>
                            {meeting.status}
                          </div>
                        </div>
                        <p className="text-sm sm:text-[16px] text-[#707D8F] font-medium line-clamp-1">
                          {meeting.purpose || "Meeting summary"}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 sm:pb-8 space-y-6">
                      <div className="h-[1px] bg-[#E5E5E5] w-full mb-4 sm:mb-6" />
                      
                      {/* Meeting Purpose Section */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#16A249] text-white flex items-center justify-center text-[10px] sm:text-[12px] font-bold">1</div>
                          <h4 className="font-bold text-base sm:text-[18px] text-[#3A3A3A]">Meeting Purpose</h4>
                        </div>
                        <div className="bg-[#EEFEF4] border border-[#B8D8C4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6">
                          <p className="text-sm sm:text-[16px] text-[#475569] leading-relaxed">
                            {meeting.purpose || 'No purpose specified'}
                          </p>
                        </div>
                      </div>

                      {/* Discussion Summary Section */}
                      {meeting.discussion && meeting.discussion.trim() !== '' && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#3496D0] text-white flex items-center justify-center text-[10px] sm:text-[12px] font-bold">2</div>
                            <h4 className="font-bold text-base sm:text-[18px] text-[#3A3A3A]">Discussion Summary</h4>
                          </div>
                          <div className="bg-[#F0F7FF] border border-[#B8D1E6] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6">
                            <ul className="space-y-2 sm:space-y-3">
                              {meeting.discussion.split('\n').filter(Boolean).map((item, i) => (
                                <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-[16px] text-[#475569] leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#3496D0] mt-1.5 sm:mt-2.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Recommendations Section */}
                      {meeting.recommendations && meeting.recommendations.trim() !== '' && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#6A63E9] text-white flex items-center justify-center text-[10px] sm:text-[12px] font-bold">3</div>
                            <h4 className="font-bold text-base sm:text-[18px] text-[#3A3A3A]">Recommendations</h4>
                          </div>
                          <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6">
                            <ul className="space-y-2 sm:space-y-3">
                              {meeting.recommendations.split('\n').filter(Boolean).map((item, i) => (
                                <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-[16px] text-[#475569] leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#6A63E9] mt-1.5 sm:mt-2.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Counselor Notes Section */}
                      {meeting.notes && meeting.notes.trim() !== '' && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#EB941A] text-white flex items-center justify-center text-[10px] sm:text-[12px] font-bold">4</div>
                            <h4 className="font-bold text-base sm:text-[18px] text-[#3A3A3A]">Counselor Notes</h4>
                          </div>
                          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-[16px] sm:rounded-[20px] p-4 sm:p-6">
                            <ul className="space-y-2 sm:space-y-3">
                              {meeting.notes.split('\n').filter(Boolean).map((item, i) => (
                                <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-[16px] text-[#475569] leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#EB941A] mt-1.5 sm:mt-2.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {meeting.status === 'COMPLETED' && (
                        <div className="pt-2 sm:pt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto border-[#2D85F2] text-[#2D85F2] hover:bg-[#2D85F2]/5 rounded-[12px] px-6 sm:px-8 h-10 sm:h-12 font-bold text-sm sm:text-base"
                            onClick={() => router.push(`/parent/parent-meetings/${meeting.id}?mode=preview`)}
                          >
                            View Full Report
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

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

