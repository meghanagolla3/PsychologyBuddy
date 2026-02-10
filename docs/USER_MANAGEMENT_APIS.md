# 📋 User Management APIs Documentation

## 🎯 Overview

This document explains the complete User Management API system with Role-Based Access Control (RBAC) enforcement. The system ensures proper data isolation and security boundaries between SuperAdmins, Admins, and Students.

---

## 🔐 Authentication & Authorization

### Session-Based Authentication
- **No JWTs** - Secure HTTP-only cookies
- **7-day expiration** with automatic cleanup
- **Cross-site protection** with SameSite policies

### RBAC Enforcement
- **Permission middleware** wraps all protected endpoints
- **Role hierarchy**: SuperAdmin > Admin > Student
- **School scoping**: Admins limited to their assigned school
- **Self-access only**: Students can only access own data

---

## 🛡️ Security Boundaries

### 🏢 SuperAdmin (System Owner)
- ✅ **Full platform access**
- ✅ **Manage all schools**
- ✅ **Create/manage admins**
- ✅ **System-wide permissions**

### 👨‍💼 Admin (School Manager)  
- ✅ **School-scoped access only**
- ✅ **Manage students in their school**
- ✅ **Manage classes in their school**
- ❌ **Cannot access other schools**
- ❌ **Cannot manage system permissions**

### 👨‍🎓 Student (End User)
- ✅ **Access own profile only**
- ✅ **Use self-help tools**
- ✅ **View educational content**
- ❌ **Cannot access other students**
- ❌ **Cannot manage any users**

---

## 📊 API Endpoints

### 🔵 Authentication APIs
```
POST   /api/auth/student-login    Student login (studentId + password)
POST   /api/auth/admin-login       Admin login (email + password)
POST   /api/auth/logout           Logout (clears session)
GET    /api/auth/me              Current user info
```

### 👤 User Identity APIs
```
GET    /api/user/me              Get current user profile
PATCH  /api/user/update-profile   Update own profile (role-based limits)
```

### 🏫 SuperAdmin School Management
```
GET    /api/schools              List all schools (platform-wide)
POST   /api/schools              Create new school
GET    /api/schools/[id]          Get school details
PATCH  /api/schools/[id]          Update school information
```
**Required Permissions:**
- `organizations.view` for GET operations
- `organizations.create` for POST operations  
- `organizations.update` for PATCH operations

### 👨‍💼 SuperAdmin Admin Management
```
GET    /api/admins                List all admins (platform-wide)
POST   /api/admins                Create new admin account
PATCH  /api/admins/[id]            Update admin details
```
**Required Permissions:**
- `users.view` for GET operations
- `users.create` for POST operations
- `users.update` for PATCH operations

### 🎓 Admin Student Management (School-Scoped)
```
GET    /api/students              List students (admin's school only)
POST   /api/students              Create new student
GET    /api/students/[id]          Get student details
PATCH  /api/students/[id]          Update student information
```
**Required Permissions:**
- `users.view` for GET operations
- `users.create` for POST operations
- `users.update` for PATCH operations

**Security Features:**
- Automatic school scoping: `WHERE schoolId = adminSchoolId`
- Forbidden cross-school access attempts

### 📚 Admin Classes Management (School-Scoped)
```
GET    /api/classes               List classes (admin's school only)
POST   /api/classes               Create new class
PATCH  /api/classes/[id]           Update class information
```
**Required Permissions:**
- `users.update` (class management falls under user management)

**Security Features:**
- School-scoped operations only
- Grade/section organization support

### 👨‍🎓 Student Profile APIs (Self-Only)
```
GET    /api/user/profile/[id]      View student profile
PATCH  /api/user/profile/[id]      Update student profile
```
**Security Features:**
- Self-access only: `if (profileUserId !== currentUserId) → 403`
- Limited field updates for students

---

## 🔒 Implementation Examples

### Creating a School (SuperAdmin)
```bash
curl -X POST http://localhost:3000/api/schools \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your_session_id" \
  -d '{
    "name": "Lincoln High School",
    "address": "123 Education Blvd",
    "phone": "+1-555-0123",
    "email": "admin@lincoln.edu"
  }'
```

### Creating a Student (Admin)
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your_session_id" \
  -d '{
    "studentId": "STU2024001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "password": "SecurePass123!",
    "classId": "class_123"
  }'
```

### Updating Student Profile (Student)
```bash
curl -X PATCH http://localhost:3000/api/user/profile/student_123 \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your_session_id" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Williams",
    "phone": "+1-555-0123"
  }'
