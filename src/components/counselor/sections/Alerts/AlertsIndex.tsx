'use client';

import { useState, useEffect } from "react";
import { ChevronDown, Eye, CalendarPlus, CalendarClock, CheckCircle, CalendarCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ScheduleSessionModal } from "./ScheduleSessionModal";

import Link from "next/link";

interface StudentRow {
  id: string;
  name: string;
  initials: string;
  classGrade: string;
  email: string;
  studentId?: string;
  school?: {
    name: string;
  };
  location?: {
    name: string;
  };
  status: string;
  createdAt?: string;
  alertTime?: string;
  alertStatus?: string;
  alertLevel?: string;
  alertId?: string;
  escalationAlertId?: string;
  sessionStatus?: string;
  sessionType?: string;
  sessionId?: string;
  sessionScheduledAt?: string;
}

export function AlertsIndex() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | undefined>();
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1
  });

  const [dropdowns, setDropdowns] = useState({
    filter: false
  });
  const [filter, setFilter] = useState('all'); // all, schedule, scheduled, completed

  // Fetch real data from API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Frontend: Fetching counselor alerts from API...');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      const response = await fetch(`/api/counselor/alerts?${params}`);
      console.log('Frontend: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Frontend: Response not OK:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Frontend: API response:', result);
      console.log('Frontend: Sample alert data:', result.data[0]);

      if (result.success) {
        console.log('Frontend: Setting alerts data:', result.data.length, 'items');

        // Transform alert data to match StudentRow interface (show all alerts, no deduplication)
        const transformedAlerts = result.data.map((alert: any) => {

          return {
            id: alert.id,
            name: alert.name,
            initials: alert.initials,
            classGrade: alert.classGrade || 'No class',
            email: alert.studentEmail || 'No email',
            studentId: alert.studentId,
            school: { name: alert.studentSchoolName },
            location: alert.studentLocation,
            status: alert.alertStatus,
            createdAt: alert.alertTime || alert.timestamp || alert.createdAt || alert.metadata?.timestamp || alert.metadata?.createdAt,
            alertTime: alert.alertTime || alert.timestamp || alert.createdAt || alert.metadata?.timestamp || alert.metadata?.createdAt,
            alertStatus: alert.alertStatus,
            alertLevel: alert.metadata?.level || 'medium',
            alertId: alert.escalationId,
            escalationAlertId: alert.escalationAlertId,
            sessionStatus: alert.sessionStatus || 'SCHEDULED', // From alerts API
            sessionType: alert.sessionType || 'INTAKE',
            sessionId: alert.sessionId,
            sessionScheduledAt: alert.sessionScheduledAt || alert.alertTime || alert.timestamp
          };
        });

        setStudentRows(transformedAlerts);
        setPagination({
          total: result.total || transformedAlerts.length,
          totalPages: Math.ceil((result.total || transformedAlerts.length) / 10),
          page: page
        });
      } else {
        console.error('Frontend: API returned error:', result);
        throw new Error(result.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Frontend: Error fetching alerts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      // Fallback to empty array
      setStudentRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page]);

  // Refresh alerts every 30 seconds to get updated session status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [page]);

  const openSchedule = (student?: StudentRow) => {
    if (student?.sessionId && 
        student.sessionStatus !== 'CANCELLED' && 
        student.sessionStatus !== 'MISSED' && 
        student.sessionStatus !== 'PENDING') {
      alert('This student already has an active session scheduled. You can view the details using the View button.');
      return;
    }
    
    setSelectedStudent(student);
    setScheduleOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Filter students based on status
  const filteredRows = studentRows.filter(row => {
    if (filter === 'all') return true;
    if (filter === 'schedule') return !row.sessionId && row.sessionStatus !== 'COMPLETED';
    if (filter === 'scheduled') return !!row.sessionId && row.sessionStatus !== 'COMPLETED';
    if (filter === 'completed') return row.sessionStatus === 'COMPLETED';
    return true;
  });

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tight md:text-[26px]" style={{ color: '#1E293B' }}>Alerts</h1>
          <p className="mt-1 text-[14px] md:text-[16px]" style={{ color: '#767676' }}>
            Monitor and manage student cases by risk level
          </p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setDropdowns(prev => ({ ...prev, filter: !prev.filter }))}
            className="inline-flex h-10 items-center justify-between rounded-[8px] gap-3 px-4 text-[13px] font-medium bg-white text-[#3A3A3A]" 
            style={{ color: '#3A3A3A' }}
          >
            <span>{
              filter === 'all' ? 'All Alerts' : 
              filter === 'schedule' ? 'To Schedule' : 
              filter === 'scheduled' ? 'Scheduled' : 'Completed'
            }</span>
            <ChevronDown className="h-4 w-4 ml-5" style={{ color: '#3A3A3A' }} />
          </button>
          
          {dropdowns.filter && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[#E2E8F0] bg-white shadow-lg z-50 py-1">
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'schedule', label: 'To Schedule' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'completed', label: 'Completed' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setFilter(option.id);
                    setDropdowns(prev => ({ ...prev, filter: false }));
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                    filter === option.id ? 'font-semibold text-black bg-blue-50/50' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden border border-[#E1E1E1] rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
        {/* Header - hidden on mobile */}
        <div className="hidden md:grid grid-cols-[1.6fr_1fr_1fr_1.4fr] items-center gap-4 border-b px-6 py-3" style={{ borderColor: '#E1E1E1', backgroundColor: '#eeeeeec9' }}>
          <div className="text-[15px] font-medium" style={{ color: '#1E293B' }}>Student Name</div>
          <div className="text-[15px] font-medium" style={{ color: '#1E293B' }}>Class</div>
          <div className="text-[15px] font-medium" style={{ color: '#1E293B' }}>Alert Time</div>
          <div className="text-center text-[15px] font-medium" style={{ color: '#1E293B' }}>Actions</div>
        </div>

        <ul>
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <li
                key={`loading-${index}`}
                className="grid grid-cols-[1.6fr_1fr_1fr_1.4fr] items-center gap-4 border-b px-6 py-5 animate-pulse"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
                <div className="flex items-center justify-end gap-3">
                  <div className="h-9 w-24 rounded-lg bg-gray-200"></div>
                  <div className="h-9 w-32 rounded-lg bg-gray-200"></div>
                </div>
              </li>
            ))
          ) : error ? (
            // Error state
            <li className="px-6 py-12 text-center">
              <div className="text-red-500 text-sm font-medium mb-2">Error loading alerts</div>
              <div className="text-gray-500 text-xs">{error}</div>
            </li>
          ) : filteredRows.length === 0 ? (
            // Empty state
            <li className="px-6 py-12 text-center">
              <div className="text-gray-500 text-sm font-medium">No alerts found</div>
              <div className="text-gray-400 text-xs mt-1">
                No alerts match your current filter
              </div>
            </li>
          ) : (
            // Data state
            filteredRows.map((row) => (
              <li
                key={`${row.id}-${row.alertId}`}
                className="flex flex-col gap-4 border-b px-6 py-5 transition-colors last:border-0 hover:bg-gray-50 md:grid md:grid-cols-[1.6fr_1fr_1fr_1.4fr] md:items-center md:gap-4"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10 text-[14px] font-medium text-[#3B82F6]">
                    {row.initials}
                  </div>
                  <div>
                    <span className="text-[16px] font-semibold block" style={{ color: '#3A3A3A' }}>{row.name}</span>
                    <span className="text-[12px] text-gray-500 md:hidden">{row.classGrade}</span>
                  </div>
                </div>

                <div className="hidden md:block text-[14px]" style={{ color: '#5E5B5B' }}>
                  {row.classGrade}
                </div>

                <div className="text-[14px] flex items-center gap-2 md:block" style={{ color: '#5E5B5B' }}>
                  <span className="md:hidden font-medium text-gray-400 text-[12px] uppercase">Alerted:</span>
                  <span className="truncate">
                    {row.alertTime ? (
                      (() => {
                        try {
                          return new Date(row.alertTime).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch (e) {
                          return row.alertTime;
                        }
                      })()
                    ) : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-center">
                  <Link href={`/counselor/students/${row.id}`} className="w-full md:w-auto">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full rounded-[12px] bg-[#F8F8F8] hover:bg-[#F1F3F4] text-[#3A3A3A] px-4 h-[36px] text-[12px] font-medium transition-all md:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {row.sessionStatus === 'COMPLETED' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full md:w-auto rounded-[14px] bg-gradient-to-b from-[#52A9F0] to-[#3195E7] hover:from-[#3195E7] hover:to-[#52A9F0] text-white border-none shadow-sm px-4 h-[38px] text-[14px] font-medium transition-all"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </Button>
                  ) : (row.sessionId && (row.sessionStatus === 'SCHEDULED' || row.sessionStatus === 'IN_PROGRESS')) ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full md:w-auto rounded-[13px] bg-gradient-to-b from-[#19D671] to-[#12A947] hover:from-[#12A947] hover:to-[#19D671] text-white border-none shadow-sm px-4 h-[38px] text-[14px] font-medium transition-all"
                      disabled
                    >
                      <CalendarCheck className="h-[14px] w-[18px] mr-1" />
                      Scheduled
                    </Button>
                  ) : row.sessionStatus === 'CANCELLED' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full md:w-auto rounded-[13px] bg-gradient-to-b from-[#FF6C6C] to-[#E94A4A] text-white border-none px-4 h-9 text-[13px] font-medium opacity-70"
                      disabled
                    >
                      <XCircle className="h-[14px] w-[18px] mr-1" />
                      Cancelled
                    </Button>
                  ) : row.sessionStatus === 'MISSED' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-[13px] bg-gradient-to-b from-[#F97316] to-[#EA580C] text-white border-none px-4 h-9 text-[13px] font-medium opacity-70 w-full md:w-auto"
                      disabled
                    >
                      Missed
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full md:w-auto rounded-[14px] bg-gradient-to-b from-[#52A9F0] to-[#3195E7] hover:from-[#3195E7] hover:to-[#52A9F0] text-white border-none shadow-sm px-4 h-[38px] text-[14px] font-medium transition-all"
                      onClick={() => openSchedule(row)}
                    >
                      <CalendarClock className="h-[14px] w-[18px] mr-1" />
                      Schedule Session
                    </Button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

      </div>
        {pagination && (
          <div className="flex items-center justify-between mt-4 px-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <Button
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}

      <ScheduleSessionModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        defaultStudent={selectedStudent}
        onSessionCreated={() => {
          console.log('Session created successfully, refreshing alerts...');
          setScheduleOpen(false);
          
          // Refresh alerts to get updated data with a small delay to ensure backend is updated
          setTimeout(() => {
            fetchAlerts();
          }, 1000); // 1 second delay
        }}
      />
    </>
  );
}

export default AlertsIndex;
