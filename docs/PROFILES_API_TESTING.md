# Profiles API Testing Guide

This guide provides comprehensive testing instructions for Admin Profiles and Student Profiles APIs.

## 📋 Prerequisites

1. **Authentication Required**: All APIs require authentication cookies
2. **Role-Based Access**: Different endpoints require different roles
3. **Base URL**: `http://localhost:3000`

## 🔐 Authentication Setup

### Step 1: Login as SuperAdmin
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -c superadmin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@calmpath.ai",
    "password": "SuperAdmin@123"
  }'
```

### Step 2: Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -c admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@calmpath.ai", 
    "password": "Admin@123"
  }'
```

### Step 3: Login as Student
```bash
curl -X POST http://localhost:3000/api/auth/student-login \
  -c student-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU123456",
    "password": "Student@123"
  }'
```

---

## 👑 ADMIN PROFILES API (SuperAdmin Only)

### 1. Create Admin
```bash
curl -X POST http://localhost:3000/api/admins \
  -b superadmin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@school.edu",
    "password": "Admin@123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "schoolId": "school_123",
    "department": "Computer Science"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "admin_456",
    "email": "newadmin@school.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": { "name": "ADMIN" },
    "adminProfile": {
      "department": "Computer Science"
    },
    "school": {
      "id": "school_123",
      "name": "Lincoln High School"
    }
  }
}
```

### 2. List All Admins
```bash
curl -X GET http://localhost:3000/api/admins \
  -b superadmin-cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": [
    {
      "id": "admin_123",
      "email": "admin@calmpath.ai",
      "firstName": "Admin",
      "lastName": "User",
      "role": { "name": "ADMIN" },
      "adminProfile": {
        "department": "Psychology"
      },
      "school": {
        "id": "school_456",
        "name": "Lincoln High School"
      }
    }
  ]
}
```

### 3. Get Admin by ID
```bash
curl -X GET http://localhost:3000/api/admins/admin_123 \
  -b superadmin-cookies.txt
```

### 4. Update Admin
```bash
curl -X PUT http://localhost:3000/api/admins/admin_123 \
  -b superadmin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "department": "Updated Department",
    "profileImage": "https://example.com/image.jpg"
  }'
```

### 5. Update Admin Status
```bash
curl -X PATCH http://localhost:3000/api/admins/admin_123 \
  -b superadmin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUSPENDED"
  }'
```

### 6. Reset Admin Password
```bash
curl -X POST http://localhost:3000/api/admins/admin_123/reset-password \
  -b superadmin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPassword@123"
  }'
```

### 7. Delete Admin (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/admins/admin_123 \
  -b superadmin-cookies.txt
```

---

## 👥 STUDENT PROFILES API (Admin Only)

### 1. Generate Unique Student ID
```bash
curl -X POST http://localhost:3000/api/students/generate-id \
  -b admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "class_123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student ID generated successfully",
  "data": {
    "studentId": "STU789012"
  }
}
```

### 2. Create Student
```bash
curl -X POST http://localhost:3000/api/students \
  -b admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU789012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@school.edu",
    "phone": "+1234567890",
    "classId": "class_123",
    "schoolId": "school_456",
    "status": "ACTIVE"
  }'
```

**For SuperAdmin (can specify different school):**
```bash
curl -X POST http://localhost:3000/api/students \
  -b superadmin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU789012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@school.edu",
    "phone": "+1234567890",
    "classId": "class_123",
    "schoolId": "school_789",
    "status": "ACTIVE"
  }'
```

**For Admin (uses their assigned school):**
```bash
curl -X POST http://localhost:3000/api/students \
  -b admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU789012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@school.edu",
    "phone": "+1234567890",
    "classId": "class_123",
    "status": "ACTIVE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": "student_456",
    "studentId": "STU789012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@school.edu",
    "role": { "name": "STUDENT" },
    "studentProfile": {
      "status": "ACTIVE"
    },
    "school": {
      "id": "school_456",
      "name": "Lincoln High School"
    },
    "classRef": {
      "id": "class_123",
      "name": "Grade 10-A",
      "grade": 10,
      "section": "A"
    }
  }
}
```

### 3. List Students by School
```bash
curl -X GET http://localhost:3000/api/students \
  -b admin-cookies.txt
```

### 4. Get Student by ID
```bash
curl -X GET http://localhost:3000/api/students/student_456 \
  -b admin-cookies.txt
```

### 5. Update Student
```bash
curl -X PUT http://localhost:3000/api/students/student_456 \
  -b admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "email": "updated.email@school.edu",
    "classId": "class_456",
    "status": "ACTIVE"
  }'
```

### 6. Update Student Status
```bash
curl -X PATCH http://localhost:3000/api/students/student_456 \
  -b admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INACTIVE"
  }'
