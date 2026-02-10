import { useEffect, useState } from "react";

export function useUserPermissions() {
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.user?.role?.name) {
          // Get permissions from role
          const userRole = data.data.user.role.name;
          
          // Import role permissions from config
          import("@/src/config/permission").then(({ ROLE_PERMISSIONS }) => {
            const userPermissions = [...(ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [])];
            setPerms(userPermissions);
          });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch user permissions:', error);
        setLoading(false);
      });
  }, []);

  return {
    loading,
    permissions: perms,
    can: (perm: string) => perms.includes(perm),
    canView: (module: string) => perms.includes(`${module}.view`),
    canCreate: (module: string) => perms.includes(`${module}.create`),
    canUpdate: (module: string) => perms.includes(`${module}.update`),
    canDelete: (module: string) => perms.includes(`${module}.delete`),
    canRespond: (module: string) => perms.includes(`${module}.respond`),
    canAssign: (module: string) => perms.includes(`${module}.assign`),
    canManage: (module: string) => perms.includes(`${module}.manage`),
  };
}
