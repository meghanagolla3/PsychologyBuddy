# Journaling Settings Flow - Admin to Student

This document outlines the complete flow of how journaling settings are configured by admins/super admins and how those settings affect student access.

## 🔄 Overall Flow

```
Admin/Super Admin → API Configuration → Database → Student API → Student UI
```

## 📋 Step-by-Step Flow

### 1. **Admin Access & Authentication**
- **Super Admin**: Can access all schools' journaling settings
- **School Admin**: Can only access their assigned school's settings
- Authentication via `x-user-id` header
- Role verification via `user.role.name`

### 2. **Admin Configuration Interface**
Located at: `/src/components/admin/tools/SelfHelpTools/JournalingTools.tsx`

#### **Journaling Types Configuration**
```typescript
// Admin can toggle these settings:
- Writing (text-based journaling)
- Audio (voice recordings) 
- Art-Based (drawing & visual art)
```

#### **Audio Settings** (when audio is enabled)
```typescript
- maxRecordingDuration: 60-600 seconds
- autoDeleteBehavior: manual | 7days | 14days | 30days | 90days
```

#### **Art Settings** (when art is enabled)
```typescript
- undoRedoEnabled: boolean
- colorPaletteEnabled: boolean  
- clearCanvasEnabled: boolean
```

### 3. **API Configuration Flow**

#### **Admin Saves Configuration**
```
PUT /api/admin/journaling/config
Headers: x-user-id, x-school-id (for admins only)
Body: {
  enableWriting: boolean,
  enableAudio: boolean,
  enableArt: boolean,
  maxAudioDuration: number,
  enableUndo: boolean,
  enableRedo: boolean,
  enableClearCanvas: boolean,
  schoolId: string (admins only)
}
```

#### **Backend Processing**
1. **Controller**: `journalingAdminController.updateJournalingConfig()`
2. **Service**: `JournalingAdminService.updateJournalingConfig()`
3. **Repository**: `JournalingAdminRepository.updateJournalingConfig()`
4. **Database**: Updates `JournalingToolConfig` table

### 4. **Student Access Flow**

#### **Student Attempts Journaling**
```
Student UI → Student API → Configuration Check → Allow/Deny Access
```

#### **Configuration Validation**
For each journaling type, the system checks:

```typescript
// Writing Journal Check
const config = await JournalingUtils.getOrCreateDefaultConfig(schoolId);
if (!config?.enableWriting) {
  throw new AuthError('Writing journaling is disabled for your school', 403);
}

// Audio Journal Check  
if (!config?.enableAudio) {
  throw new AuthError('Audio journaling is disabled for your school', 403);
}

// Art Journal Check
if (!config?.enableArt) {
  throw new AuthError('Art journaling is disabled for your school', 403);
}
```

### 5. **Student UI Response**

#### **If Enabled** ✅
- Student sees the journaling option in their UI
- Can create entries of that type
- Respects additional settings (duration limits, tool availability, etc.)

#### **If Disabled** ❌
- Option is hidden or disabled in student UI
- API returns 403 if student tries to access directly
- Clear error message: "X journaling is disabled for your school"

## 🔐 Permission Matrix

| Action | Super Admin | School Admin | Student |
|--------|-------------|--------------|----------|
| View all schools' config | ✅ | ❌ | ❌ |
| View own school's config | ✅ | ✅ | ❌ |
| Update all schools' config | ✅ | ❌ | ❌ |
| Update own school's config | ✅ | ✅ | ❌ |
| Create journal entries | ❌ | ❌ | ✅* |
| View own journal entries | ❌ | ❌ | ✅* |

*Only if the journaling type is enabled for their school

## 🗄️ Database Schema

### **JournalingToolConfig Table**
```sql
CREATE TABLE JournalingToolConfig (
  id STRING PRIMARY KEY,
  schoolId STRING NOT NULL,
  enableWriting BOOLEAN DEFAULT true,
  enableAudio BOOLEAN DEFAULT true,
  enableArt BOOLEAN DEFAULT true,
  maxAudioDuration INTEGER DEFAULT 180,
  autoSaveAudio BOOLEAN DEFAULT false,
  enableUndo BOOLEAN DEFAULT true,
  enableRedo BOOLEAN DEFAULT true,
  enableClearCanvas BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **JournalingPrompt Table**
```sql
CREATE TABLE JournalingPrompt (
  id STRING PRIMARY KEY,
  text TEXT NOT NULL,
  moodIds JSON,
  journalTypes JSON,
  isEnabled BOOLEAN DEFAULT true,
  schoolId STRING, -- NULL for super admin prompts (all schools)
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Key Implementation Points

### **1. Role-Based Access Control**
```typescript
// In service layer
const admin = await JournalingAdminRepository.getAdminSchool(userId);
if (admin.role.name !== 'SUPER_ADMIN' && admin.schoolId !== query.schoolId) {
  throw new AuthError('Access denied. You can only manage your own school.', 403);
}
```

### **2. Configuration Caching**
- Configurations are cached per school for performance
- Cache invalidation on config updates
- Default config created if none exists for a school

### **3. Student-Facing Error Handling**
```typescript
// Clear, actionable error messages
if (!config?.enableWriting) {
  throw new AuthError('Writing journaling is disabled for your school', 403);
}
```

### **4. Admin UI Feedback**
```typescript
// Immediate feedback on setting changes
toast({
  title: value ? "Enabled" : "Disabled",
  description: `${journalType} journaling has been ${value ? "enabled" : "disabled"} for students.`
});
```

## 🚀 Testing the Flow

### **Admin Side**
1. Login as Super Admin → Should see all schools' settings
2. Login as School Admin → Should only see their school's settings
3. Toggle settings → Should save immediately and show success message
4. Try to access other schools' settings as admin → Should get 403 error

### **Student Side**
1. Login as student from school with writing enabled → Should see writing option
2. Try to create writing entry → Should work
3. Admin disables writing for that school
4. Student refreshes → Writing option should disappear
5. Try to access writing API directly → Should get 403 error

## 🔄 Real-time Updates (Future Enhancement)

For a complete real-time experience:
1. **WebSocket Integration**: Push config changes to connected students
2. **Client-side Caching**: Cache config in student app with TTL
3. **Optimistic Updates**: Update UI immediately, confirm with API

This flow ensures that admins have complete control over journaling features while students get a seamless experience that respects their school's configuration.
