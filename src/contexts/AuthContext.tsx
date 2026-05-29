"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  adminProfile?: any;
  counselorProfile?: {
    department?: string;
    specialization?: string;
    availability?: string;
  };
  parentProfile?: {
    id?: string;
    department?: string;
  };
  id: string;
  email?: string;
  studentId?: string;
  firstName: string;
  lastName: string;
  role: {
    name: string;
    rolePermissions?: {
      permission: {
        name: string;
      };
    }[];
  };
  school?: {
    id: string;
    name: string;
  };
  classRef?: {
    id: string;
    name: string;
    grade: number;
    section: string;
  };
  studentProfile?: {
    id?: string;
    profileImage?: string;
    dateOfBirth?: Date;
    emergencyContact?: any;
  };
  updatedAt?: Date | string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = (userData: User) => {
    setUser(userData);
    // Store studentId in localStorage for easy access
    if (userData.studentId) {
      localStorage.setItem('studentId', userData.studentId);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear studentId from localStorage
      localStorage.removeItem('studentId');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.data?.user) {
        const oldUpdatedAt = user?.updatedAt;
        const newUpdatedAt = data.data.user.updatedAt;
        
        // Check if user data changed (permissions were updated by superadmin)
        const permissionsChanged = oldUpdatedAt && newUpdatedAt && new Date(newUpdatedAt) > new Date(oldUpdatedAt);
        
        if (permissionsChanged) {
          console.log('Permissions changed by superadmin, refreshing user data');
          console.log('Old updatedAt:', oldUpdatedAt);
          console.log('New updatedAt:', newUpdatedAt);
          console.log('New permissions count:', data.data.user.adminProfile?.adminPermissions?.length || 0);
        }
        
        setUser(data.data.user);
        // Store studentId in localStorage for easy access
        if (data.data.user.studentId) {
          localStorage.setItem('studentId', data.data.user.studentId);
        }
      } else {
        setUser(null);
        // Clear studentId from localStorage if no user
        localStorage.removeItem('studentId');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      // Clear studentId from localStorage on error
      localStorage.removeItem('studentId');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip auth check on landing pages
    const landingPages = ['/', '/about', '/contact', '/forschools', '/termsandconditions'];
    if (typeof window !== 'undefined' && landingPages.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }
    refreshUser();
  }, []);

  // Refresh user data when window regains focus to get updated permissions
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refreshUser();
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user]);

  // Periodically refresh user data every 10 seconds to ensure permissions stay up to date
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 10 * 1000); // 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

