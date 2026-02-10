# 📋 Complete Roles and Permissions Structure

## 🎭 ROLES HIERARCHY

### 1. SUPERADMIN (System Owner)
- **Access Level**: Full system access
- **Scope**: All organizations, all users, all resources
- **Bypasses**: All permission checks
- **Use Case**: System maintenance, emergency access

### 2. ADMIN (Organization Admin)  
- **Access Level**: Limited management access
- **Scope**: Their assigned school only
- **Restrictions**: Cannot delete users, cannot manage access control
- **Use Case**: Daily school administration

### 3. STUDENT (End User)
- **Access Level**: Read-only access to safe content
- **Scope**: Personal data only
- **Restrictions**: Cannot create/delete anything critical
- **Use Case**: Learning and self-help tools

---

## 🔐 PERMISSIONS BREAKDOWN

### 📊 MODULES (12 Total)

| Module | Description | Student | Admin | SuperAdmin |
|---------|-------------|----------|---------|-------------|
| **DASHBOARD** | Main dashboard | ✅ VIEW | ✅ VIEW | ✅ VIEW |
| **ACTIVITY** | Activity tracking | ✅ VIEW | ✅ VIEW | ✅ VIEW |
| **ORGANIZATIONS** | School management | ❌ | ✅ VIEW, UPDATE | ✅ ALL |
| **PSYCHO_EDUCATION** | Educational content | ✅ VIEW | ✅ VIEW, CREATE, UPDATE | ✅ ALL |
| **SELF_HELP** | Self-help tools | ✅ VIEW | ✅ VIEW | ✅ VIEW |
| **SELF_HELP_JOURNALING** | Journal writing | ✅ VIEW, UPDATE | ✅ VIEW, UPDATE | ✅ ALL |
| **SELF_HELP_MUSIC** | Music therapy | ✅ VIEW | ✅ VIEW, CREATE, UPDATE | ✅ ALL |
| **SELF_HELP_MEDITATION** | Meditation | ✅ VIEW | ✅ VIEW, CREATE, UPDATE | ✅ ALL |
| **ANALYTICS** | Reports & insights | ❌ | ✅ VIEW | ✅ VIEW |
| **USER_MANAGEMENT** | User CRUD | ❌ | ✅ VIEW, CREATE, UPDATE | ✅ ALL |
| **ESCALATIONS** | Crisis management | ❌ | ✅ VIEW, RESPOND | ✅ VIEW, RESPOND |
| **BADGES** | Achievement system | ✅ VIEW | ✅ VIEW, ASSIGN | ✅ VIEW, ASSIGN |
| **SETTINGS** | System settings | ❌ | ✅ VIEW, UPDATE | ✅ VIEW, UPDATE |
| **ACCESS_CONTROL** | RBAC management | ❌ | ❌ | ✅ MANAGE |
| **CHAT_MONITOR** | Chat oversight | ❌ | ❌ | ✅ VIEW |

---

## 🎯 ACTIONS (7 Types)

| Action | Description | Example Use |
|--------|-------------|--------------|
| **VIEW** | Read access | View dashboard, read articles |
| **CREATE** | Add new resources | Create articles, upload music |
| **UPDATE** | Modify existing | Edit articles, update settings |
| **DELETE** | Remove resources | Delete articles, remove users |
| **RESPOND** | Handle escalations | Respond to student crises |
| **ASSIGN** | Grant achievements | Award badges to students |
| **MANAGE** | Full control | Manage permissions, system config |

---

## 📝 PERMISSION KEYS (Complete List)

