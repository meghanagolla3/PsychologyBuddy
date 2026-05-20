"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  School, 
  Lock, 
  Pencil,
  ChevronLeft,
  KeyRound,
  IdCard,
  Stethoscope
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export function CounselorProfile() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/counselor/profile');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching counselor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const getInitials = () => {
    if (!data) return 'CP';
    return `${data.firstName[0]}${data.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] transition-colors group mb-4"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Profile Header */}
        <Card className="p-6 sm:p-8 rounded-[24px] border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-[#F1F5F9]">
              <AvatarImage src={data?.profileImageUrl} alt="Profile" />
              <AvatarFallback className="bg-[#E0E7FF] text-[#4F46E5] text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
                Dr. {data?.lastName || 'Cooper'}
              </h1>
              <p className="text-[#64748B] font-medium mt-1">{data?.department || 'School Counselor'}</p>
            </div>
          </div>
          <Button className="bg-[#2D85F2] hover:bg-[#1E6FD9] text-white rounded-xl px-4 py-4 h-auto font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </Card>

        {/* Personal Information */}
        <Card className="p-8 sm:p-10 rounded-[24px] border-[#E2E8F0] shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">Personal Information</h2>
            <p className="text-[#64748B] text-sm mt-1">Basic details and contact info.</p>
          </div>

          <div className="space-y-8">
            <ProfileField 
              icon={<User className="h-4 w-4" />} 
              label="Full Name" 
              value={`Dr. ${data?.firstName} ${data?.lastName}`} 
            />
            <ProfileField 
              icon={<User className="h-4 w-4" />} 
              label="Gender" 
              value={data?.gender} 
            />
            <ProfileField 
              icon={<Calendar className="h-4 w-4" />} 
              label="Date of Birth" 
              value={data?.dateOfBirth} 
            />
            <ProfileField 
              icon={<Phone className="h-4 w-4" />} 
              label="Contact Number" 
              value={data?.phone} 
            />
            <ProfileField 
              icon={<Mail className="h-4 w-4" />} 
              label="Email Address" 
              value={data?.email} 
            />
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-8 sm:p-10 rounded-[24px] border-[#E2E8F0] shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">Professional Information</h2>
            <p className="text-[#64748B] text-sm mt-1">Work-related details.</p>
          </div>

          <div className="space-y-8">
            <ProfileField 
              icon={<School className="h-4 w-4" />} 
              label="Assigned School" 
              value={data?.schoolName} 
            />
          </div>
        </Card>

        {/* Change Password */}
        {/* <Card className="p-6 sm:p-8 rounded-[24px] border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B]">Change Password</h3>
              <p className="text-[#64748B] text-sm">Update your account password.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-[#E2E8F0] text-[#1E293B] font-bold px-6 py-6 h-auto flex items-center gap-2 hover:bg-[#F8FAFC] transition-all">
            <KeyRound className="h-4 w-4" />
            Change
          </Button>
        </Card> */}
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[#64748B]">
        <div className="text-[#94A3B8]">{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-5 py-4 text-[#1E293B] font-medium shadow-inner">
        {value}
      </div>
    </div>
  );
}