```

---

## 🛡️ Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "No session provided",
  "error": { "code": 401, "type": "AuthError" }
}
```

### Permission Errors
```json
{
  "success": false,
  "message": "Forbidden: Missing permission 'users.create'",
  "requiredPermission": "users.create",
  "userRole": "STUDENT",
  "error": { "code": 403, "type": "AuthError" }
}
```

### School Scoping Errors
```json
{
  "success": false,
  "message": "Cannot update student from another school",
  "error": { "code": 403, "type": "AuthError" }
}
```

---

## 📋 Data Models

### User Response
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "user_123",
    "email": "admin@school.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "name": "ADMIN",
      "id": "role_456"
    },
    "school": {
      "id": "school_789",
      "name": "Lincoln High School"
    },
    "adminProfile": {
      "department": "Student Wellness"
    }
  }
}
```

### Student List Response
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "id": "student_123",
      "studentId": "STU2024001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "classRef": {
        "name": "Class 10-A",
        "grade": 10,
        "section": "A"
      },
      "studentProfile": {
        "status": "ACTIVE"
      }
    }
  ]
}
```

---

## 🧪 Testing Guide

### 📋 Prerequisites for Testing

1. **Database Setup**
```bash
# Run database migrations
npx prisma migrate dev

# Seed initial data (roles, permissions, test users)
npx prisma db seed
```

2. **Environment Variables**
```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/psychology_buddy"
NEXTAUTH_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"
```

3. **Start Development Server**
```bash
npm run dev
# Server runs on http://localhost:3000
```

---

### 🔐 Authentication Testing

#### 1. SuperAdmin Login
```bash
# Login as SuperAdmin
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "superadmin@calmpath.ai",
    "password": "SuperAdmin@123"
  }'

# Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_123",
      "email": "superadmin@calmpath.ai",
      "role": { "name": "SUPERADMIN" }
    }
  }
}
```

#### 2. Admin Login
```bash
# Login as Admin
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{
    "email": "admin@calmpath.ai",
    "password": "Admin@123"
  }'
```

#### 3. Student Login
```bash
# Login as Student
curl -X POST http://localhost:3000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -c student_cookies.txt \
  -d '{
    "studentId": "STU2024001",
    "password": "Student@123"
  }'
```

#### 4. Verify Session
```bash
# Check current user
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

### 🏫 School Management Testing (SuperAdmin Only)

#### 1. Create School
```bash
curl -X POST http://localhost:3000/api/schools \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test High School",
    "address": "123 Test Street",
    "phone": "+1-555-0123",
    "email": "test@school.edu"
  }'

# Expected Response
{
  "success": true,
  "message": "School created successfully",
  "data": {
    "id": "SCH-THS-456789-ABC",
    "name": "Test High School",
    "address": "123 Test Street",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}

# Error Response (Duplicate Email)
{
  "success": false,
  "message": "School with this email already exists",
  "error": {
    "code": 409,
    "type": "AuthError"
  }
}
```

**Notes:**
- Email validation prevents duplicate school emails
- School IDs follow format: `SCH-ABC-TIMESTAMP-CODE`
- Email is optional but must be unique if provided

#### 2. List All Schools
```bash
curl -X GET http://localhost:3000/api/schools \
  -b cookies.txt

# Expected Response
{
  "success": true,
  "message": "Schools retrieved successfully",
  "data": [
    {
      "id": "school_456",
      "name": "Test High School",
      "_count": { "users": 5, "classes": 3 }
    }
  ]
}
```

#### 3. Update School
```bash
curl -X PATCH http://localhost:3000/api/schools/school_456 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Updated School Name",
    "phone": "+1-555-9999"
  }'
```

---

### 👨‍💼 Admin Management Testing (SuperAdmin Only)

#### 1. Create Admin
```bash
curl -X POST http://localhost:3000/api/admins \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "email": "newadmin@testschool.edu",
    "password": "Admin@123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0123",
    "schoolId": "school_456",
    "department": "Student Counseling"
  }'

# Expected Response - Success
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "admin_789",
    "email": "newadmin@testschool.edu",
    "role": { "name": "ADMIN" },
    "school": { "id": "school_456", "name": "Test School" }
  }
}

# Expected Response - School Already Has Admin
{
  "success": false,
  "error": {
    "code": 409,
    "message": "School already has an admin assigned"
  }
}

# Expected Response - Email Already Exists
{
  "success": false,
  "error": {
    "code": 409,
    "message": "Admin with this email already exists"
  }
}
```

#### 2. List All Admins
```bash
curl -X GET http://localhost:3000/api/admins \
  -b cookies.txt
