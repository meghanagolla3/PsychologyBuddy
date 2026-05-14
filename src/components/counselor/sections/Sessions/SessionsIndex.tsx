'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Filter, Plus, Search, Play, ChevronDown, Eye, CalendarClock } from 'lucide-react';
import { ScheduleSessionModal } from '@/src/components/counselor/sections/Alerts/ScheduleSessionModal';
import { AdminLoader } from '@/src/components/admin/ui/AdminLoader';

interface Session {
  id: string;
  title: string;
  sessionType: string;
  status: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
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
  escalation?: {
    id: string;
    category: string;
    level: string;
    severity: number;
    description: string;
    status: string;
    counselorAssignments?: {
      id: string;
      counselorId: string;
      level: string;
    }[];
  };
}

interface SessionsResponse {
  success: boolean;
  data: Session[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export function SessionsIndex() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingSession, setCancelingSession] = useState<Session | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });

  // Fetch sessions
  const fetchSessions = async (tab: typeof activeTab, page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        tab: tab || 'upcoming', // Default to upcoming if no tab specified
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/counselor/sessions?${params}`);
      const data: SessionsResponse = await response.json();

      if (data.success) {
        console.log('[SessionsIndex] Fetched sessions:', data.data);
        setSessions(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Fetch sessions error:', err);
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSessions(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    fetchSessions(activeTab, 1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchSessions(activeTab, page);
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle start session
  const handleStartSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) {
        setError('Session not found');
        return;
      }

      // If session is already IN_PROGRESS, just navigate to it
      if (session.status === 'IN_PROGRESS') {
        if (session.sessionType === 'INTAKE') {
          router.push(`/counselor/sessions/${sessionId}/intake`);
        } else if (session.sessionType === 'FOLLOW_UP') {
          router.push(`/counselor/sessions/${sessionId}/follow-up`);
        } else {
          router.push(`/counselor/sessions/${sessionId}`);
        }
        return;
      }

      // For SCHEDULED sessions, start the session first
      const response = await fetch(`/api/counselor/sessions/${sessionId}/start`, {
        method: 'POST',
      });

      let result;
      try {
        const responseText = await response.text();
        console.log('Session start response text:', responseText);
        
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = { success: response.ok };
        }
      } catch (parseError) {
        console.error('Failed to parse session start response:', parseError);
        result = { success: response.ok };
      }

      if (result.success || response.ok) {
        // Refresh sessions to get updated status
        fetchSessions(activeTab, pagination.page);
        
        // Navigate to appropriate session page based on session type
        if (session.sessionType === 'INTAKE') {
          router.push(`/counselor/sessions/${sessionId}/intake`);
        } else if (session.sessionType === 'FOLLOW_UP') {
          router.push(`/counselor/sessions/${sessionId}/follow-up`);
        } else {
          // For other session types, go to a generic session page
          router.push(`/counselor/sessions/${sessionId}`);
        }
      } else {
        setError(result.message || 'Failed to start session');
      }
    } catch (err) {
      console.error('Start session error:', err);
      setError('Failed to start session');
    }
  };

  // Handle cancel session confirmation
  const handleCancelSessionClick = (session: Session) => {
    setCancelingSession(session);
    setShowCancelModal(true);
  };

  // Handle session canceled
  const handleSessionCanceled = async () => {
    if (!cancelingSession?.id) return;

    try {
      const response = await fetch(`/api/counselor/sessions/${cancelingSession.id}/cancel`, {
        method: 'POST',
      });

      if (response.status === 401) {
        setError('You are not authorized to cancel this session. Please check your permissions.');
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Refresh the sessions list to show the session in cancelled tab
        fetchSessions(activeTab, pagination.page);
        setShowCancelModal(false);
        setCancelingSession(null);
      } else {
        setError(result.message || 'Failed to cancel session');
      }
    } catch (err) {
      console.error('Cancel session error:', err);
      setError('Failed to cancel session');
    }
  };

  // Handle view session details
  const handleViewDetails = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) {
        setError('Session not found');
        return;
      }

      // If in upcoming tab, navigate to student detail page
      if (activeTab === 'upcoming') {
        router.push(`/counselor/students/${session.student.id}`);
        return;
      }

      // For other tabs, navigate to appropriate endpoint based on session status
      if (session.sessionType === 'INTAKE') {
        if (session.status === 'COMPLETED') {
          // View completed intake session
          router.push(`/counselor/sessions/${sessionId}/completed`);
        } else if (session.status === 'IN_PROGRESS') {
          // Resume in-progress intake session
          router.push(`/counselor/sessions/${sessionId}/intake`);
        } else if (session.status === 'SCHEDULED') {
          // Start scheduled intake session
          router.push(`/counselor/sessions/${sessionId}/in-progress`);
        } else {
          // Create new intake session
          router.push(`/counselor/sessions/${sessionId}/completed`);
        }
      } else if (session.sessionType === 'FOLLOW_UP') {
        if (session.status === 'COMPLETED') {
          // View completed follow-up session
          router.push(`/counselor/sessions/${sessionId}/completed`);
        } else if (session.status === 'IN_PROGRESS') {
          // Resume in-progress follow-up session
          router.push(`/counselor/sessions/${sessionId}/follow-up`);
        } else if (session.status === 'SCHEDULED') {
          // Start scheduled follow-up session
          router.push(`/counselor/sessions/${sessionId}/in-progress`);
        } else {
          // Create new follow-up session
          router.push(`/counselor/sessions/${sessionId}/completed`);
        }
      } else {
        // For other session types, navigate to their respective pages
        router.push(`/counselor/sessions/${sessionId}`);
      }
    } catch (err) {
      console.error('View details error:', err);
      setError('Failed to view session details');
    }
  };

  const formatSessionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'INTAKE': 'Session Intake',
      'FOLLOW_UP': 'Follow Up',
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

  const renderLevelBadge = (severity?: string) => {
    if (!severity || typeof severity !== 'string') return <span className="text-gray-400">—</span>;
    
    const s = severity.toUpperCase();
    let config = {
      bg: 'bg-[#FFEFEF]',
      text: 'text-[#C90A0A]',
      border: 'border-[#C90A0A]',
      dot: 'bg-[#C90A0A]'
    };

    if (s === 'HIGH') {
      config = {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100',
        dot: 'bg-red-500'
      };
    } else if (s === 'MEDIUM') {
      config = {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-100',
        dot: 'bg-amber-500'
      };
    } else if (s === 'LOW') {
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        dot: 'bg-emerald-500'
      };
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium ${config.bg} ${config.text} `}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {s.charAt(0) + s.slice(1).toLowerCase()}
      </div>
    );
  };

  const getAssignmentLevel = (session: Session) => {
    if (!session.escalation) return undefined;
    
    // Find assignment for this specific counselor
    const assignment = session.escalation.counselorAssignments?.find(
      a => a.counselorId === session.counselor.id
    );
    
    return assignment?.level || session.escalation.level;
  };

  return (
    <div className="min-h-screen bg-[#f2f3f4]">
      <div className="max-w-8xl mx-auto px-4 md:px-1 py-6 md:py-1">
        {/* Header */}
        <div className="mb-4 md:mb-4">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#1e293b]">Sessions</h1>
          <p className="text-[14px] md:text-[16px] text-[#64748b] mt-1">View and manage counseling sessions</p>
          
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-[14px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div> */}
          </div>
        </div>

        {/* Tabs and Filters Section */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Pill Tabs */}
          <div className="inline-flex p-1 bg-white rounded-[17px] self-start">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`
                  px-6 py-2.5 text-[14px] font-medium rounded-[17px] transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <AdminLoader message="Loading sessions..." size="md" />
          </div>
        ) : (
          <>
            {/* Sessions List */}
            {sessions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E2E8F0]">
                <div className="text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-[#1E293B] mb-2">No {activeTab} sessions</h3>
                  <p className="text-[#64748B]">
                    {activeTab === 'upcoming' && 'No upcoming sessions scheduled'}
                    {activeTab === 'completed' && 'No completed sessions found'}
                    {activeTab === 'cancelled' && 'No cancelled sessions found'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#F7F9FC] rounded-2xl border border-[#E1E1E1] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#F8FAFC] hidden md:table-header-group">
                      <tr>
                        {activeTab === 'completed' ? (
                          <>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Name
                            </th>
                            {/* <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Session Type
                            </th> */}
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Class
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Level
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Session Start
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Session End
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Duration
                            </th>
                            <th className="px-6 py-4 text-center text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Action
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Student Name
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Session Type
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Level
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Class
                            </th>
                            <th className="px-6 py-4 text-left text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Time Stamp
                            </th>
                            <th className="px-6 py-4 text-center text-[14px] font-medium text-[#3A3A3A] tracking-wider">
                              Actions
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E2E8F0]">
                      {sessions.map((session) => (
                        <tr key={session.id} className="flex flex-col md:table-row hover:bg-gray-50 transition-colors">
                          {activeTab === 'completed' ? (
                            <>
                              {/* Completed sessions columns */}
                              <td className="px-6 py-4 md:whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[15px] font-medium text-[#3B82F6]">
                                    {session.student.firstName?.[0]}{session.student.lastName?.[0]}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-[15px] font-medium text-[#1E293B]">
                                      {session.student.firstName} {session.student.lastName}
                                    </div>
                                    <div className="md:hidden text-[12px] text-[#5E5B5B]">
                                      {session.student.classRef ? `${session.student.classRef.grade}${session.student.classRef.section ? ` - ${session.student.classRef.section}` : ''}` : 'No Class'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {/* <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 text-[14px] font-normal text-[#5E5B5B]">
                                  {formatSessionType(session.sessionType)}
                                </span>
                              </td> */}
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-[14px] text-[#5E5B5B]">
                                {session.student.classRef ? (
                                  `${session.student.classRef.grade}${session.student.classRef.section ? ` - ${session.student.classRef.section}` : ''}`
                                ) : (
                                  'No Class'
                                )}
                              </td>
                              <td className="px-6 py-2 md:py-4 md:whitespace-nowrap">
                                <div className="flex items-center gap-2 md:block">
                                  <span className="md:hidden font-medium text-[#64748B] text-[13px]">Level:</span>
                                  {renderLevelBadge(getAssignmentLevel(session))}
                                </div>
                              </td>
                              <td className="px-6 py-2 md:py-4 md:whitespace-nowrap">
                                <div className="flex items-center text-[14px] text-[#5E5B5B]">
                                  <span className="md:hidden font-medium mr-1 text-[#5E5B5B]">Started:</span>
                                  {formatDate(session.scheduledAt)}
                                </div>
                              </td>
                              <td className="px-6 py-2 md:py-4 md:whitespace-nowrap">
                                <div className="flex items-center text-[14px] text-[#5E5B5B]">
                                  <span className="md:hidden font-medium mr-1 text-[#64748B]">Ended:</span>
                                  {session.endedAt ? formatDate(session.endedAt) : 'In Progress'}
                                </div>
                              </td>
                              <td className="px-6 py-2 md:py-4 md:whitespace-nowrap">
                                <div className="text-[13px] text-[#5E5B5B] flex items-center md:block">
                                  <span className="md:hidden font-medium mr-1 text-[#64748B]">Duration:</span>
                                  {(() => {
                                    const startTime = session.startedAt || session.scheduledAt;
                                    if (!startTime || !session.endedAt) return 'N/A';
                                    
                                    const start = new Date(startTime);
                                    const end = new Date(session.endedAt);
                                    const diff = Math.abs(end.getTime() - start.getTime());
                                    const minutes = Math.floor(diff / (1000 * 60));
                                    const hours = Math.floor(minutes / 60);
                                    const days = Math.floor(hours / 24);
                                    
                                    if (days > 0) return `${days}d ${hours % 24}h`;
                                    if (hours > 0) return `${hours}h ${minutes % 60}m`;
                                    return `${minutes}m`;
                                  })()}
                                </div>
                              </td>
                              <td className="px-6 py-4 md:whitespace-nowrap md:text-right">
                                <div className="flex items-center md:justify-end gap-2 w-full">
                                  <button
                                    className="w-full rounded-[12px] bg-[#F8F8F8] hover:bg-[#F1F3F4] text-[#3A3A3A] px-4 h-[36px] text-[12px] font-medium transition-all md:w-auto flex items-center justify-center"
                                    onClick={() => handleViewDetails(session.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              {/* Other tabs columns */}
                              <td className="px-6 py-4 md:whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[15px] font-medium text-[#3B82F6]">
                                    {session.student.firstName?.[0]}{session.student.lastName?.[0]}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-[15px] font-medium text-[#1E293B]">
                                      {session.student.firstName} {session.student.lastName}
                                    </div>
                                    <div className="md:hidden mt-1 flex flex-wrap gap-2">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800">
                                        {formatSessionType(session.sessionType)}
                                      </span>
                                      <span className="text-[12px] text-[#64748B]">
                                        {session.student.classRef ? `${session.student.classRef.name}` : 'No Class'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 text-[14px] font-normal text-[#5E5B5B]">
                                  {formatSessionType(session.sessionType)}
                                </span>
                              </td>
                              <td className="px-6 py-2 md:py-4 md:whitespace-nowrap">
                                <div className="flex items-center gap-2 md:block">
                                  <span className="md:hidden font-medium text-[#64748B] text-[13px]">Level:</span>
                                  {renderLevelBadge(getAssignmentLevel(session))}
                                </div>
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-[14px] text-[#5E5B5B]">
                                {session.student.classRef ? (
                                  `${session.student.classRef.name}`
                                ) : (
                                  'No Class'
                                )}
                              </td>
                              <td className="px-6 py-2 md:py-4 md:whitespace-nowrap">
                                <div className="flex items-center text-[14px] text-[#5E5B5B]">
                                  <span className="md:hidden font-medium mr-1 text-[#64748B]">Scheduled:</span>
                                  {formatDate(session.scheduledAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4 md:whitespace-nowrap md:text-right">
                                <div className="flex flex-wrap items-center md:justify-end gap-3 w-full">
                                   <button
                                    className="w-full rounded-[12px] bg-[#F8F8F8] hover:bg-[#F1F3F4] text-[#3A3A3A] px-4 h-[36px] text-[12px] font-medium transition-all md:w-auto flex items-center justify-center"
                                    onClick={() => handleViewDetails(session.id)}
                                  >
                                   <Eye className="h-4 w-4 mr-1" />
                                   View Details
                                  </button>
                                  {session.status === 'SCHEDULED' && (
                                     <button
                                       className="w-full md:w-auto rounded-[15px] bg-[#3C83F6] hover:from-[#3195E7] hover:to-[#52A9F0] text-white border-none px-4 h-[38px] text-[14px] font-normal transition-all flex items-center justify-center"
                                       onClick={() => handleStartSession(session.id)}
                                     >
                                       <CalendarClock className="h-4 w-4 mr-1.5" />
                                       Start Session
                                     </button>
                                   )}
                                   {session.status === 'IN_PROGRESS' && (
                                     <button
                                       className="w-full md:w-auto rounded-[14px] hover:bg-[#3C83F6] hover:text-white text-[#3C83F6] border border-[#3C83F6] px-4 h-[38px] text-[14px] font-normal transition-all flex items-center justify-center"
                                       onClick={() => handleStartSession(session.id)}
                                     >
                                       <Play className="h-3.5 w-3.5 mr-1.5" />
                                       Resume
                                     </button>
                                   )}
                                  {activeTab === 'upcoming' && session.status === 'SCHEDULED' && (
                                    <button
                                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 h-9 border border-[#FF6C6C] text-[13px] font-medium rounded-[10px] text-[#E94A4A] hover:bg-red-50 transition-colors"
                                      onClick={() => handleCancelSessionClick(session)}
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Schedule Session Modal */}
        {showScheduleModal && (
          <ScheduleSessionModal
            open={showScheduleModal}
            onOpenChange={(open) => {
              setShowScheduleModal(open);
            }}
            onSessionCreated={(session) => {
              setShowScheduleModal(false);
              fetchSessions(activeTab); // Refresh list
            }}
          />
        )}

        {/* Cancel Session Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cancel Session
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel the session with {cancelingSession?.student?.firstName} {cancelingSession?.student?.lastName}? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelingSession(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  No, Keep Session
                </button>
                <button
                  onClick={handleSessionCanceled}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
