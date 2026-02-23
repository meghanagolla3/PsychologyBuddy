/**
 * Authentication utilities for student and admin contexts
 */

export const getStudentId = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const storedId = localStorage.getItem('studentId');
    if (storedId) return storedId;
    
    // Try to get from session storage
    const sessionId = sessionStorage.getItem('studentId');
    if (sessionId) return sessionId;
    
    // For development/demo, set a default
    const defaultStudentId = 'STU001';
    localStorage.setItem('studentId', defaultStudentId);
    return defaultStudentId;
  }
  
  // Fallback for development
  return 'STU001';
};

export const getUserId = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const storedId = localStorage.getItem('userId');
    if (storedId) return storedId;
    
    // Try to get from session storage
    const sessionId = sessionStorage.getItem('userId');
    if (sessionId) return sessionId;
  }
  
  // Fallback for development
  return 'admin@calmpath.ai';
};

export const setStudentId = (studentId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('studentId', studentId);
  }
};

export const setUserId = (userId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userId', userId);
  }
};
