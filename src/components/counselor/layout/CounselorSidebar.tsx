'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  AlertTriangle, 
  UserCheck, 
  CalendarClock, 
  Trophy, 
  User, 
  LogOut, 
  ChevronUp,
  Users,
  LayoutDashboard
} from 'lucide-react';

type NavItem = {
  label: string;
  icon: React.ElementType;
  to: string;
  match?: (path: string) => boolean;
  badge?: number;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/counselor", match: (p) => p === "/counselor" },
  { label: "Alerts", icon: AlertTriangle, to: "/counselor/alerts", match: (p) => p.startsWith("/counselor/alerts") },
  { label: "Parent Meetings", icon: UserCheck, to: "/counselor/parent-meetings" },
  { label: "Sessions", icon: CalendarClock, to: "/counselor/sessions" },
  // { label: "My Students", icon: Users, to: "/counselor/students", match: (p) => p.startsWith("/counselor/students") },
  { label: "Challenges", icon: Trophy, to: "/counselor/challenges" },
];

interface CounselorSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: CounselorSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavigation = (to: string) => {
    router.push(to);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    if (onClose) onClose();
  };

  const handleProfile = () => {
    router.push('/counselor/profile');
    if (onClose) onClose();
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'DC'; // Default to Dr.Ananya initials
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `Dr. ${user.firstName}`;
    }
    return 'Dr.Ananya'; // Default name
  };

  return (
    <aside className={cn('flex w-[250px] shrink-0 flex-col border-r border-[#E2E8F0] bg-white h-full', className)}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0]">
        <img 
          src="/logo1.png"
          alt="Psychology Buddy" 
          className="h-12 w-auto"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 pt-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match ? item.match(pathname) : pathname === item.to;
            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNavigation(item.to)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-[16px] px-3 py-3.5 text-[16px] m-2 h-[50px] font-medium transition-colors",
                    active
                      ? "bg-[#F6F9FE] text-[#3C83F6] font-semibold"
                      : "text-[#65758b] hover:bg-[#F6F9FE] hover:text-[#242424]",
                  ].join(" ")}
                >
                  <Icon className="h-[20px] w-[20px]" strokeWidth={2.3} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Profile/Logout + Counselor */}
      <div className="space-y-3 px-4 pb-4">
        {/* <div className="rounded-xl border border-[#E2E8F0] bg-white px-2 py-2">
          <button 
            onClick={handleProfile}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-[#65758b] hover:bg-gray-100 hover:text-gray-900"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span>Profile</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-[#65758b] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div> */}

        <div className="relative">
          <button 
            onClick={toggleUserMenu}
            className="flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3c83f6] text-[12px] font-semibold text-white">
              {getUserInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-gray-900">{getUserName()}</div>
              <div className="truncate text-[11px] text-gray-500">School Counselor</div>
            </div>
            <ChevronUp 
              className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-lg border border-[#E2E8F0] bg-white">
              <button 
                onClick={handleProfile}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-[#65758b] hover:bg-[#F6F9FE] hover:text-[#3C83F6]"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span>Profile</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-[#65758b] hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

