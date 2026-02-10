"use client";

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAuth } from '@/src/contexts/AuthContext';
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
  Shield,
  Building2,
  Settings,
  Key
} from 'lucide-react';
import { AddAdminModal } from '../modals/AddAdminModal';
import { EditAdminModal } from '../modals/EditAdminModal';
import { ViewAdminModal } from '../modals/ViewAdminModal';
import { ManagePermissionsModal } from '../modals/ManagePermissionsModal';
import { Admin, Role } from '@/src/types/admin.types';
import { AdminHeader } from '../layout/AdminHeader';

export function AdminManagementSection() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Permission checks
  const canCreateAdmins = hasPermission('users.create');
  const canViewAdmins = hasPermission('users.view');
  const canUpdateAdmins = hasPermission('users.update');
  const canDeleteAdmins = hasPermission('users.delete');
  const canManagePermissions = hasPermission('permissions.manage');

  useEffect(() => {
    if (canViewAdmins) {
      fetchAdmins();
      if (user?.role?.name === 'SUPERADMIN') {
        fetchSchools();
      }
    }
  }, [canViewAdmins]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (schoolFilter !== 'all') params.append('schoolId', schoolFilter);

      const response = await fetch(`/api/admins?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch admins:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('Admins API response:', data);
      
      if (data.success) {
        setAdmins(data.data || []);
        console.log('Admins loaded:', data.data?.length || 0);
      } else {
        console.error('API returned error:', data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch schools:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setSchools(data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setShowAddModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleManagePermissions = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowPermissionsModal(true);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to deactivate this admin?')) return;

    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to delete admin:', response.status);
        alert('Failed to delete admin');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        fetchAdmins();
        alert('Admin deleted successfully!');
      } else {
        alert(data.error?.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50';
      case 'SUSPENDED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getPermissionCount = (permissions: string[] | undefined) => {
    if (!permissions) return '0/7 features';
    return `${permissions.length}/7 features`;
  };

  if (!canViewAdmins) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader 
        title="Admin Management" 
        subtitle="Manage administrators and their permissions"
        showTimeFilter={false}
        actions={
          canCreateAdmins && (
          <button
            onClick={handleAddAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-[#3c83f6] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Admin</span>
          </button>
        )
          
        }
      />
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
          <p className="text-gray-600">Manage administrators and their permissions</p>
        </div>
        {canCreateAdmins && (
          <button
            onClick={handleAddAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin</span>
          </button>
        )}
      </div> */}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        {user?.role?.name === 'SUPERADMIN' && (
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Schools</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={fetchAdmins}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Apply</span>
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                            {getInitials(admin.firstName, admin.lastName)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.role.name === 'SUPERADMIN' 
                            ? 'text-purple-600 bg-purple-50' 
                            : 'text-blue-600 bg-blue-50'
                        }`}>
                          {admin.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.adminProfile?.lastActive ? (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(admin.adminProfile.lastActive).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewAdmin(admin)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canUpdateAdmins && (
                            <button
                              onClick={() => handleEditAdmin(admin)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Edit Admin"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteAdmins && (
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Deactivate Admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAdmins();
          }}
          schools={schools}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchAdmins();
          }}
          schools={schools}
        />
      )}

      {/* View Admin Modal */}
      {showViewModal && selectedAdmin && (
        <ViewAdminModal
          admin={selectedAdmin}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Manage Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <ManagePermissionsModal
          admin={selectedAdmin}
          onClose={() => setShowPermissionsModal(false)}
          onSuccess={() => {
            setShowPermissionsModal(false);
            fetchAdmins();
          }}
        />
      )}
    </div>
  );
}
