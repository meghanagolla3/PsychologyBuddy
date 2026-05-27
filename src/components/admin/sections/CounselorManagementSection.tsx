"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAuth } from '@/src/contexts/AuthContext';
import { useSchoolFilter } from '@/src/contexts/SchoolFilterContext';

import {
  Plus, Search, ChevronRight, Edit, Trash2, Heart, Eye, Users, X
} from 'lucide-react';

import { AddCounselorModal } from '@/src/components/admin/modals/AddCounselorModal';
import { EditCounselorModal } from '@/src/components/admin/modals/EditCounselorModal';
import { ViewCounselorModal } from '../modals/ViewCounselorModal';
import { AssignStudentsModal } from '@/src/components/admin/modals/AssignStudentsModal';

import { Counselor } from '@/src/types/counselor.types';
import { AdminHeader } from '../layout/AdminHeader';
import { formatRelativeTime } from '@/src/utils/date.util';

import {
  Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAdminLoading, AdminActions } from '@/src/contexts/AdminLoadingContext';
import { LoadingButton, TableRowLoader } from '@/src/components/admin/ui/AdminLoader';

///////////////////////////////////////////////////////////////////////////
// CONSTANTS
///////////////////////////////////////////////////////////////////////////

const DEV_LOG = false; // Set true if you want logs

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "COUNSELOR": { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]", label: "Counselor" },
  // Default fallback for unknown roles
  "DEFAULT": { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown Role" },
};

///////////////////////////////////////////////////////////////////////////
// MAIN COMPONENT
///////////////////////////////////////////////////////////////////////////

