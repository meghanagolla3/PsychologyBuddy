# Psychology Buddy - Mental Health Platform

A comprehensive mental health and wellness platform for educational institutions, providing students with AI-powered psychological support while giving administrators oversight and management capabilities.

## 🏗️ Technology Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with secure cookie-based session management
- **UI**: Tailwind CSS with Radix UI components
- **AI Integration**: Multiple AI providers (OpenAI, Google, Groq)
- **Language**: TypeScript

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Authentication System

Psychology Buddy implements a comprehensive authentication system with role-based access control, secure cookie management, and multiple authentication providers.

### 📁 Authentication File Structure

#### **API Routes** (`app/api/auth/`)
| File | Purpose | Description |
|------|---------|-------------|
| `login/route.ts` | Admin/Staff Login | Handles email/password authentication for admin users |
| `student-login/route.ts` | Student Login | Handles student ID/password authentication |
| `register/route.ts` | Student Registration | Creates new student accounts with email verification |
| `admin-register/route.ts` | Admin Registration | Creates new admin accounts with OTP verification |
| `google/route.ts` | Google OAuth | Initiates Google authentication flow |
| `callback/route.ts` | OAuth Callback | Handles Google OAuth callback and user creation |
| `me/route.ts` | Current User | Returns authenticated user data with permissions |
| `logout/route.ts` | Logout | Clears authentication cookies and ends session |
| `forgot-password/route.ts` | Password Reset | Sends OTP to user email for password reset |
| `verify-reset-otp/route.ts` | OTP Verification | Verifies password reset OTP |
| `reset-password/route.ts` | Password Update | Updates password with valid reset token |
| `verify-email/route.ts` | Email Verification | Verifies email using OTP |
| `verify-otp/route.ts` | General OTP | Handles general OTP verification |

#### **Authentication Pages** (`app/(auth)/`)
| File | Purpose | Description |
|------|---------|-------------|
| `login/page.tsx` | Login Page | Admin/staff login interface |
| `student-login/page.tsx` | Student Login | Student login interface |
| `admin-register/page.tsx` | Admin Registration | New admin registration form |
| `forgot-password/page.tsx` | Password Reset | Password reset request form |
| `reset-password/page.tsx` | Password Update | New password form with token |
| `verify-email/page.tsx` | Email Verification | Email verification with OTP |
| `verify-otp/page.tsx` | OTP Verification | General OTP verification page |

#### **Core Authentication Library** (`src/lib/auth/`)
| File | Purpose | Description |
|------|---------|-------------|
| `auth-cookie-manager.ts` | Cookie Management | **CORE**: Manages JWT tokens in secure HTTP-only cookies |
| `auth-service.ts` | Auth Service | Server-side authentication business logic |
| `auth-middleware.ts` | Route Protection | Middleware for protecting API routes |
| `rbac-middleware.ts` | Role-Based Access | **CORE**: Implements role-based access control |
| `auth-utils.ts` | Utility Functions | Helper functions for authentication |
| `google-auth.ts` | Google OAuth | Google authentication implementation |
| `get-current-user.ts` | User Retrieval | Gets current user from request |
| `index.ts` | Barrel Export | Exports all auth utilities |

#### **Authentication Services** (`src/services/auth/`)
| File | Purpose | Description |
|------|---------|-------------|
| `authService.ts` | **MAIN SERVICE** | **CORE**: All authentication business logic and database operations |
| `clientAuthService.ts` | Client Auth | Client-side authentication utilities |
| `emailService.ts` | Email Service | Handles verification and password reset emails |

#### **Authentication Context & State Management** (`src/contexts/`)
| File | Purpose | Description |
|------|---------|-------------|
| `AuthContext.tsx` | **GLOBAL AUTH STATE** | **CORE**: Provides centralized authentication state across entire application |

#### **Authentication Hooks** (`src/hooks/auth/`)
| File | Purpose | Description |
|------|---------|-------------|
| `useAuth.ts` | **MAIN HOOK** | **CORE**: Primary authentication state management |
| `useLoginAuth.ts` | Login Logic | Handles login form state and submission |
| `useStudentLoginAuth.ts` | Student Login | Specific student login logic |
| `useAdminRegistrationAuth.ts` | Admin Registration | Admin registration form handling |
| `useEmailVerification.ts` | Email Verification | Email verification with OTP |
| `useForgotPassword.ts` | Password Reset | Password reset flow management |
| `usePasswordReset.ts` | Password Update | Password update with token |
| `useRegistrationForm.ts` | Registration Form | General registration form logic |
| `types.ts` | Type Definitions | TypeScript types for authentication |
| `index.ts` | Barrel Export | Exports all auth hooks |

#### **Authentication Components** (`components/auth/`)
| File | Purpose | Description |
|------|---------|-------------|
| `LoginPage.tsx` | Login Component | Admin/staff login form component |
| `StudentLoginPage.tsx` | Student Login | Student login form component |
| `AdminRegistrationPage.tsx` | Admin Registration | Admin registration form component |
| `EmailVerificationPage.tsx` | Email Verification | Email verification interface |
| `ForgotPasswordPage.tsx` | Password Reset | Password reset request component |
| `ResetPassword.tsx` | Password Update | Password update form component |
| `VerifyPage.tsx` | OTP Verification | General OTP verification component |

