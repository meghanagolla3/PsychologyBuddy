'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, Calendar as CalendarIcon, Clock, User, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";

interface ParentMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMeetingCreated?: (meeting: any) => void;
}

interface Student {
  id: string;
  name: string;
  classGrade: string;
  level: string;
  parentName: string;
  email?: string;
}

export function ParentMeetingModal({ open, onOpenChange, onMeetingCreated }: ParentMeetingModalProps) {
  const [timeOpen, setTimeOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    classGrade: '',
    level: '',
    parentName: '',
    date: '',
    time: '',
    purpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdowns, setDropdowns] = useState({
    student: false,
    time: false,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch assigned students when modal opens
  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/counselor/alerts?status=ACTIVE');
      const result = await response.json();
      
      if (result.success) {
        // Transform alert data to student format and ensure uniqueness
        const uniqueStudents = new Map();
        result.data.forEach((alert: any) => {
          if (!uniqueStudents.has(alert.id)) {
            uniqueStudents.set(alert.id, {
              id: alert.id,
              name: alert.name,
              classGrade: alert.classGrade || 'N/A',
              level: alert.alertLevel || 'medium',
              parentName: alert.parentName || 'Parent of ' + alert.name, // Use actual parent name if available
              email: alert.email,
            });
          }
        });
        
        setStudents(Array.from(uniqueStudents.values()));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setFormData({
      ...formData,
      studentId: student.id,
      studentName: student.name,
      classGrade: student.classGrade,
      level: student.level,
      parentName: student.parentName,
    });
    setDropdowns({ student: false, time: false });
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.date || !formData.time || !formData.purpose) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const meetingData = {
        studentId: formData.studentId,
        studentName: formData.studentName,
        classGrade: formData.classGrade,
        level: formData.level,
        parentName: formData.parentName,
        date: formData.date,
        time: formData.time,
        purpose: formData.purpose,
      };

      const response = await fetch('/api/counselor/parent-meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      const result = await response.json();

      if (result.success) {
        onMeetingCreated?.(result.data);
        onOpenChange(false);
        // Reset form
        setFormData({
          studentId: '',
          studentName: '',
          classGrade: '',
          level: '',
          parentName: '',
          date: '',
          time: '',
          purpose: '',
        });
      } else {
        setError(result.message || 'Failed to create parent meeting');
      }
    } catch (err) {
      console.error('Create parent meeting error:', err);
      setError('Failed to create parent meeting');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-md gap-0 rounded-2xl p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex items-left justify-left">
          <DialogTitle className="text-[17px] font-medium text-[#3A3A3A] mb-6">Schedule a parent meeting</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-[14px] font-medium text-[#767676] mb-1">Student Name</label>
            <div className="relative">
              <Input
                type="text"
                value={formData.studentName || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setDropdowns({ student: true, time: false });
                }}
                placeholder="Search and select student"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-[14px]"
                readOnly={!!formData.studentName}
              />
              {!formData.studentName && (
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              
              {/* Dropdown */}
              {dropdowns.student && !formData.studentName && filteredStudents.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleStudentSelect(student)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {student.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Class and Level in same row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[14px] font-medium text-[#767676] mb-1">Class</label>
              <Input
                type="text"
                value={formData.classGrade}
                readOnly
                className="w-full h-10 rounded-lg border border-[#E6E6E6] bg-[#F8F8F8] px-3 text-[14px]"
                placeholder="Class"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#767676] mb-1">Level</label>
              <Input
                type="text"
                value={formData.level}
                readOnly
                className="w-full h-10 rounded-lg border border-[#E6E6E6] bg-[#F8F8F8] px-3 text-[14px]"
                placeholder="Level"
              />
            </div>
          </div>

          {/* Parent Name */}
          <div>
            <label className="block text-[14px] font-medium text-[#767676] mb-1">Parent Name</label>
            <Input
              type="text"
              value={formData.parentName}
              readOnly
              className="w-full h-10 rounded-lg border border-[#E6E6E6] bg-[#F8F8F8] px-3 text-[14px]"
              placeholder="Parent name will be auto-filled"
            />
          </div>

          {/* Date and Time in same row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[14px] font-medium text-[#767676] mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal border-[#E6E6E6] bg-white rounded-lg",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#4293FE]" />
                    {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
                      }
                    }}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#767676] mb-1">Time</label>
              <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal border-[#E6E6E6] bg-white rounded-lg",
                      !formData.time && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4 text-[#4293FE]" />
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
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 z-[100] bg-white border rounded-xl shadow-lg" align="start">
                  <div className="flex h-64">
                    {/* Hours */}
                    <div className="flex-1 overflow-y-auto py-2 border-r border-gray-100 no-scrollbar">
                      <div className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hour</div>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                        const currentHour24 = parseInt((formData.time || "09:00").split(':')[0]);
                        const currentHour12 = currentHour24 === 0 ? 12 : currentHour24 > 12 ? currentHour24 - 12 : currentHour24;
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              const [_, m] = (formData.time || "09:00").split(':');
                              const ampm = currentHour24 >= 12 ? 'PM' : 'AM';
                              let newHour24 = h;
                              if (ampm === 'PM' && h < 12) newHour24 += 12;
                              if (ampm === 'AM' && h === 12) newHour24 = 0;
                              setFormData({ ...formData, time: `${newHour24.toString().padStart(2, '0')}:${m}` });
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
                    <div className="flex-1 overflow-y-auto py-2 border-r border-gray-100 no-scrollbar">
                      <div className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Min</div>
                      {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            const [h, _] = (formData.time || "09:00").split(':');
                            setFormData({ ...formData, time: `${h}:${m}` });
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-center transition-colors hover:bg-gray-50",
                            (formData.time || "09:00").split(':')[1] === m ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
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
                        const currentHour24 = parseInt((formData.time || "09:00").split(':')[0]);
                        const ampm = currentHour24 >= 12 ? 'PM' : 'AM';
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              const [h24, m] = (formData.time || "09:00").split(':');
                              let hour12 = parseInt(h24) % 12;
                              if (hour12 === 0) hour12 = 12;
                              let newHour24 = hour12;
                              if (p === 'PM' && hour12 < 12) newHour24 += 12;
                              if (p === 'AM' && hour12 === 12) newHour24 = 0;
                              setFormData({ ...formData, time: `${newHour24.toString().padStart(2, '0')}:${m}` });
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
                      type="button"
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

          {/* Purpose */}
          <div>
            <label className="block text-[14px] font-medium text-[#767676] mb-1">Purpose of meeting</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Describe the purpose of this parent meeting..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white"></div>
                  <span className="ml-2">Creating...</span>
                </div>
              ) : (
                'Schedule Meeting'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
