"use client";

import React, { useState, useEffect } from 'react';
import { Search, Users, AlertTriangle, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  school?: {
    name: string;
  };
  escalationAlerts?: Array<{
    id: string;
    category: string;
    priority: string;
    createdAt: string;
  }>;
  _count?: {
    escalationAlerts: number;
  };
}

interface Counselor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  schoolId?: string;
  school?: {
    id: string;
    name: string;
  };
  counselorProfile?: {
    department?: string;
    specialization?: string;
    maxStudents?: number;
    currentStudents?: number;
  };
}

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  counselor: Counselor;
  onSuccess: () => void;
}

export function AssignStudentsModal({ isOpen, onClose, counselor, onSuccess }: AssignStudentsModalProps) {
  const [studentsWithAlerts, setStudentsWithAlerts] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  // Fetch students with active escalation alerts
  useEffect(() => {
    if (isOpen) {
      fetchStudentsWithAlerts();
    }
  }, [isOpen]);

  const fetchStudentsWithAlerts = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching students with alerts for counselor school...');
      
      // Get counselor's school ID from the counselor object
      const counselorSchoolId = counselor.schoolId || counselor.school?.id;
      console.log('🔍 Counselor object:', JSON.stringify(counselor, null, 2));
      console.log('🔍 Counselor school ID:', counselorSchoolId);
      console.log('🔍 Counselor school object:', counselor.school);
      
      if (!counselorSchoolId) {
        console.error('❌ Counselor is not assigned to a school');
        setStudentsWithAlerts([]);
        return;
      }
      
      // Use the general students endpoint with school filter
      const params = new URLSearchParams({
        schoolId: counselorSchoolId,
        status: 'ACTIVE', // Only get active students
        limit: '100' // Get more students to choose from
      });
      
      const response = await fetch(`/api/students?${params}`, {
        credentials: 'include',
      });
      
      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Students data received:', data);
        console.log('🔍 First student data:', data.data?.students?.[0]);
        console.log('🔍 Data structure:', JSON.stringify(data, null, 2));
        
        // Filter to only show students with active escalation alerts
        const allStudents: Student[] = data.data?.students || [];
        console.log('🔍 All students count:', allStudents.length);
        
        // Debug each student's alert count
        allStudents.forEach((student, index: number) => {
          console.log(`🔍 Student ${index + 1}:`, {
            name: `${student.firstName} ${student.lastName}`,
            _count: student._count,
            escalationAlertsCount: student._count?.escalationAlerts,
            hasAlerts: (student._count?.escalationAlerts ?? 0) > 0
          });
        });
        
        const studentsWithActiveAlerts = allStudents.filter((student) => 
          (student._count?.escalationAlerts ?? 0) > 0
        );
        
        console.log('🔍 Total students:', allStudents.length);
        console.log('🔍 Students with alerts:', studentsWithActiveAlerts.length);
        console.log('🔍 Students with alerts details:', studentsWithActiveAlerts.map(s => ({
          name: `${s.firstName} ${s.lastName}`,
          alertCount: s._count?.escalationAlerts
        })));
        
        setStudentsWithAlerts(studentsWithActiveAlerts);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        
        // Show user-friendly error
        if (response.status === 401) {
          console.error('❌ Authentication required. Please log in as an admin user.');
        } else if (response.status === 403) {
          console.error('❌ Permission denied. You need escalations.view permission.');
        } else {
          console.error('❌ Server error:', errorData.message || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('❌ Network error fetching students with alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = studentsWithAlerts.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug logging
  console.log('🔍 Debug info:', {
    totalStudents: studentsWithAlerts.length,
    filteredStudents: filteredStudents.length,
    searchTerm,
    loading
  });

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleAssign = async () => {
    if (selectedStudents.size === 0) return;

    const studentIds = Array.from(selectedStudents);
    setAssigning(true);
    try {
      const response = await fetch(`/api/counselors/${counselor.id}/assign-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          studentIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assignedCount = studentIds.length;
        
        toast({
          title: "Students assigned successfully",
          description: `${assignedCount} student${assignedCount === 1 ? '' : 's'} assigned to ${counselor.firstName} ${counselor.lastName}`,
        });
        
        // Remove only the assigned students from local state
        setStudentsWithAlerts(prev => 
          prev.filter(student => !studentIds.includes(student.id))
        );
        
        // Clear selection of assigned students
        setSelectedStudents(prev => {
          const newSet = new Set(prev);
          studentIds.forEach(id => newSet.delete(id));
          return newSet;
        });
        
        onSuccess();
        onClose();
      } else {
        console.error('Assignment failed:', response.status);
        toast({
          title: "Assignment failed",
          description: "Failed to assign students to counselor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error assigning students:', error);
    } finally {
      setAssigning(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Capacity tracking removed - fields don't exist in schema
  // const counselorCapacity = counselor.counselorProfile?.maxStudents || 10;
  // const currentLoad = counselor.counselorProfile?.currentStudents || 0;
  // const availableSlots = counselorCapacity - currentLoad;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Students to {counselor.firstName} {counselor.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[600px]">
          {/* Counselor Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{counselor.firstName} {counselor.lastName}</p>
                <p className="text-sm text-gray-600">{counselor.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">
                    {counselor.counselorProfile?.department || 'No department'}
                  </Badge>
                  <Badge variant="outline">
                    {counselor.counselorProfile?.specialization || 'No specialization'}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    🏫 {counselor.school?.name || 'Not assigned to school'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-lg font-medium">
                  {counselor.counselorProfile?.department || 'Not specified'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Only showing students from {counselor.school?.name || 'assigned school'}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Students List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">
                  {searchTerm ? 'No students found' : 'No students with active alerts'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedStudents.has(student.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs">
                              {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          {selectedStudents.has(student.id) && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                          {student.studentId && (
                            <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.school && (
                          <Badge variant="outline" className="text-xs">
                            {student.school.name}
                          </Badge>
                        )}
                        {student.escalationAlerts && student.escalationAlerts.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-500">
                              {student.escalationAlerts.length} alert{student.escalationAlerts.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {student.escalationAlerts && student.escalationAlerts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {student.escalationAlerts.slice(0, 3).map((alert) => (
                          <div
                            key={alert.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                            style={{ backgroundColor: getPriorityColor(alert.priority) + '20' }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(alert.priority)}`} />
                            {alert.category}
                          </div>
                        ))}
                        {student.escalationAlerts.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{student.escalationAlerts.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedStudents.size > 0 && (
                <span>{selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedStudents.size === 0 || assigning}
                className="gap-2"
              >
                {assigning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Assign {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
