'use client';

import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { X, ChevronDown, Calendar, Clock, User, FileText, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ScheduleSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStudent?: any; // Changed to accept full student object
  onSessionCreated?: (session: any) => void;
}

export function ScheduleSessionModal({ open, onOpenChange, defaultStudent, onSessionCreated }: ScheduleSessionModalProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    date: '' as string | Date,
    time: '',
    sessionType: 'INTAKE' as 'INTAKE' | 'FOLLOW_UP',
    escalationId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdowns, setDropdowns] = useState({
    student: false,
    sessionType: false,
  });
  const [alertedStudents, setAlertedStudents] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const sessionTypes = [
    { value: 'INTAKE', label: 'Intake' },
    { value: 'FOLLOW_UP', label: 'Follow Up' },
  ];

  // Fetch students with active alerts
  const fetchAlertedStudents = async () => {
    try {
      const response = await fetch('/api/counselor/alerts?status=ACTIVE');
      const result = await response.json();
      
      if (result.success) {
        // Extract unique students from alerts
        const students = result.data.reduce((acc: any[], alert: any) => {
          const existingStudent = acc.find(s => s.id === alert.studentId);
          if (!existingStudent) {
            acc.push({
              id: alert.studentId,
              firstName: alert.student?.firstName || '',
              lastName: alert.student?.lastName || '',
              email: alert.student?.email || '',
              studentId: alert.student?.studentId || '',
              classRef: alert.student?.classRef || null,
              alerts: [alert]
            });
          } else {
            existingStudent.alerts.push(alert);
          }
          return acc;
        }, []);
        setAlertedStudents(students);
      }
    } catch (err) {
      console.error('Fetch alerted students error:', err);
    }
  };

  // Check if student has previous sessions to determine session type
  const checkStudentSessionHistory = async (studentId: string) => {
    try {
      const response = await fetch(`/api/counselor/sessions/check-history?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('Student session history:', result.data);
        return result.data.sessionType; // 'INTAKE' or 'FOLLOW_UP'
      }
    } catch (err) {
      console.error('Error checking student session history:', err);
    }
    return 'INTAKE'; // Default to INTAKE if check fails
  };

  useEffect(() => {
    if (open) {
      fetchAlertedStudents();
      
      // Auto-fill student data if defaultStudent is provided
      if (defaultStudent) {
        console.log('Auto-filling student data:', defaultStudent);
        
        // Handle StudentRow structure (from Alerts page)
        const studentId = defaultStudent.id || '';
        const studentName = defaultStudent.name || 
          (defaultStudent.firstName && defaultStudent.lastName ? 
            `${defaultStudent.firstName} ${defaultStudent.lastName}`.trim() : 
            '');
        
        console.log('Extracted student data:', { studentId, studentName });
        
        // Determine session type based on student's session history
        const determineSessionType = async () => {
          const sessionType = await checkStudentSessionHistory(studentId);
          console.log('Determined session type:', sessionType);
          
          // Use escalationAlertId from the row, or fall back to the first alert's escalationAlertId if available
          // IMPORTANT: alert.id is the assignment ID, but alert.escalationAlertId is the actual alert ID
          const escalationAlertId = defaultStudent.escalationAlertId || 
                                   (defaultStudent.alerts && defaultStudent.alerts.length > 0 
                                      ? (defaultStudent.alerts[0].escalationAlertId || defaultStudent.alerts[0].id) 
                                      : '');
          
          const updatedFormData = {
            ...formData,
            studentId: studentId,
            studentName: studentName,
            sessionType: (sessionType || 'INTAKE') as 'INTAKE' | 'FOLLOW_UP',
            escalationId: escalationAlertId,
          };
          
          console.log('Setting form data:', updatedFormData);
          
          setFormData(updatedFormData);
          setSelectedAlert(defaultStudent.alerts?.[0] || null);
        };
        
        determineSessionType();
      }
    }
  }, [open, defaultStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Check what fields are missing
    console.log('Form data validation:', {
      studentId: formData.studentId,
      date: formData.date,
      time: formData.time,
    });

    if (!formData.studentId || !formData.date || !formData.time || !formData.sessionType) {
      const missingFields = [];
      if (!formData.studentId) missingFields.push('Student ID');
      if (!formData.date) missingFields.push('Date');
      if (!formData.time) missingFields.push('Time');
      if (!formData.sessionType) missingFields.push('Session Type');
      
      setError(`Please fill in all required fields. Missing: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sessionData = {
        studentId: formData.studentId,
        date: formData.date,
        time: formData.time,
        sessionType: formData.sessionType,
        escalationId: formData.escalationId || undefined,
        // schoolId will be added by the API route from the user object
      };

      console.log('Creating session with data:', sessionData);

      const response = await fetch('/api/counselor/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      console.log('Session creation response status:', response.status);
      
      const result = await response.json();
      console.log('Session creation response:', result);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (result.success) {
        console.log('Session created successfully:', result.data);
        onSessionCreated?.(result.data);
        onOpenChange(false);
        // Reset form
        setFormData({
          studentId: '',
          studentName: '',
          date: '',
          time: '',
          sessionType: 'INTAKE' as 'INTAKE' | 'FOLLOW_UP',
          escalationId: '',
        });
        setSelectedAlert(null);
      } else {
        console.error('Session creation failed:', result);
        console.error('Error details:', {
          message: result.message,
          error: result.error,
          stack: result.stack
        });
        setError(result.message || result.error || 'Failed to create session');
      }
    } catch (err) {
      console.error('Create session error:', err);
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[480px] max-h-[90vh] gap-0 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Schedule Session</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-5">

          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
            <div className="relative">
              <Input
                type="text"
                value={formData.studentName}
                readOnly
                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900"
                placeholder="Student name will be auto-filled"
              />
            </div>
            {selectedAlert && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-xs font-medium text-orange-800 mb-1">Alert Details:</div>
                <div className="text-xs text-orange-700">
                  <span className="font-medium">Category:</span> {selectedAlert.category} | 
                  <span className="font-medium"> Severity:</span> {selectedAlert.severity}
                </div>
                {selectedAlert.description && (
                  <div className="text-xs text-orange-600 mt-1 truncate">{selectedAlert.description}</div>
                )}
              </div>
            )}
          </div>

          {/* Row 2: Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-left font-normal flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    {formData.date ? (
                      format(new Date(formData.date), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto z-[100] p-0 bg-white border rounded-xl shadow-lg" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('date', format(date, "yyyy-MM-dd"));
                        setCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-left font-normal flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      !formData.time && "text-muted-foreground"
                    )}
                  >
                    {formData.time ? (
                      (() => {
                        const [h, m] = formData.time.split(':');
                        const hour = parseInt(h);
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        return `${displayHour}:${m} ${ampm}`;
                      })()
                    ) : (
                      <span>Select time</span>
                    )}
                    <Clock className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 z-[100] bg-white border rounded-xl shadow-lg" align="start">
                  <div className="flex h-64">
                    {/* Hours */}
                    <div className="flex-1 overflow-y-auto py-2 border-r border-gray-100 scrollbar-hide">
                      <div className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hour</div>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                        const currentHour24 = parseInt(formData.time.split(':')[0] || '0');
                        const currentHour12 = currentHour24 === 0 ? 12 : currentHour24 > 12 ? currentHour24 - 12 : currentHour24;
                        return (
                          <button
                            key={h}
                            onClick={() => {
                              const [_, m] = (formData.time || "09:00").split(':');
                              const ampm = currentHour24 >= 12 ? 'PM' : 'AM';
                              let newHour24 = h;
                              if (ampm === 'PM' && h < 12) newHour24 += 12;
                              if (ampm === 'AM' && h === 12) newHour24 = 0;
                              handleInputChange('time', `${newHour24.toString().padStart(2, '0')}:${m}`);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-center transition-colors hover:bg-gray-50",
                              currentHour12 === h ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                            )}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                    {/* Minutes */}
                    <div className="flex-1 overflow-y-auto py-2 border-r border-gray-100 scrollbar-hide">
                      <div className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Min</div>
                      {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            const [h, _] = (formData.time || "09:00").split(':');
                            handleInputChange('time', `${h}:${m}`);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-center transition-colors hover:bg-gray-50",
                            formData.time.split(':')[1] === m ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    {/* AM/PM */}
                    <div className="flex-1 py-2">
                      <div className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Period</div>
                      {['AM', 'PM'].map((p) => {
                        const currentHour24 = parseInt(formData.time.split(':')[0] || '0');
                        const ampm = currentHour24 >= 12 ? 'PM' : 'AM';
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              const [h24, m] = (formData.time || "09:00").split(':');
                              let hour12 = parseInt(h24) % 12;
                              if (hour12 === 0) hour12 = 12;
                              let newHour24 = hour12;
                              if (p === 'PM' && hour12 < 12) newHour24 += 12;
                              if (p === 'AM' && hour12 === 12) newHour24 = 0;
                              handleInputChange('time', `${newHour24.toString().padStart(2, '0')}:${m}`);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-center transition-colors hover:bg-gray-50",
                              ampm === p ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                            )}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                      onClick={() => setTimeOpen(false)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                    >
                      Done
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <div className="relative">
              <button
                onClick={() => setDropdowns(prev => ({ ...prev, sessionType: !prev.sessionType }))}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <span className="text-gray-500">{formData.sessionType ? sessionTypes.find(t => t.value === formData.sessionType)?.label : 'Select session type'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {dropdowns.sessionType && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {sessionTypes.filter(type => type.value === 'INTAKE' || type.value === 'FOLLOW_UP').map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          handleInputChange('sessionType', type.value);
                          setDropdowns(prev => ({ ...prev, sessionType: false }));
                        }}
                        className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {formData.sessionType === 'FOLLOW_UP' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-700">
                  Follow-up session based on previous completed sessions
                </div>
              </div>
            )}
            {formData.sessionType === 'INTAKE' && formData.studentId && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs text-green-700">
                  Intake session - no previous completed sessions found
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-10 flex-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-10 flex-1 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white"></div>
                  <span className="ml-2">Creating...</span>
                </div>
              ) : (
                'Create Session'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