#### **Configuration & Types**
| File | Purpose | Description |
|------|---------|-------------|
| `src/config/rbac.ts` | **RBAC Config** | **CORE**: Role-based access control configuration |
| `src/config/constants.ts` | Constants | Authentication constants and configuration |
| `src/schemas/auth.ts` | Validation Schemas | Zod schemas for auth data validation |
| `src/hooks/useRBAC.ts` | **RBAC Hook** | **CORE**: Role-based access control for components |
| `src/utils/auth-utils.ts` | Auth Utilities | Utility functions for authentication |

### 🔑 Why AuthContext is Critical

The **AuthContext** is the **heart of our authentication system** - it provides centralized state management across the entire application:

#### **🎯 Core Purpose:**
- **Global State**: Single source of truth for user authentication
- **Session Persistence**: Maintains login state across page refreshes
- **Automatic Refresh**: Refreshes user data on app load
- **Cross-Component Access**: Any component can access auth state

#### **🔐 How It Works:**
```typescript
// 1. Provider wraps entire app
<AuthProvider>
  <App />
</AuthProvider>

// 2. Any component can access auth
const { user, isAuthenticated, login, logout } = useAuth();

// 3. Login updates global state
login(userData); // Updates context for all components

// 4. Logout clears global state  
logout(); // Clears context, redirects to login
```

#### **📱 Benefits:**
- **No Prop Drilling**: Auth state available everywhere without passing props
- **Automatic Sync**: All components update when auth state changes
- **Session Recovery**: Automatically refreshes user data on page load
- **Type Safety**: Full TypeScript support for auth data

### 📍 Why `/api/auth/me` Route is Essential

The **`/api/auth/me`** route is the **bridge between frontend and backend authentication**:

#### **🎯 Core Purpose:**
- **Current User Detection**: Returns authenticated user data from session
- **Permission Verification**: Provides user role and permissions
- **Session Validation**: Validates if user session is still valid
- **UI Adaptation**: Enables role-based UI rendering

#### **🔄 How It Works:**
```typescript
// 1. Frontend calls API
const response = await fetch('/api/auth/me');

// 2. Backend validates session cookie
const session = await getSessionFromCookie(req);

// 3. Returns user data with permissions
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "admin@school.edu",
      "role": { "name": "ADMIN" },
      "school": { "id": "school_456", "name": "Lincoln High" }
    }
  }
}
```

#### **🎨 Use Cases:**
- **Dashboard Loading**: Get current user for personalized dashboard
- **Permission Checking**: Determine what UI elements to show
- **Route Protection**: Validate user can access protected routes
- **Profile Display**: Show user info in header/components
- **Role-Based Features**: Enable/disable features based on role

#### **🛡️ Security Benefits:**
- **Server-Side Validation**: Never trust client-side auth state
- **Session Verification**: Validates session on every request
- **Permission Enforcement**: Returns actual permissions from database
- **Automatic Logout**: Returns error if session expired/invalid

### 🔑 Authentication Flow

1. **Registration**
   - User fills registration form
   - Account created in database with `emailVerified: false`
   - OTP sent to user email
   - User verifies email → `emailVerified: true` + auto-login

2. **Login**
   - User submits credentials
   - `AuthService` validates against database
   - `AuthCookieManager` creates secure JWT cookies
   - User redirected to appropriate dashboard

3. **Session Management**
   - `auth-token` cookie (24h, HttpOnly) - Main authentication
   - `refresh-token` cookie (7d, HttpOnly) - Session renewal
   - `user-role` cookie (24h, client-accessible) - UI role checks

4. **Authorization**
   - `useRBAC` hook provides permission checking
   - `rbac-middleware` protects API routes
   - Role hierarchy: STUDENT → ADMIN → SUPERADMIN

5. **State Management**
   - **AuthContext** provides global auth state across entire app
   - **`/api/auth/me`** route validates session and returns current user
   - Components use `useAuth()` hook to access auth state anywhere

### 🛡️ Security Features

- **Secure Cookies**: HttpOnly, Secure, SameSite=Strict
- **JWT Tokens**: 24-hour access, 7-day refresh
- **Password Security**: bcrypt hashing with 10 salt rounds
- **OTP Verification**: 6-digit codes, 15-minute expiry
- **Role-Based Access**: Granular permissions system
- **CSRF Protection**: SameSite cookie attributes
- **XSS Prevention**: HttpOnly authentication cookies

### 🎭 User Roles & Permissions

| Role | Level | Access Areas | Key Permissions |
|------|-------|--------------|----------------|
| **STUDENT** | 1 | `/students/*` | Chat access, profile edit, own reflections |
| **ADMIN** | 2 | `/admin/*`, `/students/*` | User management, analytics, school admin |
| **SUPERADMIN** | 3 | All routes | Full system access, school management |

### 🔧 Environment Variables

Required for authentication:

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 📊 Database Schema

Key authentication tables:
- `Users` - Unified user table with roles
- `Admins` - Admin-specific data
- `Students` - Student-specific data
- `EmailVerificationOTP` - Email verification codes
- `PasswordResetOTP` - Password reset codes

## 🎯 Features

### For Students
- AI-powered chat therapy sessions
- Mood tracking and reflection tools
- Personalized wellness insights
- Secure account management

### For Administrators
- Student oversight and analytics
- School and class management
- Mental health trend analysis
- User account management

### For Super Admins
- Multi-school management
- System configuration
- Full administrative control

## 📚 Documentation

- [Authentication System Guide](./docs/psychology-buddy-authentication-guide.md)
- [Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md)
- [API Documentation](./docs/AUTHENTICATION_SYSTEM.md)

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
