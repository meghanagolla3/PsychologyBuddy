"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
// import { NavigationUtils } from "@/src/utils";

interface BackToDashboardProps {
  className?: string;
}

export default function BackToDashboard({ className = "" }: BackToDashboardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/dashboard/student')}
      className={`flex items-center gap-2 text-[#73829A] hover:text-[#1a9bcc] transition-colors p-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-5" />
      <span className="text-[13px] sm:text-[16px]">Back to Dashboard</span>
    </button>
  );
}
