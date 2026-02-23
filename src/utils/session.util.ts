import { nanoid } from "nanoid";

// ===========================================
// CLIENT-SIDE SESSION HELPERS
// ===========================================

// Get session ID for API requests (client-side)
export function getClientSessionId() {
  if (typeof window === 'undefined') return null;
  
  const sessionId = document.cookie
    .split('; ')
    .find(row => row.startsWith('sessionId='))
    ?.split('=')[1];
    
  return sessionId || null;
}

// Get auth headers for API requests
export function getAuthHeaders(): Record<string, string> {
  // Import getStudentId dynamically to avoid SSR issues
  const { getStudentId } = require('./auth');
  const studentId = getStudentId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (studentId && studentId !== 'student-123') {
    headers['Authorization'] = studentId; // Use student ID directly, not Bearer format
  }
  
  return headers;
}

// Check if user is authenticated (client-side) - simplified version
export function isClientAuthenticated() {
  // Import getStudentId dynamically to avoid SSR issues
  const { getStudentId } = require('./auth');
  const studentId = getStudentId();
  return studentId && studentId !== 'student-123';
}
