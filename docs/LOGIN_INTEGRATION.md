# 🔐 Login Integration Guide

## 📋 Overview

This document explains how the authentication APIs have been integrated with the existing login pages. The system now uses our new backend APIs with proper RBAC enforcement and session management.

---

## 🏗️ Architecture Overview

### **Authentication Flow**
```
User Input → Login Hook → API Call → Session Creation → AuthContext Update → Dashboard Redirect
```

### **Components Created**
1. **AuthContext** - Global authentication state management
2. **useAdminLogin** - Admin login hook with email/password
3. **useStudentLogin** - Student login hook with studentId/password
4. **Updated Login Pages** - Integrated with new authentication system

---

## 🔧 Files Modified/Created

### **New Files**
```
src/contexts/AuthContext.tsx          # Global auth state management
src/hooks/auth/useAdminLogin.ts      # Admin login logic
src/hooks/auth/useStudentLogin.ts    # Student login logic
```

### **Updated Files**
```
components/auth/LoginPage.tsx        # Admin login page integration
components/auth/StudentLoginPage.tsx  # Student login page integration
```

---

## 🚀 How It Works

### **1. Admin Login Flow**
```typescript
// 1. User enters email/password
// 2. useAdminLogin hook validates input
// 3. Calls POST /api/auth/admin-login
// 4. Backend validates credentials and creates session
// 5. AuthContext updates user state
// 6. Redirects to appropriate dashboard
```

### **2. Student Login Flow**
```typescript
// 1. User enters studentId/password
// 2. useStudentLogin hook validates input
// 3. Calls POST /api/auth/student-login
// 4. Backend validates credentials and creates session
// 5. AuthContext updates user state
// 6. Redirects to student dashboard
```

---

## 📱 Login Pages Features

### **Admin Login Page** (`/login`)
- ✅ Email and password authentication
- ✅ Form validation (email format, required fields)
- ✅ Loading states and error handling
- ✅ Success messages with redirect
- ✅ Role-based redirection (SuperAdmin → /superadmin/dashboard, Admin → /admin/dashboard)
- ✅ Google sign-in placeholder (shows not implemented message)

### **Student Login Page** (`/student-login`)
- ✅ Student ID and password authentication
- ✅ Form validation (studentId length, required fields)
- ✅ Loading states and error handling
- ✅ Success messages with redirect
- ✅ Redirects to `/student/dashboard`
- ✅ Help text for students without credentials

---

## 🔐 Security Features

### **Input Validation**
- **Email format validation** for admin login
- **Student ID length validation** (minimum 3 characters)
- **Required field validation** for all forms
- **Real-time error clearing** when user types

### **Error Handling**
- **Network error handling** with user-friendly messages
- **API error responses** displayed to users
- **Loading states** to prevent duplicate submissions
- **Success feedback** before redirect

### **Session Management**
- **HTTP-only cookies** for secure session storage
- **Automatic session refresh** on page load
- **Global auth state** via React Context
- **Automatic logout** on session expiration

---

## 🎯 Usage Examples

### **Using Admin Login Hook**
```typescript
import { useAdminLogin } from '@/src/hooks/auth/useAdminLogin';

function AdminLoginForm() {
  const {
    formData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
  } = useAdminLogin();

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
      />
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### **Using Auth Context**
```typescript
import { useAuth } from '@/src/contexts/AuthContext';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Role: {user.role.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🔄 Integration Steps

### **1. Setup AuthProvider**
```typescript
// app/layout.tsx
import { AuthProvider } from '@/src/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### **2. Use Login Hooks**
```typescript
// In your login components
import { useAdminLogin } from '@/src/hooks/auth/useAdminLogin';
import { useStudentLogin } from '@/src/hooks/auth/useStudentLogin';
```

### **3. Access Auth State**
```typescript
// In any component
import { useAuth } from '@/src/contexts/AuthContext';

const { user, isAuthenticated, logout } = useAuth();
```

---

## 🎨 UI Components Integration

### **LoginForm Component** (Admin)
- ✅ Email field with validation
- ✅ Password field with toggle visibility
- ✅ Remember me checkbox (disabled for now)
- ✅ Forgot password link
- ✅ Google sign-in button (placeholder)
- ✅ Student login redirect link

### **StudentLoginForm Component**
- ✅ Student ID field with validation
- ✅ Password field with toggle visibility
- ✅ Loading spinner during submission
- ✅ Help text for students
- ✅ Admin login redirect link

---

## 🚀 Testing the Integration

### **1. Test Admin Login**
```bash
# Navigate to /login
# Use seeded admin credentials:
# Email: admin@calmpath.ai
# Password: Admin@123
```

### **2. Test Student Login**
```bash
# Navigate to /student-login
# Use seeded student credentials:
# Student ID: STU001
# Password: Student@123
```

### **3. Verify Session Persistence**
```bash
# After login, refresh the page
# User should remain logged in
# Check browser cookies for sessionId
```

---

## 📋 Next Steps

### **Completed ✅**
- [x] Authentication API integration
- [x] Login hooks implementation
- [x] AuthContext for global state
- [x] Login page updates
- [x] Form validation and error handling
- [x] Role-based redirection

### **Future Enhancements 🔄**
- [ ] Google OAuth integration
- [ ] Remember me functionality
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Login attempt rate limiting
- [ ] Session timeout warnings

---

## 🛠️ Troubleshooting

### **Common Issues**

**1. Login Not Working**
- Check if backend server is running
- Verify database is seeded with test users
- Check browser console for API errors

**2. Session Not Persisting**
- Verify cookies are being set
- Check cookie domain settings
- Ensure AuthProvider wraps the app

**3. Redirect Not Working**
- Check if dashboard routes exist
- Verify role-based redirect logic
- Check for navigation errors

### **Debug Tips**
```typescript
// Enable debug logging
console.log('Login attempt:', formData);
console.log('API response:', data);
console.log('Auth context state:', user);
```

This integration provides a **complete authentication system** with proper security, validation, and user experience! 🚀
