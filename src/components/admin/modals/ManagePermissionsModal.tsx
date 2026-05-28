"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Check, AlertCircle } from 'lucide-react';
import { Admin, Role } from '@/src/types/admin.types';
import { useAuth } from '@/src/contexts/AuthContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ManagePermissionsModalProps {
  admin: Admin;
  onClose: () => void;
  onSuccess: () => void;
}

const availablePermissions: Permission[] = [
  // Dashboard & Activity
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access the admin dashboard', category: 'Dashboard & Activity' },
  { id: 'activity.view', name: 'View Activity', description: 'View activity logs and reports', category: 'Dashboard & Activity' },
  
  // Organization Management
  { id: 'organizations.view', name: 'View Organizations', description: 'View organization details', category: 'Organization Management' },
  { id: 'organizations.create', name: 'Create Organizations', description: 'Create new organizations', category: 'Organization Management' },
  { id: 'organizations.update', name: 'Update Organizations', description: 'Edit organization details', category: 'Organization Management' },
  { id: 'organizations.delete', name: 'Delete Organizations', description: 'Delete organizations', category: 'Organization Management' },
  
  // Content Management
  { id: 'psycho.education.view', name: 'View Psychoeducation', description: 'View psychoeducation library', category: 'Content Management' },
  { id: 'psycho.education.create', name: 'Create Psychoeducation', description: 'Create psychoeducation content', category: 'Content Management' },
  { id: 'psycho.education.update', name: 'Update Psychoeducation', description: 'Edit psychoeducation content', category: 'Content Management' },
  { id: 'psycho.education.delete', name: 'Delete Psychoeducation', description: 'Delete psychoeducation content', category: 'Content Management' },
  
  // Self-Help Tools
  { id: 'selfhelp.view', name: 'View Self-Help Tools', description: 'Access self-help tools section', category: 'Self-Help Tools' },
  { id: 'selfhelp.journaling.view', name: 'View Journaling', description: 'View journaling tools', category: 'Self-Help Tools' },
  { id: 'selfhelp.journaling.update', name: 'Manage Journaling', description: 'Manage journaling features', category: 'Self-Help Tools' },
  { id: 'selfhelp.music.view', name: 'View Music Therapy', description: 'View music therapy tools', category: 'Self-Help Tools' },
  { id: 'selfhelp.music.create', name: 'Create Music Content', description: 'Create music therapy content', category: 'Self-Help Tools' },
  { id: 'selfhelp.music.update', name: 'Update Music Content', description: 'Edit music therapy content', category: 'Self-Help Tools' },
  { id: 'selfhelp.music.delete', name: 'Delete Music Content', description: 'Delete music therapy content', category: 'Self-Help Tools' },
  { id: 'selfhelp.meditation.view', name: 'View Meditation', description: 'View meditation tools', category: 'Self-Help Tools' },
  { id: 'selfhelp.meditation.create', name: 'Create Meditation', description: 'Create meditation content', category: 'Self-Help Tools' },
  { id: 'selfhelp.meditation.update', name: 'Update Meditation', description: 'Edit meditation content', category: 'Self-Help Tools' },
  { id: 'selfhelp.meditation.delete', name: 'Delete Meditation', description: 'Delete meditation content', category: 'Self-Help Tools' },
  
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user lists and details', category: 'User Management' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'User Management' },
  { id: 'users.update', name: 'Update Users', description: 'Edit user information', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Deactivate or delete users', category: 'User Management' },
  
  // Counselor Management
  { id: 'counselor.management.view', name: 'View Counselors', description: 'View counselor information', category: 'Counselor Management' },
  { id: 'counselor.management.create', name: 'Create Counselors', description: 'Create new counselor accounts', category: 'Counselor Management' },
  { id: 'counselor.management.update', name: 'Update Counselors', description: 'Edit counselor information', category: 'Counselor Management' },
  { id: 'counselor.management.delete', name: 'Delete Counselors', description: 'Delete counselor accounts', category: 'Counselor Management' },
  { id: 'counselor.management.assign', name: 'Assign Counselors', description: 'Assign counselors to students', category: 'Counselor Management' },
  
  // Student Support
  { id: 'counseling.sessions.view', name: 'View Sessions', description: 'View counseling sessions', category: 'Student Support' },
  { id: 'counseling.sessions.create', name: 'Create Sessions', description: 'Create new counseling sessions', category: 'Student Support' },
  { id: 'counseling.sessions.update', name: 'Update Sessions', description: 'Edit session details', category: 'Student Support' },
  { id: 'counseling.sessions.delete', name: 'Delete Sessions', description: 'Delete counseling sessions', category: 'Student Support' },
  { id: 'counseling.sessions.respond', name: 'Respond to Sessions', description: 'Respond to session requests', category: 'Student Support' },
  { id: 'counseling.sessions.manage', name: 'Manage Sessions', description: 'Manage all session activities', category: 'Student Support' },
  { id: 'parent.meetings.view', name: 'View Parent Meetings', description: 'View parent meetings', category: 'Student Support' },
  { id: 'parent.meetings.manage', name: 'Manage Parent Meetings', description: 'Manage parent meetings', category: 'Student Support' },
  { id: 'escalations.view', name: 'View Escalations', description: 'View escalation alerts', category: 'Student Support' },
  { id: 'escalations.respond', name: 'Respond to Escalations', description: 'Respond to escalation alerts', category: 'Student Support' },
  
  // Engagement
  { id: 'badges.view', name: 'View Badges & Streaks', description: 'View badges and achievements', category: 'Engagement' },
  { id: 'badges.assign', name: 'Assign Badges', description: 'Assign badges to users', category: 'Engagement' },
  { id: 'challenges.view', name: 'View Challenges', description: 'View challenges', category: 'Engagement' },
  { id: 'challenges.create', name: 'Create Challenges', description: 'Create new challenges', category: 'Engagement' },
  { id: 'challenges.update', name: 'Update Challenges', description: 'Edit challenge details', category: 'Engagement' },
  { id: 'challenges.delete', name: 'Delete Challenges', description: 'Delete challenges', category: 'Engagement' },
  
  // Analytics
  { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'Analytics' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'Settings' },
  { id: 'settings.update', name: 'Update Settings', description: 'Edit system settings', category: 'Settings' },
  
  // Administration
  { id: 'access.control.manage', name: 'Manage Access Control', description: 'Manage access control settings', category: 'Administration' },
  { id: 'permissions.manage', name: 'Manage Permissions', description: 'Manage user roles and permissions', category: 'Administration' },
];

export function ManagePermissionsModal({ admin, onClose, onSuccess }: ManagePermissionsModalProps) {
  const { user: currentUser } = useAuth();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user's role
  const currentUserRole = currentUser?.role?.name;

  // Filter permissions based on current user's role
  const getFilteredPermissions = () => {
    // SUPERADMIN sees all permissions
    if (currentUserRole === 'SUPERADMIN') {
      return availablePermissions;
    }

    // SCHOOL_SUPERADMIN only sees permissions they have, excluding manage permissions
    if (currentUserRole === 'SCHOOL_SUPERADMIN') {
      const currentUserPermissions = currentUser?.role?.rolePermissions?.map(
        (rp: any) => rp.permission.name
      ) || [];

      return availablePermissions.filter(permission => {
        // Hide manage permissions feature from school super admins
        if (permission.id === 'permissions.manage') {
          return false;
        }
        // Only show permissions that the current school super admin has
        return currentUserPermissions.includes(permission.id);
      });
    }

    // For other roles (like ADMIN), don't show any permissions
    return [];
  };

  const filteredPermissions = getFilteredPermissions();

  useEffect(() => {
    const permissions = admin.role.rolePermissions?.map(rp => rp.permission.name) || [];
    setSelectedPermissions(permissions);
  }, [admin]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admins/${admin.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          permissions: selectedPermissions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update permissions');
      }

      const data = await response.json();
      
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error?.message || 'Failed to update permissions');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
              <p className="text-sm text-gray-600">
                {admin.firstName} {admin.lastName} ({admin.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {filteredPermissions.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Available</h3>
              <p className="text-sm text-gray-600">
                {currentUserRole === 'SCHOOL_SUPERADMIN' 
                  ? "You don't have permission to manage permissions. Please contact your administrator."
                  : "No permissions available to manage."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {permission.name}
                            </span>
                            {selectedPermissions.includes(permission.id) && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Selected:</strong> {selectedPermissions.length} of {filteredPermissions.length} permissions
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Save Permissions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
