"use client";

import React, { useState } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { Shield, Users, Settings, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export function AccessControlSection() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  const adminPermissions = [
    {
      id: '1',
      adminName: 'John Doe',
      adminEmail: 'john.doe@school.edu',
      school: 'Lincoln High School',
      permissions: ['users.create', 'users.update', 'psycho.education.create'],
      customPermissions: {
        canManageJournaling: true,
        canManageMusic: false,
        canManageMeditation: true,
      },
    },
    {
      id: '2',
      adminName: 'Jane Smith',
      adminEmail: 'jane.smith@school.edu',
      school: 'Washington Academy',
      permissions: ['users.create', 'psycho.education.view', 'selfhelp.view'],
      customPermissions: {
        canManageJournaling: false,
        canManageMusic: true,
        canManageMeditation: false,
      },
    },
  ];

  const filteredAdmins = adminPermissions.filter(admin =>
    admin.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!permissions.canManageAccessControl) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
          <p className="text-red-700 mt-1">
            You don't have permission to manage access control. This feature is only available to SuperAdmins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
        <p className="text-gray-600">Manage admin permissions and feature access</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Admin Permissions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{admin.adminName}</div>
                        <div className="text-sm text-gray-500">{admin.adminEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.school}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.map((permission, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Journaling:</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          {admin.customPermissions.canManageJournaling ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Music:</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          {admin.customPermissions.canManageMusic ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Meditation:</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          {admin.customPermissions.canManageMeditation ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Feature Toggles</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Journaling Module</h3>
              <p className="text-sm text-gray-500">Enable/disable journaling for all schools</p>
            </div>
            <button className="text-green-500">
              <ToggleRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Music Therapy</h3>
              <p className="text-sm text-gray-500">Enable/disable music therapy for all schools</p>
            </div>
            <button className="text-green-500">
              <ToggleRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Meditation Sessions</h3>
              <p className="text-sm text-gray-500">Enable/disable meditation for all schools</p>
            </div>
            <button className="text-gray-400">
              <ToggleLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* SuperAdmin Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">SuperAdmin Access Control</h3>
            <p className="text-blue-700 mt-1">
              As SuperAdmin, you can manage permissions for all admins and control feature availability 
              across the entire platform. Changes here affect all organizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