```

### 7. Reset Student Password
```bash
curl -X POST http://localhost:3000/api/students/student_456/reset-password \
  -b admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPassword@123"
  }'
```

### 8. Delete Student (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/students/student_456 \
  -b admin-cookies.txt
```

---

## 👤 STUDENT SELF-UPDATE API

### Update Student Profile (Student Only)
```bash
curl -X PUT http://localhost:3000/api/students/student_456/profile \
  -b student-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "profileImage": "https://example.com/new-profile.jpg"
  }'
```

---

## 🚫 ERROR RESPONSES

### Authentication Errors
```json
{
  "success": false,
  "error": {
    "code": 401,
    "message": "No session found"
  }
}
```

### Permission Errors
```json
{
  "success": false,
  "error": {
    "code": 403,
    "message": "Access denied"
  }
}
```

### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Email is required"
  }
}
```

### Conflict Errors
```json
{
  "success": false,
  "error": {
    "code": 409,
    "message": "Admin with this email already exists"
  }
}
```

### Not Found Errors
```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Admin not found"
  }
}
```

---

## 🔧 TESTING SCENARIOS

### ✅ Positive Test Cases
1. **SuperAdmin creates admin** with valid data
2. **Admin creates student** with auto-generated ID
3. **Student updates profile** with new image
4. **Admin resets student password**
5. **SuperAdmin updates admin status**

### ❌ Negative Test Cases
1. **Admin tries to create admin** (should fail - 403)
2. **Student tries to access admin APIs** (should fail - 403)
3. **Create admin with existing email** (should fail - 409)
4. **Create student with existing ID** (should fail - 409)
5. **Access APIs without authentication** (should fail - 401)

### 🔄 Edge Cases
1. **Update non-existent user** (should fail - 404)
2. **Invalid email format** (should fail - 400)
3. **Weak password** (should fail - 400)
4. **Empty required fields** (should fail - 400)
5. **Invalid status values** (should fail - 400)

---

## 📊 Data Validation Rules

### Admin Creation
- **Email**: Valid email format, unique
- **Password**: Min 8 chars, uppercase, lowercase, number
- **First/Last Name**: Min 2 characters
- **School ID**: Required, must exist
- **Department**: Optional

### Student Creation
- **Student ID**: Min 3 characters, unique
- **First/Last Name**: Min 2 characters
- **Email**: Valid format if provided, unique
- **Class ID**: Required, must exist
- **School ID**: Optional for SuperAdmin, ignored for Admin
- **Status**: ACTIVE, INACTIVE, SUSPENDED (default: ACTIVE)

---

## 🎯 Quick Test Commands

### Test All Admin APIs (SuperAdmin)
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/admin-login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@calmpath.ai", "password": "SuperAdmin@123"}'

# 2. Create admin
curl -X POST http://localhost:3000/api/admins \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email": "test@admin.com", "password": "Admin@123", "firstName": "Test", "lastName": "Admin", "schoolId": "school_123"}'

# 3. List admins
curl -X GET http://localhost:3000/api/admins -b cookies.txt

# 4. Get admin
curl -X GET http://localhost:3000/api/admins/admin_123 -b cookies.txt
```

### Test All Student APIs (Admin)
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/auth/admin-login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@calmpath.ai", "password": "Admin@123"}'

# 2. Generate student ID
curl -X POST http://localhost:3000/api/students/generate-id \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"classId": "class_123"}'

# 3. Create student
curl -X POST http://localhost:3000/api/students \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"studentId": "STU123456", "firstName": "Test", "lastName": "Student", "classId": "class_123"}'

# 4. List students
curl -X GET http://localhost:3000/api/students -b cookies.txt
```

---

## 📝 Notes

1. **Session Management**: Use `-c cookies.txt` to save cookies and `-b cookies.txt` to use them
2. **One Admin Per School**: Creating admin for school with existing admin will fail
3. **School Scoping**: Admins can only manage students in their assigned school
4. **Soft Delete**: Delete operations set status to INACTIVE, don't remove records
5. **Password Hashing**: All passwords are securely hashed before storage
6. **Auto-Generation**: Student IDs and passwords are auto-generated if not provided

## 🐛 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check login credentials and cookie usage
2. **403 Forbidden**: Verify user role has required permissions
3. **409 Conflict**: Check for duplicate emails/IDs
4. **400 Bad Request**: Validate request body format and required fields

### Debug Tips
1. **Check cookies**: Ensure cookies are being saved and loaded correctly
2. **Verify roles**: Use `/api/auth/me` to check current user role
3. **Validate data**: Ensure all required fields are present and valid
4. **Check permissions**: Verify user has required permissions for endpoint
