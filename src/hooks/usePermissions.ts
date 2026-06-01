import { useAuth } from '@/src/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/src/config/permission';

export function usePermissions() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      // Default to no permissions when not authenticated
      canCreateArticle: false,
      canManageOrgs: false,
      canManageUsers: false,
      canManageStudents: false,
      canManagePsychoEducation: false,
      canManageSelfHelp: false,
      canViewAnalytics: false,
      canManageAccessControl: false,
      canManageSettings: false,
      isSuperAdmin: false,
      isAdmin: false,
      isStudent: false,
      hasPermission: () => false,
      userSchoolId: null,
    };
  }

  const userRole = user.role.name;
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];

  // For ADMIN and SCHOOL_SUPERADMIN users, use individual permissions if set
  // If individual permissions exist, use only those (overrides role permissions)
  // Otherwise, fall back to role permissions
  let userPermissions = [...rolePermissions];
  if ((userRole === 'ADMIN' || userRole === 'SCHOOL_SUPERADMIN') && user.adminProfile?.adminPermissions) {
    const adminPermissions = user.adminProfile.adminPermissions.map((ap: any) => ap.permission?.name).filter(Boolean);
    // If individual permissions are set, use only those (not combined with role permissions)
    // This allows superadmin to control exactly what features the admin can access
    if (adminPermissions.length > 0) {
      userPermissions = adminPermissions;
      console.log(`${userRole} user - using individual permissions:`, adminPermissions);
    } else {
      console.log(`${userRole} user - no individual permissions found, using role permissions`);
    }
  } else if (userRole === 'ADMIN' || userRole === 'SCHOOL_SUPERADMIN') {
    console.log(`${userRole} user - no individual permissions found, using role permissions`);
  }
  
  const userSchoolId = user.school?.id || null;

  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission);
  };

  return {
    // Psycho-Education permissions
    canCreateArticle: hasPermission('psycho.education.create'),
    canUpdateArticle: hasPermission('psycho.education.update'),
    canDeleteArticle: hasPermission('psycho.education.delete'),
    canViewArticles: hasPermission('psycho.education.view'),
    
    // Self-Help permissions
    canManageJournaling: hasPermission('selfhelp.journaling.update'),
    canManageMusic: hasPermission('selfhelp.music.update'),
    canManageMeditation: hasPermission('selfhelp.meditation.update'),
    canViewSelfHelp: hasPermission('selfhelp.view'),
    
    // User Management permissions
    canManageUsers: hasPermission('users.create'),
    canUpdateUsers: hasPermission('users.update'),
    canDeleteUsers: hasPermission('users.delete'),
    canViewUsers: hasPermission('users.view'),
    
    // Student Management (for admins and superadmins)
    canManageStudents: (() => {
      const hasCreatePerm = hasPermission('users.create');
      const roleCheck = userRole === 'ADMIN' || userRole === 'SUPERADMIN' || userRole === 'SCHOOL_SUPERADMIN';
      const result = hasCreatePerm && roleCheck;
      return result;
    })(),
    canViewStudents: hasPermission('users.view') && (userRole === 'ADMIN' || userRole === 'SUPERADMIN' || userRole === 'SCHOOL_SUPERADMIN'),
    
    // Organization permissions (SuperAdmin only)
    canManageOrgs: hasPermission('organizations.create'),
    canUpdateOrgs: hasPermission('organizations.update'),
    canDeleteOrgs: hasPermission('organizations.delete'),
    canViewOrgs: hasPermission('organizations.view'),
    
    // Analytics permissions
    canViewAnalytics: hasPermission('analytics.view'),
    
    // Access Control (SuperAdmin only)
    canManageAccessControl: hasPermission('access.control.manage'),
    
    // Settings permissions
    canManageSettings: hasPermission('settings.update'),
    canViewSettings: hasPermission('settings.view'),
    
    // Role checks
    isSuperAdmin: userRole === 'SUPERADMIN',
    isAdmin: userRole === 'ADMIN',
    isStudent: userRole === 'STUDENT',
    isParent: userRole === 'PARENT',
    
    // Utility functions
    hasPermission,
    userSchoolId,
    userRole,
    userPermissions, // This should now be the correct value
  };
}