```

---

### 🎓 Student Management Testing (Admin Only)

#### 1. Create Class First

**For Admin users (creates class in their assigned school):**
```bash
curl -X POST http://localhost:3000/api/classes \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "name": "Class 10-A",
    "grade": 10,
    "section": "A"
  }'
```

**For SuperAdmin users (must specify schoolId):**
```bash
curl -X POST http://localhost:3000/api/classes \
  -H "Content-Type: application/json" \
  -b superadmin_cookies.txt \
  -d '{
    "name": "Class 10-A",
    "grade": 10,
    "section": "A",
    "schoolId": "your_school_id_here"
  }'
```

**Get available schools (to find schoolId):**
```bash
curl -X GET http://localhost:3000/api/schools \
  -b superadmin_cookies.txt
```

#### 2. Create Student

**For Admin users (creates student in their assigned school):**
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "studentId": "STU2024002",
    "firstName": "Alice",
    "lastName": "Smith",
    "password": "Student@123",
    "email": "alice.smith@school.edu",
    "classId": "class_123"
  }'
```

**For SuperAdmin users (must specify schoolId):**
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -b superadmin_cookies.txt \
  -d '{
    "studentId": "STU2024002",
    "firstName": "Alice",
    "lastName": "Smith",
    "password": "Student@123",
    "email": "alice.smith@school.edu",
    "schoolId": "your_school_id_here",
    "classId": "class_123"
  }'
```

**Note:** 
- `email` is optional - if not provided, it will be auto-generated as `{studentId}@student.local`
- `classId` is optional - student can be created without being assigned to a class
- `phone` is optional

# Expected Response
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": "student_456",
    "studentId": "STU2024002",
    "firstName": "Alice",
    "role": { "name": "STUDENT" },
    "classRef": { "name": "Class 10-A", "grade": 10 }
  }
}
```

#### 3. List Students (Admin View)
```bash
curl -X GET http://localhost:3000/api/students \
  -b admin_cookies.txt

# With filters
curl -X GET "http://localhost:3000/api/students?classId=class_123&search=Alice" \
  -b admin_cookies.txt
```

#### 4. Update Student
```bash
curl -X PATCH http://localhost:3000/api/students/student_456 \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "status": "ACTIVE"
  }'
```

---

### 👨‍🎓 Student Profile Testing

#### 1. Get Your Own Profile (Student or Admin)
```bash
curl -X GET http://localhost:3000/api/user/me \
  -b student_cookies.txt

# Expected Response (for Student)
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "student_456",
    "studentId": "STU2024002",
    "firstName": "Alice",
    "lastName": "Smith",
    "role": { "name": "STUDENT" },
    "school": { "name": "Test High School" },
    "classRef": { "name": "Class 10-A" }
  }
}
```

#### 2. Get Specific Student Profile (Admin/SuperAdmin only)
```bash
curl -X GET http://localhost:3000/api/students/student_456 \
  -b admin_cookies.txt

# Expected Response
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "id": "student_456",
    "studentId": "STU2024002",
    "firstName": "Alice",
    "lastName": "Smith",
    "role": { "name": "STUDENT" },
    "school": { "name": "Test High School" },
    "classRef": { "name": "Class 10-A" }
  }
}
```

#### 3. Update Student Profile (Self only)
```bash
curl -X PATCH http://localhost:3000/api/user/update-profile \
  -H "Content-Type: application/json" \
  -b student_cookies.txt \
  -d '{
    "firstName": "Alice",
    "lastName": "Williams",
    "phone": "+1-555-9999"
  }'
```

---

### � Security Testing

#### 1. Test Permission Violations
```bash
# Try to access admin endpoint as student (should fail)
curl -X GET http://localhost:3000/api/students \
  -b student_cookies.txt

# Expected Response
{
  "success": false,
  "message": "Forbidden: Missing permission 'users.view'",
  "requiredPermission": "users.view",
  "userRole": "STUDENT"
}
```

#### 2. Test Cross-School Access
```bash
# Try to access other school's data (should fail)
curl -X GET http://localhost:3000/api/students/school_other_student_id \
  -b admin_cookies.txt

# Expected Response
{
  "success": false,
  "message": "Cannot view student from another school"
}
```

#### 3. Test Self-Only Access
```bash
# Try to access other student's profile (should fail)
curl -X GET http://localhost:3000/api/user/profile/other_student_id \
  -b student_cookies.txt

# Expected Response
{
  "success": false,
  "message": "Cannot access other student profiles"
}
```

