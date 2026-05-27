"use client";

import React, { useState, useEffect } from 'react';
import { ParentLayout } from '../layout/ParentLayout';
import { Card } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function ProfileSection() {
  const { logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/parent/profile');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D85F2]"></div>
          <p className="text-[#707D8F] mt-4 font-medium">Loading profile...</p>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        <header>
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#3A3A3A]">Profile</h1>
          <p className="mt-2 text-sm sm:text-[16px] text-[#707D8F]">
            Your account and child information.
          </p>
        </header>

        {/* Parent Information */}
        <div className="bg-white rounded-[24px] border border-[#E5E5E5] p-6 sm:p-10 shadow-sm">
          <h2 className="text-lg sm:text-[20px] font-bold text-[#3A3A3A] mb-6 sm:mb-8">Parent Information</h2>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[12px] font-semibold text-[#707D8F] uppercase tracking-wider mb-1">Parent Name</p>
                <p className="text-base sm:text-[18px] font-medium text-[#3A3A3A]">
                  {data?.parent?.firstName} {data?.parent?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[12px] font-semibold text-[#707D8F] uppercase tracking-wider mb-1">Parent Email</p>
                <p className="text-base sm:text-[18px] font-medium text-[#3A3A3A] truncate">
                  {data?.parent?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[12px] font-semibold text-[#707D8F] uppercase tracking-wider mb-1">Phone</p>
                <p className="text-base sm:text-[18px] font-medium text-[#3A3A3A]">
                  {data?.parent?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-[24px] border border-[#E5E5E5] p-6 sm:p-10 shadow-sm">
          <h2 className="text-lg sm:text-[20px] font-bold text-[#3A3A3A] mb-6 sm:mb-8">Student Information</h2>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[12px] font-semibold text-[#707D8F] uppercase tracking-wider mb-1">Name</p>
                <p className="text-base sm:text-[18px] font-medium text-[#3A3A3A]">
                  {data?.child?.firstName} {data?.child?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[12px] font-semibold text-[#707D8F] uppercase tracking-wider mb-1">Class</p>
                <p className="text-base sm:text-[18px] font-medium text-[#3A3A3A]">
                  {data?.child?.class}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-[16px] py-4 px-6 flex items-center justify-center gap-3 transition-colors group mb-8"
        >
          <LogOut className="h-5 w-5 text-[#EF4444] transition-transform group-hover:-translate-x-1" />
          <span className="text-base font-bold text-[#EF4444]">Logout</span>
        </button>
      </div>
    </ParentLayout>
  );
}

