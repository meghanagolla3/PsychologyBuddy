"use client";

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { School, Plus, Edit, Trash2, Search, Users, AlertTriangle, Calendar, CheckCircle, Eye, Building2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddOrganizationModal } from '@/src/components/admin/modals/AddOrganizationModal';
import { AdminHeader } from '../layout/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface School {
  id: string;
  name: string;
  location?: string;
  studentCount?: number;
  alertCount?: number;
  checkInsToday?: number;
  address?: string;
  phone?: string;
  email?: string;
  _count?: {
    users: number;
    classes: number;
  };
}

interface Metrics {
  totalSchools: number;
  totalStudents: number;
  activeAlerts: number;
  checkinsToday: number;
}

export function OrganizationsSection() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalSchools: 0,
    totalStudents: 0,
    activeAlerts: 0,
    checkinsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const handleViewSchool = (schoolId: string) => {
    console.log('View school:', schoolId);
    // TODO: Navigate to school details
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.email && school.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchools = filteredSchools.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (schools.length > 0) {
      fetchMetrics();
    }
  }, [schools]);

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
          location: school.address || 'Unknown Location', // Use address as location
          studentCount: school._count?.users || 0, // Use user count as student count
          alertCount: 0, // TODO: Get from API when available
          checkInsToday: 0, // TODO: Get from API when available
        }));
        
        // If user is ADMIN, filter to show only their school
        if (permissions.isAdmin && permissions.userSchoolId) {
          schoolsData = schoolsData.filter((school: School) => 
            school.id === permissions.userSchoolId
          );
        }
        
        setSchools(schoolsData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/schools/metrics', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        let metricsData = data.data;
        
        // If user is ADMIN, adjust metrics to show only their school's data
        if (permissions.isAdmin && permissions.userSchoolId) {
          const schoolData = schools.find(school => school.id === permissions.userSchoolId);
          if (schoolData) {
            metricsData = {
              totalSchools: 1,
              totalStudents: schoolData._count?.users || 0,
              activeAlerts: 0, // TODO: Implement per-school alerts
              checkinsToday: 0, // TODO: Implement per-school check-ins
            };
          }
        }
        
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = (newSchool: any) => {
    setSchools([newSchool, ...schools]);
    setSuccessMessage(`✅ Organization "${newSchool.name}" created successfully!\n\n🎯 **School ID:** ${newSchool.id}\n\n📝 Format: SCH-ABC-TIMESTAMP-CODE\n\nCopy this ID for future reference.`);
    setTimeout(() => setSuccessMessage(''), 12000); // Extended display time for ID explanation
  };

  const handleEditOrganization = (school: School) => {
    // TODO: Implement edit functionality
    console.log('Edit organization:', school);
  };

  const handleDeleteOrganization = async (school: School) => {
    if (!confirm(`Are you sure you want to delete "${school.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/schools/${school.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setSchools(schools.filter(s => s.id !== school.id));
        setSuccessMessage(`Organization "${school.name}" deleted successfully`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(data.message || 'Failed to delete organization');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  if (!permissions.canManageOrgs) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
          <p className="text-red-700 mt-1">
            You don't have permission to manage organizations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Organizations"
        subtitle="Manage and monitor all schools in the platform"
        showTimeFilter={false}
        actions={
          permissions.canManageOrgs && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#3c83f6] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Organization</span>
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-[#ebf2fe]">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-semibold">{schools.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-semibold">{schools.reduce((acc, s) => acc + (s.studentCount || 0), 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-[#fdecec]">
                <AlertTriangle className="h-5 w-5 text-[#f15858]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-semibold">{schools.reduce((acc, s) => acc + (s.alertCount || 0), 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-ins Today</p>
                <p className="text-2xl font-semibold">{schools.reduce((acc, s) => acc + (s.checkInsToday || 0), 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schools Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow  className='text-[#65758b]'>
                  <TableHead>School Name</TableHead>
                  <TableHead>School ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Alerts</TableHead>
                  <TableHead className="text-center">Check-ins Today</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-base">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#65758b] text-muted-foreground" />
                        {school.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{school.id}</TableCell>
                    <TableCell className="text-muted-foreground text-[#65758b]">{school.location || 'N/A'}</TableCell>
                    <TableCell className="text-center">{school.studentCount || 0}</TableCell>
                    <TableCell className="text-center">
                      {(school.alertCount || 0) > 0 ? (
                        <Badge variant="destructive">{school.alertCount}</Badge>
                      ) : (
                        <Badge variant="secondary">0</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{school.checkInsToday || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSchool(school.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredSchools.length}
            onPageChange={handlePageChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
      
      {/* Add Organization Modal */}
      {showAddModal && (
        <AddOrganizationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchSchools(); // Refresh the list
          }}
        />
      )}
    </div>
  );
}