---

### 🔍 Debugging Tips

#### 1. Check Session Status
```bash
# Always verify session is valid
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

#### 2. Verify Permissions
```bash
# Check if user has required permission
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt | jq '.data.user.role.name'
```

#### 3. Enable Debug Logging
```bash
# Add to .env.local for development
DEBUG=true
LOG_LEVEL=debug
```

---

### 📱 Frontend Integration Examples

#### React Component Example
```tsx
import { useState } from 'react';
import { useUserPermissions } from '@/src/hooks/useUserPermissions';

function StudentManagement() {
  const { canCreate, canView } = useUserPermissions();
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    const response = await fetch('/api/students', {
      credentials: 'include', // Important for cookies
    });
    const data = await response.json();
    setStudents(data.data);
  };

  const createStudent = async (studentData) => {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(studentData),
    });
    return response.json();
  };

  return (
    <div>
      {canView('USER_MANAGEMENT') && (
        <button onClick={fetchStudents}>View Students</button>
      )}
      {canCreate('USER_MANAGEMENT') && (
        <CreateStudentForm onSubmit={createStudent} />
      )}
    </div>
  );
}
```

#### Error Handling Example
```tsx
import { Protected } from '@/src/components/Protected';

function AdminDashboard() {
  return (
    <Protected role={['ADMIN', 'SUPERADMIN']}>
      <div>
        <h1>Admin Dashboard</h1>
        <CanCreate module="USER_MANAGEMENT">
          <CreateUserButton />
        </CanCreate>
      </div>
    </Protected>
  );
}
```

---

### 🧪 Automated Testing Setup

#### Jest Test Example
```typescript
// __tests__/api/students.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/students/route';

describe('/api/students', () => {
  test('POST creates student with admin permissions', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        studentId: 'TEST001',
        firstName: 'Test',
        lastName: 'Student',
        password: 'Test@123',
      },
      headers: {
        cookie: 'sessionId=test_session_id',
      },
    });

    const response = await POST(req as any, { 
      user: { role: { name: 'ADMIN' }, schoolId: 'school_123' },
      userSchoolId: 'school_123'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

---

## 🎯 Testing Checklist

### ✅ Before Testing
- [ ] Database is running and migrated
- [ ] Seed script executed successfully
- [ ] Environment variables configured
- [ ] Development server started

### ✅ Authentication Tests
- [ ] SuperAdmin login works
- [ ] Admin login works  
- [ ] Student login works
- [ ] Session validation works
- [ ] Logout clears session

### ✅ Permission Tests
- [ ] SuperAdmin can access all endpoints
- [ ] Admin can only access school-scoped data
- [ ] Student can only access own profile
- [ ] Permission violations return 403
- [ ] Invalid sessions return 401

### ✅ Data Integrity Tests
- [ ] School scoping prevents cross-school access
- [ ] Student self-only access enforced
- [ ] Admin cannot manage other schools
- [ ] Data validation works correctly

### ✅ Error Handling Tests
- [ ] Invalid input returns 400
- [ ] Missing permissions return 403
- [ ] Not found resources return 404
- [ ] Server errors return 500

This comprehensive testing guide ensures your API system works correctly and maintains security boundaries! 🚀

### Multi-Layer Protection
1. **Session Validation** - Every request checks valid session
2. **Permission Checking** - RBAC middleware enforces module/action access
3. **Data Scoping** - Admins limited to their school, students to self
4. **Role Enforcement** - Strict role hierarchy maintained

### Privacy & Safety
- **No public registration** - All users created by authorized staff
- **Data isolation** - Schools cannot see other schools' data
- **Student privacy** - Students cannot access each other's information
- **Audit trail** - All actions logged with timestamps

### Input Validation
- **Zod schemas** for all request validation
- **SQL injection prevention** via Prisma ORM
- **Type safety** throughout the system

---

## 🎯 Usage Guidelines

### For Frontend Developers
1. **Always include session cookie** in API requests
2. **Handle 401/403 responses** gracefully with user-friendly messages
3. **Use permission hooks** (`useUserPermissions`, `useRole`) for UI gating
4. **Implement role-based navigation** using `<Protected>` components

### For API Consumers
1. **Check authentication status** before calling protected APIs
2. **Handle permission errors** by showing appropriate UI alternatives
3. **Use proper HTTP methods** (GET for read, POST for create, PATCH for update)
4. **Implement retry logic** for network failures

This API system provides **enterprise-grade security** with proper role-based access control, data isolation, and privacy protection - perfect for educational institutions managing student wellness and mental health resources.
