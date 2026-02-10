"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { AccessControlSection } from '@/src/components/admin/sections/AccessControlSection';

export default function AccessControlPage() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const router = useRouter();

  // Redirect if not authenticated or not SuperAdmin
  React.useEffect(() => {
    if (!user || !permissions.isSuperAdmin || !permissions.hasPermission('access.control.manage')) {
      router.push('/login');
    }
  }, [user, permissions, router]);

  if (!user || !permissions.isSuperAdmin || !permissions.hasPermission('access.control.manage')) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
        <p className="text-gray-600">Manage permissions and access control</p>
      </div>
      
      <AccessControlSection />
    </div>
  );
}
