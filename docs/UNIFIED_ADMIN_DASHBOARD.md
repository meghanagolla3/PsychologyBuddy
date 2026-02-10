# 🎛️ Unified Admin Dashboard Documentation

## 📋 Overview

The Unified Admin Dashboard is a **single interface** that both Admin and SuperAdmin users access, but with **role-based capabilities** controlled by RBAC permissions and data scoping.

---

## 🏗️ Architecture

### **Single Dashboard, Multiple Roles**
```
/admin/dashboard ← Both Admin & SuperAdmin access this SAME URL
```

### **Role-Based Experience**
- **SuperAdmin**: System-wide access, all organizations, full control
- **Admin**: School-scoped access, limited to their assigned school
- **Student**: No access to admin dashboard

### **Permission-Based UI**
- Navigation items filtered by permissions
- Components show/hide based on user role
- Actions enabled/disabled by permission checks

---

## 🔐 Security Model

### **1. Backend Data Filtering**
```typescript
// SuperAdmin - No restrictions
const allStudents = await prisma.user.findMany({
  where: { role: { name: 'STUDENT' } }
});

// Admin - School-scoped only
const schoolStudents = await prisma.user.findMany({
  where: { 
    role: { name: 'STUDENT' },
    schoolId: currentUser.schoolId 
  }
});
```

### **2. Frontend Permission Guards**
```typescript
// Navigation filtering
const visibleItems = navigationItems.filter(item => {
  if (item.role && !item.role.includes(userRole)) return false;
  if (item.permission && !hasPermission(item.permission)) return false;
  return true;
});

// Component visibility
{permissions.canCreateArticle && <CreateButton />}
{permissions.isSuperAdmin && <SuperAdminPanel />}
```

### **3. Role-Based Routing**
```typescript
// Both roles use same route
/admin/dashboard → UnifiedAdminDashboard

// Inside component, role determines what's shown
if (permissions.isSuperAdmin) {
  // Show system-wide controls
} else if (permissions.isAdmin) {
  // Show school-scoped controls
}
```

---

## 📱 Dashboard Sections

### **🏠 Dashboard Overview**
- **SuperAdmin**: Platform-wide statistics, all organizations
- **Admin**: School-specific statistics, their students only
- **Features**: Quick actions, recent activities, role-specific info

### **🏫 Organizations** (SuperAdmin Only)
- **Permissions**: `organizations.view`, `organizations.create`, `organizations.update`
- **Features**: Create/edit schools, view all organizations, manage school settings
- **Admin Access**: ❌ Hidden from Admin users

### **👥 Users** (SuperAdmin Only)
- **Permissions**: `users.view`, `users.create`, `users.update`
- **Features**: Manage admin accounts, assign to schools, view all admins
- **Admin Access**: ❌ Hidden from Admin users

### **🎓 Students** (Admin Only)
- **Permissions**: `users.view`, `users.create`, `users.update`
- **Features**: Manage students in their school only, class assignments
- **SuperAdmin Access**: ✅ Can see all students across all schools

### **📚 Psycho-Education**
- **Permissions**: `psycho.education.view`, `psycho.education.create`, `psycho.education.update`
- **SuperAdmin**: Manage all articles, platform-wide content
- **Admin**: Create articles for their school, manage their content

### **💝 Self-Help Tools**
- **Permissions**: `selfhelp.view`, `selfhelp.journaling.update`, `selfhelp.music.update`
- **Features**: Enable/disable journaling, music, meditation per school
- **SuperAdmin**: Global feature toggles, per-school configuration
- **Admin**: School-specific tool management

### **📊 Analytics**
- **Permissions**: `analytics.view`
- **SuperAdmin**: Platform-wide analytics, all organizations
- **Admin**: School-specific analytics only
- **Features**: Usage stats, engagement trends, tool adoption

### **🛡️ Access Control** (SuperAdmin Only)
- **Permissions**: `access.control.manage`
- **Features**: Manage admin permissions, feature toggles, role assignments
- **Admin Access**: ❌ Hidden from Admin users

### **⚙️ Settings**
- **Permissions**: `settings.view`, `settings.update`
- **SuperAdmin**: Platform-wide settings, system configuration
- **Admin**: School-specific settings only
- **Features**: Notifications, security, data management

---

## 🎯 Role Capabilities

### **🔵 SuperAdmin Capabilities**
```typescript
✅ Can see ALL organizations
✅ Can create/manage admins
✅ Can manage permissions
✅ Can enable/disable features per school
✅ Can view platform-wide analytics
✅ Can manage system settings
✅ Can access ALL dashboard sections
```

### **🟡 Admin Capabilities**
```typescript
✅ Can see ONLY their assigned school
✅ Can manage students in their school
✅ Can create psycho-education content
✅ Can manage self-help tools (school-level)
✅ Can view school-specific analytics
✅ Can manage limited settings
❌ Cannot see other schools
❌ Cannot manage system permissions
❌ Cannot access Access Control section
```

### **🟩 Student Capabilities**
```typescript
❌ NO admin dashboard access
✅ Can use self-help tools
✅ Can view educational content
✅ Can manage own profile
```

---

## 🔧 Implementation Details

