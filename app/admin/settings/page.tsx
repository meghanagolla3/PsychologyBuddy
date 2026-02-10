"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { SettingsSection } from '@/src/components/admin/sections/SettingsSection';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const permissions = usePermissions();
  const router = useRouter();

  // Redirect if not authenticated or doesn't have settings permission
  React.useEffect(() => {
    if (!loading && (!user || !permissions.hasPermission('settings.view'))) {
      console.log('Redirecting to login from settings');
      router.push('/login');
    }
  }, [user, loading, permissions, router]);

  // Debug logging
  console.log('Settings Auth Debug:', { 
    user, 
    loading, 
    hasSettingsPermission: permissions.hasPermission('settings.view'),
    userRole: permissions.userRole
  });

  // Show loading while auth is checking
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!user || !permissions.hasPermission('settings.view')) {
    return <div>Checking permissions...</div>;
  }

  return (
    <div className="p-6">
      <SettingsSection />
    </div>
  );
}
