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
  const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  const userSchoolId = user.school?.id || null;

  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission as any);
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
    
    // Student Management (for admins)
    canManageStudents: hasPermission('users.create') && userRole === 'ADMIN',
    canViewStudents: hasPermission('users.view') && userRole === 'ADMIN',
    
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
    
    // Utility functions
    hasPermission,
    userSchoolId,
    userRole,
    userPermissions,
  };
}
