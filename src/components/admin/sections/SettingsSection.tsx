"use client";

import React, { useState } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { Settings, Save, Bell, Shield, Database } from 'lucide-react';

export function SettingsSection() {
  const permissions = usePermissions();

  // State for form values
  const [formData, setFormData] = useState({
    general: {
      platformName: 'Psychology Buddy',
      supportEmail: 'support@psychologybuddy.com',
      maintenanceMode: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
    },
    security: {
      sessionTimeout: '24 hours',
      passwordMinLength: 8,
      twoFactorAuth: false,
    },
    data: {
      dataRetention: '2 years',
      backupFrequency: 'daily',
      anonymizeData: true,
    },
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // In real app, this would save to API
    console.log('Saving settings:', formData);
    // Show success message or handle errors
  };

  if (!permissions.canViewSettings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
          <p className="text-red-700 mt-1">
            You don't have permission to view settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          {permissions.isSuperAdmin 
            ? 'Platform-wide settings and configuration' 
            : 'School-specific settings'
          }
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={formData.general.platformName}
              onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
              disabled={!permissions.canManageSettings}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={formData.general.supportEmail}
              onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
              disabled={!permissions.canManageSettings}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="maintenance"
              checked={formData.general.maintenanceMode}
              onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
              disabled={!permissions.canManageSettings}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="maintenance" className="text-sm text-gray-700">
              Maintenance Mode
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="email-notifications"
              checked={formData.notifications.emailNotifications}
              onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
              disabled={!permissions.canManageSettings}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="email-notifications" className="text-sm text-gray-700">
              Email Notifications
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="push-notifications"
              checked={formData.notifications.pushNotifications}
              onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
              disabled={!permissions.canManageSettings}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="push-notifications" className="text-sm text-gray-700">
              Push Notifications
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="weekly-reports"
              checked={formData.notifications.weeklyReports}
              onChange={(e) => handleInputChange('notifications', 'weeklyReports', e.target.checked)}
              disabled={!permissions.canManageSettings}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="weekly-reports" className="text-sm text-gray-700">
              Weekly Reports
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout
            </label>
            <select
              value={formData.security.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
              disabled={!permissions.canManageSettings}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="1 hour">1 hour</option>
              <option value="8 hours">8 hours</option>
              <option value="24 hours">24 hours</option>
              <option value="7 days">7 days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={formData.security.passwordMinLength}
              onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
              disabled={!permissions.canManageSettings}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="2fa"
              checked={formData.security.twoFactorAuth}
              onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
              disabled={!permissions.canManageSettings}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="2fa" className="text-sm text-gray-700">
              Two-Factor Authentication
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Database className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Retention Period
            </label>
            <select
              value={formData.data.dataRetention}
              onChange={(e) => handleInputChange('data', 'dataRetention', e.target.value)}
              disabled={!permissions.canManageSettings}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="5 years">5 years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Backup Frequency
            </label>
            <select
              value={formData.data.backupFrequency}
              onChange={(e) => handleInputChange('data', 'backupFrequency', e.target.value)}
              disabled={!permissions.canManageSettings}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="anonymize"
              checked={formData.data.anonymizeData}
              onChange={(e) => handleInputChange('data', 'anonymizeData', e.target.checked)}
              disabled={!permissions.canManageSettings}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="anonymize" className="text-sm text-gray-700">
              Anonymize User Data
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {permissions.canManageSettings && (
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      )}

      {/* Role-specific Info */}
      {permissions.isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Settings className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Platform Settings</h3>
              <p className="text-blue-700 mt-1">
                You are configuring platform-wide settings. These changes will affect all organizations 
                and users across the entire system.
              </p>
            </div>
          </div>
        </div>
      )}

      {permissions.isAdmin && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Settings className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">School Settings</h3>
              <p className="text-green-700 mt-1">
                You are configuring settings for your school only. Some platform-level settings 
                are managed by SuperAdmins.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
