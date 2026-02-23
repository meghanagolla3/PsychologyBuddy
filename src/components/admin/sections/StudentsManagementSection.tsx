"use client";

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAuth } from '@/src/contexts/AuthContext';
import { useSchoolFilter } from '@/src/contexts/SchoolFilterContext';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  UserPlus,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { AddStudentModal } from '../modals/AddStudentModal';
import { EditStudentModal } from '../modals/EditStudentModal';
import { ViewStudentModal } from '../modals/ViewStudentModal';
import { AdminHeader } from '../layout/AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MoreVertical, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  classRef?: {
    id: string;
    name: string;
    grade: number;
    section: string;
  };
  school?: {
    id: string;
    name: string;
  };
  studentProfile?: {
    lastMoodCheckin?: string;
    averageMood?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    profileImage?: string;
  };
  _count?: {
    chatSessions: number;
    moodCheckins: number;
  };
}

export function StudentsManagementSection() {
  const { selectedSchoolId, setSelectedSchoolId, schools, setSchools, isSuperAdmin } = useSchoolFilter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  console.log('StudentsManagementSection - School filter state:', { selectedSchoolId, isSuperAdmin, schoolsCount: schools.length });

  // Add debugging to track when selectedSchoolId changes
  React.useEffect(() => {
    console.log('selectedSchoolId changed to:', selectedSchoolId);
  }, [selectedSchoolId]);

  // Permission checks
  const canCreateStudents = hasPermission('users.create');
  const canViewStudents = hasPermission('users.view');
  const canUpdateStudents = hasPermission('users.update');
  const canDeleteStudents = hasPermission('users.delete');

  const statusStyles = {
    ACTIVE: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', label: 'Active' },
    INACTIVE: { bg: 'bg-[#6B7280]/10', text: 'text-[#64748B]', label: 'Inactive' },
    SUSPENDED: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', label: 'Suspended' }
  };

  useEffect(() => {
    if (canViewStudents) {
      console.log('Main useEffect called - canViewStudents:', canViewStudents);
      
      // For super admins, ensure we start with 'all' schools
      if (isSuperAdmin && selectedSchoolId !== 'all') {
        console.log('Super admin detected but selectedSchoolId is not "all", resetting to "all"');
        setSelectedSchoolId('all');
        return; // Don't fetch yet, wait for the state update
      }
      
      fetchStudents();
      fetchClasses();
      if (isSuperAdmin) {
        fetchSchools();
      }
    }
  }, [canViewStudents, isSuperAdmin]);

  // Auto-set school ID for regular admins ONLY
  useEffect(() => {
    console.log('School ID auto-set check:', { 
      isSuperAdmin, 
      userSchoolId: user?.school?.id, 
      currentSelectedSchoolId: selectedSchoolId,
      userRole: user?.role?.name 
    });
    
    // Only set school ID for regular admins, NOT for super admins
    if (!isSuperAdmin && user?.school?.id && selectedSchoolId === 'all') {
      console.log('Auto-setting schoolId for regular admin:', user.school.id);
      setSelectedSchoolId(user.school.id);
    } else if (isSuperAdmin && selectedSchoolId !== 'all') {
      // If super admin has a specific school selected (not 'all'), keep it as is
      console.log('Super admin has specific school selected:', selectedSchoolId);
    } else if (isSuperAdmin && selectedSchoolId === 'all') {
      // Ensure super admin stays on 'all' 
      console.log('Super admin is on all schools');
    }
  }, [isSuperAdmin, user, selectedSchoolId, setSelectedSchoolId]);

  useEffect(() => {
    if (canViewStudents) {
      console.log('useEffect triggered - fetching students due to filter change');
      fetchStudents();
    }
  }, [searchTerm, statusFilter, classFilter, selectedSchoolId, canViewStudents]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      console.log('fetchStudents called with state:', { 
        selectedSchoolId, 
        isSuperAdmin, 
        userSchoolId: user?.school?.id,
        userRole: user?.role?.name 
      });
      
      const params = new URLSearchParams();
      
      // Always add search and status filters
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (classFilter !== 'all') params.append('classId', classFilter);
      
      console.log('School filter condition check:', { selectedSchoolId, isNotAll: selectedSchoolId !== 'all', shouldAdd: selectedSchoolId && selectedSchoolId !== 'all' });
      
      if (selectedSchoolId && selectedSchoolId !== 'all') {
        params.append('schoolId', selectedSchoolId);
        console.log('Added schoolId to params:', selectedSchoolId);
      } else {
        console.log('NOT adding schoolId to params - selectedSchoolId is:', selectedSchoolId);
      }

      console.log('Fetching students with params:', params.toString());
      console.log('Selected school ID:', selectedSchoolId);

      const response = await fetch(`/api/students?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('Students API response:', data);
      
      if (data.success) {
        console.log('Students fetched:', data.data.length);
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        let schoolsData = data.data;
        
        // Map API response to expected interface
        schoolsData = schoolsData.map((school: any) => ({
          ...school,
          location: school.address || 'Unknown Location',
          studentCount: school._count?.users || 0,
          alertCount: 0,
          checkInsToday: 0,
        }));
        
        setSchools(schoolsData); // Set global schools for filter
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowAddModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to deactivate this student?')) return;

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-[#10B981] bg-[#10B981]/10';
      case 'INACTIVE': return 'text-[#6B7280] bg-[#6B7280]/10';
      case 'SUSPENDED': return 'text-[#EF4444] bg-[#EF4444]/10';
      default: return 'text-[#6B7280] bg-[#6B7280]/10';
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'text-[#EF4444]';
      case 'MEDIUM': return 'text-[#F59E0B]';
      case 'LOW': return 'text-[#10B981]';
      default: return 'text-[#6B7280]';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (!canViewStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#111827] mb-2">Access Denied</h3>
          <p className="text-[#6B7280]">You don't have permission to view students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <AdminHeader 
        title="Student Management" 
        subtitle="View and manage student profiles"
        showSchoolFilter={isSuperAdmin}
        schoolFilterValue={selectedSchoolId}
        onSchoolFilterChange={setSelectedSchoolId}
        schools={schools}
        showTimeFilter={false}
        actions={canCreateStudents && (
          <Button
            onClick={handleAddStudent}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        )}
      />
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Manage students and their information</p>
        </div>
        {canCreateStudents && (
          <button
            onClick={handleAddStudent}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        )}
      </div> */}

      {/* Filters and Search */}
      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input 
              placeholder="Search students..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl ml-6 mr-6 border border-[#D1D5DB] bg-[#FFFFFF] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#E2E8F0]/50">
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Check-in</TableHead>
              <TableHead className="text-center">Avg Mood</TableHead>
              <TableHead className="text-center">Sessions</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-[#64748B] py-12">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-[#E2E8F0]/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage 
                          src={student.studentProfile?.profileImage || ''} 
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback className="bg-[#3B82F6]/10 text-[#3B82F6] text-sm">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#1E293B]">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-[#64748B]">{student.email}</p>
                        <p className="text-xs text-[#64748B]">{student.studentId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#64748B]">{student.classRef?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={cn("text-xs", statusStyles[student.status].bg, statusStyles[student.status].text)}
                    >
                      {statusStyles[student.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {student.studentProfile?.lastMoodCheckin ? (
                      new Date(student.studentProfile.lastMoodCheckin).toLocaleDateString()
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "font-medium",
                      (student.studentProfile?.averageMood ?? 0) >= 3.5 ? "text-[#10B981]" : 
                      (student.studentProfile?.averageMood ?? 0) >= 2.5 ? "text-[#F59E0B]" : "text-[#EF4444]"
                    )}>
                      {student.studentProfile?.averageMood?.toFixed(1) || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-[#64748B]">{student._count?.chatSessions || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleViewStudent(student)}>
                          <Eye className="h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        {canUpdateStudents && (
                          <DropdownMenuItem className="gap-2" onClick={() => handleEditStudent(student)}>
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {canDeleteStudents && (
                          <DropdownMenuItem className="gap-2 text-[#EF4444] focus:text-[#EF4444]">
                            <Archive className="h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStudents();
          }}
          schools={schools}
          classes={classes}
        />
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchStudents();
          }}
          schools={schools}
          classes={classes}
        />
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <ViewStudentModal
          student={selectedStudent}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
}