### **1. Permission Hook**
```typescript
// src/hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    canCreateArticle: hasPermission('psycho.education.create'),
    canManageOrgs: hasPermission('organizations.create'),
    isSuperAdmin: userRole === 'SUPERADMIN',
    isAdmin: userRole === 'ADMIN',
    userSchoolId: user?.school?.id,
  };
}
```

### **2. Navigation Filtering**
```typescript
const navigationItems = [
  { id: 'organizations', permission: 'organizations.view', role: ['SUPERADMIN'] },
  { id: 'students', permission: 'users.view', role: ['ADMIN'] },
  { id: 'access-control', permission: 'access.control.manage', role: ['SUPERADMIN'] },
];

// Filter based on user role and permissions
const visibleItems = navigationItems.filter(item => {
  return (!item.role || item.role.includes(userRole)) &&
         (!item.permission || hasPermission(item.permission));
});
```

### **3. Data Scoping in Components**
```typescript
// In StudentsSection
if (!permissions.canViewStudents) {
  return <AccessDenied />;
}

// API calls automatically scoped by backend
const students = await fetch('/api/students'); // Backend filters by schoolId
```

### **4. Component Guards**
```typescript
// SuperAdmin only features
{permissions.isSuperAdmin && (
  <SuperAdminFeaturePanel />
)}

// Permission-based actions
{permissions.canCreateArticle && (
  <CreateArticleButton />
)}
```

---

## 🚀 Usage Examples

### **SuperAdmin Experience**
```typescript
// SuperAdmin logs in → sees full navigation
// Navigation: Dashboard, Organizations, Users, Students, Psycho-Education, 
//            Self-Help, Analytics, Access Control, Settings

// Can manage all schools
// Can create admins for any school
// Can enable/disable features globally
// Can view platform-wide analytics
```

### **Admin Experience**
```typescript
// Admin logs in → sees limited navigation
// Navigation: Dashboard, Students, Psycho-Education, Self-Help, Analytics, Settings

// Can only see their school
// Can only manage their students
// Can create content for their school
// Can view school-specific analytics
// Cannot see Organizations, Users, or Access Control
```

---

## 📋 API Integration

### **Backend Filtering Logic**
```typescript
// Every API endpoint applies role-based filtering
export async function GET(req: Request) {
  const user = await getCurrentUser();
  
  if (user.role === 'SUPERADMIN') {
    // No filtering - return all data
    return prisma.user.findMany({ where: { role: 'STUDENT' } });
  } else if (user.role === 'ADMIN') {
    // School-scoped filtering
    return prisma.user.findMany({ 
      where: { 
        role: 'STUDENT',
        schoolId: user.schoolId 
      } 
    });
  }
}
```

### **Frontend Data Fetching**
```typescript
// Same API endpoint, different data based on user role
const response = await fetch('/api/students');
// Backend automatically filters based on user's schoolId
```

---

## 🎨 UI Components

### **Navigation Structure**
```
🏠 Dashboard
🏫 Organizations (SuperAdmin only)
👥 Users (SuperAdmin only)  
🎓 Students (Admin only)
📚 Psycho-Education
💝 Self-Help Tools
📊 Analytics
🛡️ Access Control (SuperAdmin only)
⚙️ Settings
```

### **Responsive Design**
- **Desktop**: Full sidebar navigation
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Adaptive layout with touch-friendly controls

### **Visual Role Indicators**
- **SuperAdmin**: Blue accent, "SuperAdmin" badge
- **Admin**: Green accent, "Admin" + school name
- **Access Denied**: Red warning panels for restricted sections

---

## 🔍 Testing Scenarios

### **SuperAdmin Testing**
```bash
# Login as SuperAdmin
# Verify all navigation items visible
# Test organization management
# Test admin creation
# Test access control features
# Verify platform-wide data access
```

### **Admin Testing**
```bash
# Login as Admin
# Verify limited navigation (no Organizations/Users/Access Control)
# Test student management (only their school)
# Test content creation
# Verify school-scoped analytics
# Test cross-school access denial
```

### **Permission Testing**
```bash
# Test permission-based UI hiding
# Test API access denial
# Test role-based redirects
# Test feature toggle functionality
```

---

## 📈 Benefits

### **✅ Unified Experience**
- Single codebase for both roles
- Consistent UI/UX across admin types
- Easier maintenance and updates

### **✅ Security by Design**
- RBAC enforced at multiple layers
- Data scoping prevents information leakage
- Permission-based UI prevents confusion

### **✅ Scalability**
- Easy to add new roles
- Simple to extend permissions
- Clear separation of concerns

### **✅ User Experience**
- Role-appropriate interface
- No confusion about available features
- Clear visual indicators of capabilities

---

## 🔄 Future Enhancements

### **Planned Features**
- [ ] Real-time notifications
- [ ] Advanced analytics dashboards
- [ ] Bulk operations for admins
- [ ] Custom permission groups
- [ ] Audit logging system
- [ ] Multi-tenant improvements

### **Technical Improvements**
- [ ] WebSocket integration for live updates
- [ ] Advanced caching strategies
- [ ] Performance optimizations
- [ ] Enhanced error handling
- [ ] Automated permission testing

This unified dashboard provides a **secure, scalable, and user-friendly** admin interface that adapts to user roles while maintaining strict security boundaries! 🚀