export function CounselorManagementSection() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const { selectedSchoolId, setSelectedSchoolId, schools, isSuperAdmin } = useSchoolFilter();
  const { executeWithLoading, isLoading: isActionLoading } = useAdminLoading();

  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  const { hasPermission } = usePermissions();

  // Check if user should see location filter
  // Only SCHOOL_SUPERADMIN should see location filter (ADMIN users are auto-restricted to their assigned locations)
  const effectiveSchoolId = (user?.role?.name === 'SCHOOL_SUPERADMIN' || user?.role?.name === 'ADMIN') ? user?.school?.id : selectedSchoolId;
  const shouldShowLocationFilter = user?.role?.name === 'SCHOOL_SUPERADMIN' && effectiveSchoolId && effectiveSchoolId !== 'all';

  const canCreateCounselors = hasPermission('counselor.management.create');
  const canViewCounselors = hasPermission('counselor.management.view');
  const canUpdateCounselors = hasPermission('counselor.management.update');
  const canDeleteCounselors = hasPermission('counselor.management.delete');

  ///////////////////////////////////////////////////////////////////////////
  // FETCH COUNSELORS
  ///////////////////////////////////////////////////////////////////////////

  const fetchCounselors = useCallback(async () => {
    try {
      await executeWithLoading(
        AdminActions.FETCH_ADMINS, // Reuse existing loading action
        (async () => {
          const params = new URLSearchParams();
          
          // Add pagination parameters
          params.append('page', page.toString());
          params.append('limit', limit.toString());
          
          // Add school filter if applicable
          if (isSuperAdmin && selectedSchoolId && selectedSchoolId !== 'all') {
            params.append('schoolId', selectedSchoolId);
          }
          
          // Add location filter if applicable
          if (locationFilter && locationFilter !== 'all') {
            params.append('locationId', locationFilter);
          }
          
          const url = `/api/counselors${params.toString() ? `?${params.toString()}` : ''}`;
          const response = await fetch(url, { credentials: 'include' });
          if (!response.ok) return;

          const data = await response.json();
          if (data.success) {
            // Handle paginated response structure
            const counselorData = data.data?.counselors || data.data || [];
            setCounselors(counselorData);
            
            // Update pagination info
            if (data.data?.pagination) {
              setPagination(data.data.pagination);
              // Don't reset page when fetching with pagination
              if (page === 1) {
                setPage(data.data.pagination.page || 1);
              }
            }
          } else {
            // Reset page if no pagination data
            setPagination(null);
            setPage(1);
          }
        })(),
        'Fetching counselors...'
      );

    } catch (err) {
      console.error("Error fetching counselors:", err);
    }
  }, [selectedSchoolId, isSuperAdmin, locationFilter, executeWithLoading, page, limit]);

  ///////////////////////////////////////////////////////////////////////////
  // FETCH LOCATIONS
  ///////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchLocations = async () => {
      if (effectiveSchoolId && effectiveSchoolId !== 'all') {
        try {
          const response = await fetch(`/api/admin/schools/locations?schoolId=${effectiveSchoolId}`, { 
            credentials: 'include' 
          });
          const data = await response.json();
          setLocations(data || []);
        } catch (error) {
          console.error('Failed to fetch locations:', error);
          setLocations([]);
        }
      } else {
        setLocations([]);
        setLocationFilter("all");
      }
    };

    fetchLocations();
  }, [effectiveSchoolId]);

  ///////////////////////////////////////////////////////////////////////////
  // INITIAL LOAD
  ///////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (canViewCounselors) {
      fetchCounselors();
    }
  }, [canViewCounselors, fetchCounselors]);

  ///////////////////////////////////////////////////////////////////////////
  // FILTER COUNSELORS (MEMOIZED)
  ///////////////////////////////////////////////////////////////////////////

  const filteredCounselors = useMemo(() => {
    return counselors.filter((counselor) => {
      const term = searchTerm.toLowerCase();
      return (
        counselor.firstName.toLowerCase().includes(term) ||
        counselor.lastName.toLowerCase().includes(term) ||
        counselor.email.toLowerCase().includes(term)
      );
    });
  }, [counselors, searchTerm]);

  ///////////////////////////////////////////////////////////////////////////
  // DELETE COUNSELOR
  ///////////////////////////////////////////////////////////////////////////

  const deleteCounselor = useCallback(async () => {
    if (!selectedCounselor) return;

    try {
      await executeWithLoading(
        AdminActions.DELETE_ADMIN, // Reuse existing loading action
        (async () => {
          const response = await fetch(`/api/counselors/${selectedCounselor.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success) {
            toast({
              title: "Counselor deleted successfully",
              description: `${selectedCounselor.firstName} ${selectedCounselor.lastName} has been permanently deleted from the system.`
            });

            fetchCounselors();
          } else {
            toast({
              title: "Failed to delete counselor",
              description: data.message || "An error occurred while deleting the counselor.",
              variant: "destructive"
            });
          }
        })(),
        'Deleting counselor...'
      );

    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Failed to delete counselor",
        description: "Network error occurred. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedCounselor, fetchCounselors, toast, executeWithLoading]);

  ///////////////////////////////////////////////////////////////////////////
  // UI BLOCKED WITHOUT PERMISSION
  ///////////////////////////////////////////////////////////////////////////

  if (!canViewCounselors) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view counselors.</p>
        </div>
      </div>
    );
  }

  ///////////////////////////////////////////////////////////////////////////
  // JSX RENDER
  ///////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col min-h-screen">

      <AdminHeader
        title="Counselor Management"
        subtitle="Manage school counselors and their assignments"
        
        showTimeFilter={false}
        showSchoolFilter={isSuperAdmin}
        schoolFilterValue={selectedSchoolId}
        schools={schools}
        onSchoolFilterChange={setSelectedSchoolId}
        showLocationFilter={shouldShowLocationFilter || false}
        locationFilterValue={locationFilter}
        onLocationFilterChange={setLocationFilter}
        locations={locations}
        actions={
          canCreateCounselors && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Counselor
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search counselors..."
            className="pl-9 pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-300 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Counselor</TableHead>
                <TableHead className="font-semibold text-gray-700">Specialization</TableHead>
                <TableHead className="font-semibold text-gray-700">Today Counsels</TableHead>
                <TableHead className="font-semibold text-gray-700">Total Counsels</TableHead>
                <TableHead className="font-semibold text-gray-700">Declined Counsels</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isActionLoading(AdminActions.FETCH_ADMINS) ? (
                <TableRowLoader colSpan={7} message="Loading counselors..." />
              ) : filteredCounselors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No counselors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCounselors.map((counselor) => (
                  <TableRow key={counselor.id} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer" onClick={() => {
                    router.push(`/admin/counselors/${counselor.id}`);
                  }}>

                    {/* COUNSELOR */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={counselor.adminProfile?.profileImageUrl || ''}
                            alt={`${counselor.firstName} ${counselor.lastName}`}
                          />
                          <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                            {counselor.firstName[0]}{counselor.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {counselor.firstName} {counselor.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{counselor.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* SPECIALIZATION */}
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-600">
                        {counselor.adminProfile?.specialization || counselor.adminProfile?.department || 'Not specified'}
                      </span>
                    </TableCell>

                    {/* TODAY COUNSELS */}
                    <TableCell className="py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {counselor.sessionStats?.todayCounsels || 0}
                      </span>
                    </TableCell>

                    {/* TOTAL COUNSELS */}
                    <TableCell className="py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {counselor.sessionStats?.totalCounsels || 0}
                      </span>
                    </TableCell>

                    {/* DECLINED COUNSELS */}
                    <TableCell className="py-4">
                      <span className="text-sm font-semibold text-red-600">
                        {counselor.sessionStats?.declinedCounsels || 0}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="py-4">
                      <Badge
                        className={cn(
                          "font-medium",
                          counselor.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {counselor.status === "ACTIVE" ? "Active" : counselor.status.toLowerCase()}
                      </Badge>
                    </TableCell>

                    {/* CHEVRON RIGHT */}
                    <TableCell className="py-4">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
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
      </div>

      {/* ADD COUNSELOR */}
      {showAddModal && (
        <AddCounselorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCounselors();
          }}
          schools={schools || []}
        />
      )}

      {/* EDIT COUNSELOR */}
      {showEditModal && selectedCounselor && (
        <EditCounselorModal
          counselor={selectedCounselor}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchCounselors();
          }}
          schools={schools || []}
        />
      )}

      {/* VIEW COUNSELOR */}
      {showViewModal && selectedCounselor && (
        <ViewCounselorModal
          counselor={selectedCounselor}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Counselor</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedCounselor?.firstName} {selectedCounselor?.lastName}?
              This action cannot be undone and all counselor data will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <LoadingButton
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              loadingText="Cancelling..."
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              onClick={() => {
                deleteCounselor();
                setIsDeleteOpen(false);
              }}
              loadingText="Deleting..."
            >
              Delete Counselor
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ASSIGN STUDENTS */}
      {showAssignModal && selectedCounselor && (
        <AssignStudentsModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          counselor={selectedCounselor}
          onSuccess={() => {
            setShowAssignModal(false);
            fetchCounselors();
          }}
        />
      )}

    </div>
  );
}

