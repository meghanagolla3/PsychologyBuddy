"use client";

import React, { useState, useEffect } from 'react';
import { X, Eye, Calendar, Shield, Building2, Users, Activity, Settings } from 'lucide-react';

interface ViewAdminModalProps {
  admin: any;
  onClose: () => void;
}

interface TabContent {
  overview: any;
  permissions: any;
  activity: any;
  settings: any;
}

export function ViewAdminModal({ admin, onClose }: ViewAdminModalProps) {
  const [activeTab, setActiveTab] = useState<keyof TabContent>('overview');
  const [tabData, setTabData] = useState<TabContent>({
    overview: null,
    permissions: null,
    activity: null,
    settings: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      fetchTabData(activeTab);
    }
  }, [admin, activeTab]);

  const fetchTabData = async (tab: keyof TabContent) => {
    if (tabData[tab]) return; // Already loaded

    setLoading(true);
    try {
      // For overview and permissions tabs, use existing admin data
      if (tab === 'overview' || tab === 'permissions') {
        setTabData(prev => ({ ...prev, [tab]: admin }));
        return;
      }

      // For other tabs, try to fetch from API (may not exist yet)
      const response = await fetch(`/api/admins/${admin.id}/${tab}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch ${tab}:`, response.status);
        // Set tab data to admin data as fallback
        setTabData(prev => ({ ...prev, [tab]: admin }));
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTabData(prev => ({ ...prev, [tab]: data.data }));
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      // Set tab data to admin data as fallback
      setTabData(prev => ({ ...prev, [tab]: admin }));
    } finally {
      setLoading(false);
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-gray-900">{admin.firstName} {admin.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{admin.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900">{admin.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
              {admin.role.name}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
              {admin.status}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Member Since</label>
            <p className="text-gray-900">{new Date(admin.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* School Information */}
      {admin.school && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">School Name</label>
              <p className="text-gray-900">{admin.school.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900">{admin.school.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contact</label>
              <p className="text-gray-900">{admin.school.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{admin.school.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile Details */}
      {admin.adminProfile && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admin.adminProfile.department && (
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-gray-900">{admin.adminProfile.department}</p>
              </div>
            )}
            {admin.adminProfile.lastActive && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Active</label>
                <p className="text-gray-900">
                  {new Date(admin.adminProfile.lastActive).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{admin._count?.students || 0}</div>
            <div className="text-sm text-gray-500">Students Managed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{admin.role?.permissions?.length || 0}</div>
            <div className="text-sm text-gray-500">Permissions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {admin.adminProfile?.lastActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-500">Current Status</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{admin.role?.permissions?.length || 0}</div>
            <div className="text-sm text-gray-600">Total Permissions</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">7</div>
            <div className="text-sm text-gray-600">Available Features</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Details</h3>
        <div className="space-y-3">
          {(admin.role?.permissions || []).map((permission: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-900">{permission}</span>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Dashboard View</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">User Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Student Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-500">Analytics (Limited)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">Admin account created</h4>
                <p className="text-sm text-gray-600 mt-1">Account was successfully created and assigned to school</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(admin.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">System</span>
            </div>
          </div>

          {admin.adminProfile?.lastActive && (
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">Last login activity</h4>
                  <p className="text-sm text-gray-600 mt-1">Admin accessed the dashboard</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(admin.adminProfile.lastActive).toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Login</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Student Management</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="text-sm font-medium text-gray-900">{admin._count?.students || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Students</span>
                <span className="text-sm font-medium text-green-600">--</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Account Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Age</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.floor((Date.now() - new Date(admin.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Active</span>
                <span className="text-sm font-medium text-gray-900">
                  {admin.adminProfile?.lastActive ? 
                    new Date(admin.adminProfile.lastActive).toLocaleDateString() : 
                    'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Information</p>
                <p className="text-xs text-gray-500">Update personal details and contact information</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Security Settings</p>
                <p className="text-xs text-gray-500">Password and authentication preferences</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">Manage</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">School Assignment</p>
                <p className="text-xs text-gray-500">Current school: {admin.school?.name || 'Not assigned'}</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">Change</button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
              {getInitials(admin.firstName, admin.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{admin.firstName} {admin.lastName}</h2>
              <p className="text-sm text-gray-500">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as keyof TabContent)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'permissions' && renderPermissionsTab()}
              {activeTab === 'activity' && renderActivityTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