### SUPERADMIN (47+ Permissions)
```
dashboard.view
activity.view
organizations.view, organizations.create, organizations.update, organizations.delete
psycho.education.view, psycho.education.create, psycho.education.update, psycho.education.delete
selfhelp.view
selfhelp.journaling.view, selfhelp.journaling.update
selfhelp.music.view, selfhelp.music.create, selfhelp.music.update, selfhelp.music.delete
selfhelp.meditation.view, selfhelp.meditation.create, selfhelp.meditation.update, selfhelp.meditation.delete
analytics.view
users.view, users.create, users.update, users.delete
escalations.view, escalations.respond
badges.view, badges.assign
settings.view, settings.update
access.control.manage
chat.monitor.view
```

### ADMIN (25 Permissions)
```
dashboard.view
activity.view
organizations.view, organizations.update
psycho.education.view, psycho.education.create, psycho.education.update
selfhelp.view
selfhelp.journaling.view, selfhelp.journaling.update
selfhelp.music.view, selfhelp.music.create, selfhelp.music.update
selfhelp.meditation.view, selfhelp.meditation.create, selfhelp.meditation.update
analytics.view
users.view, users.create, users.update
escalations.view, escalations.respond
badges.view, badges.assign
settings.view, settings.update
```

### STUDENT (9 Permissions)
```
dashboard.view
activity.view
psycho.education.view
selfhelp.view
selfhelp.journaling.view
selfhelp.music.view
selfhelp.meditation.view
badges.view
```

---

## 🔒 SECURITY RULES

### ✅ ALLOWED FOR STUDENTS
- View educational content
- Use self-help tools (journaling, music, meditation)
- View their own dashboard and activity
- Earn and view badges

### ❌ FORBIDDEN FOR STUDENTS
- Creating/deleting any content
- Managing other users
- Accessing analytics
- Viewing escalations
- Changing settings

### ✅ ALLOWED FOR ADMINS
- All student permissions
- Create and manage educational content
- Manage users in their school (no deletion)
- View analytics and respond to escalations
- Manage school settings

### ❌ FORBIDDEN FOR ADMINS
- Delete users
- Manage access control permissions
- Access other schools' data
- Monitor chats

### ✅ SUPERADMIN PRIVILEGES
- Bypass all permission checks
- Full system access
- Emergency override capabilities

---

## 🎮 USAGE EXAMPLES

### Frontend Components
```tsx
// Role-based rendering
<SuperAdminOnly>
  <SystemSettings />
</SuperAdminOnly>

<AdminOnly>
  <UserManagement />
</AdminOnly>

<StudentOnly>
  <SelfHelpTools />
</StudentOnly>

// Permission-based rendering
<CanCreate module="PSYCHO_EDUCATION">
  <CreateArticleButton />
</CanCreate>

<CanUpdate module="USER_MANAGEMENT">
  <EditUserButton userId={user.id} />
</CanUpdate>
```

### Backend Middleware
```typescript
// Protect API routes
export const POST = withPermission({ 
  module: 'PSYCHO_EDUCATION', 
  action: 'CREATE' 
})(createArticleHandler);

export const DELETE = withPermission({ 
  module: 'USER_MANAGEMENT', 
  action: 'DELETE' 
})(deleteUserHandler);
```

### Permission Checks
```typescript
const { can, canCreate, canDelete } = useUserPermissions();

if (can('users.create')) {
  // Show create user button
}

if (canCreate('PSYCHO_EDUCATION')) {
  // Show create article button
}

if (canDelete('ORGANIZATIONS')) {
  // Show delete organization button
}
```

---

## 🚀 IMPLEMENTATION STATUS

✅ **COMPLETED**:
- Permission configuration (`permission.ts`)
- Database seeding with roles & permissions
- Authentication layer (login, logout, session management)
- RBAC middleware (`withPermission`)
- Frontend hooks (`useUserPermissions`, `useRole`)
- Protected components (`Protected.tsx`)

🎯 **READY FOR**:
- API route protection
- UI conditional rendering
- Role-based navigation
- School scoping for admins

This RBAC system provides **military-grade security** with **defense in depth** - multiple layers ensuring students can only access safe content, admins can only manage their school, and superadmins maintain system integrity.
