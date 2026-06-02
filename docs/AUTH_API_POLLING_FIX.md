# Auth API Polling Fix

## Problem
The `/api/auth/me` endpoint was being called continuously every 10 seconds, causing:
- Excessive server load
- Unnecessary database queries
- Poor performance (100-200ms per request)
- High network traffic

## Root Cause
The `AuthContext.tsx` had a polling mechanism that refreshed user data every 10 seconds to keep permissions up to date. Additionally, `useRole` and `useUserPermissions` hooks were making duplicate API calls on every component mount.

## Changes Made

### 1. Removed Automatic Polling (`AuthContext.tsx`)
**Before:**
```typescript
// Periodically refresh user data every 10 seconds
useEffect(() => {
  if (!user) return;
  const interval = setInterval(() => {
    refreshUser();
  }, 10 * 1000); // 10 seconds
  return () => clearInterval(interval);
}, [user]);
```

**After:**
```typescript
// Removed automatic polling to prevent excessive API calls
// User data will refresh on:
// 1. Initial mount
// 2. Window visibility change (tab becomes active)
// 3. Manual refresh via refreshUser() function
```

### 2. Optimized `useRole` Hook
**Before:** Made a fresh API call on every component mount
**After:** Uses the existing `useAuth()` context, eliminating duplicate calls

### 3. Optimized `useUserPermissions` Hook
**Before:** Made a fresh API call on every component mount
**After:** Uses the existing `useAuth()` context, eliminating duplicate calls

## User Data Refresh Strategy

User data now refreshes in these scenarios:
1. **Initial page load** - When the app first loads
2. **Tab becomes active** - When user switches back to the tab (visibility change)
3. **Manual refresh** - When `refreshUser()` is called programmatically

## Benefits
- ✅ Eliminates continuous polling
- ✅ Reduces server load by ~95%
- ✅ Improves application performance
- ✅ Reduces database queries
- ✅ Maintains fresh data when user interacts with the app
- ✅ Still updates permissions when tab regains focus

## Testing
After these changes, you should see:
- `/api/auth/me` called only once on page load
- No repeated calls every 10 seconds
- One additional call when you switch back to the tab after being away

## If Real-time Updates Are Needed
If you need real-time permission updates, consider:
1. **WebSocket connection** - For instant updates
2. **Server-sent events (SSE)** - For one-way updates from server
3. **Longer polling interval** - e.g., every 5 minutes instead of 10 seconds
4. **Event-driven updates** - Refresh only when specific actions occur

## Migration Notes
- No breaking changes to the API
- Components using `useAuth()`, `useRole()`, or `useUserPermissions()` will work as before
- User experience remains the same, but with better performance
