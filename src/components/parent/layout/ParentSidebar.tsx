'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  Activity, 
  Users, 
  User, 
  LogOut, 
  ChevronUp,
  UserCircle,
  TrendingUp,
  UserRoundCheck
} from 'lucide-react';

type NavItem = {
  label: string;
  icon: React.ElementType;
  to: string;
  match?: (path: string) => boolean;
  badge?: number;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid, to: "/parent", match: (p) => p === "/parent" },
  { label: "Activity", icon: TrendingUp, to: "/parent/activity", match: (p) => p.startsWith("/parent/activity"), badge: 3 },
  { label: "Meetings", icon: UserRoundCheck, to: "/parent/meetings", match: (p) => p.startsWith("/parent/meetings"), badge: 1 },
];

interface ParentSidebarProps {
  className?: string;
  setSidebarOpen?: (open: boolean) => void;
}

export function ParentSidebar({ className, setSidebarOpen }: ParentSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavigation = (to: string) => {
    router.push(to);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/parent/profile');
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'P';
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'Parent';
  };

  return (
    <aside className={cn(
      'flex w-full sm:w-[260px] h-full shrink-0 flex-col border-r border-[#E2E8F0] bg-white',
      className
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 sm:py-6 border-b border-[#E2E8F0]">
        <img 
          src="/logo1.png"
          alt="Psychology Buddy" 
          className="h-10 sm:h-12 w-auto"
        />
       
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 sm:px-4 pt-3 sm:pt-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match ? item.match(pathname) : pathname === item.to;
            return (
              <li key={item.label}>
                <button
                  onClick={() => {
                    handleNavigation(item.to);
                    setSidebarOpen?.(false); // Close mobile menu after navigation
                  }}
                  className={[
                    "group flex w-full items-center gap-5 rounded-[12px] sm:rounded-[14px] px-3 py-2.5 m-1 text-[15px] sm:text-[16px] h-[40px] sm:h-[44px] font-normal transition-colors",
                    active
                      ? "bg-[#3c83f6] text-white shadow-sm"
                      : "text-[#65758b] hover:bg-[#F6F9FE] hover:text-[#3C83F6]",
                  ].join(" ")}
                >
                  <Icon className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px]" strokeWidth={1.8} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {/* {item.badge !== undefined && (
                    <span className="flex h-4 sm:h-5 min-w-4 sm:min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )} */}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Profile/Logout */}
      <div className="space-y-3 px-3 sm:px-4 pb-3 sm:pb-4 mt-auto">
        <div className="relative">
          <button 
            onClick={toggleUserMenu}
            className="flex w-full items-center gap-3 rounded-lg sm:rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-8 sm:h-9 w-8 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#3c83f6] text-[11px] sm:text-[12px] font-semibold text-white">
              {getUserInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] sm:text-[13px] font-semibold text-gray-900">{getUserName()}</div>
              <div className="truncate text-[10px] sm:text-[11px] text-gray-500">Parent</div>
            </div>
            <ChevronUp 
              className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-lg border border-[#E2E8F0] bg-white shadow-lg z-50">
              <button 
                onClick={() => {
                  handleProfile();
                  setSidebarOpen?.(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] sm:text-[14px] font-medium text-[#65758b] hover:bg-[#F6F9FE] hover:text-[#3C83F6]"
              >
                <UserCircle className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px]" strokeWidth={1.8} />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => {
                  handleLogout();
                  setSidebarOpen?.(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] sm:text-[14px] font-medium text-[#65758b] hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px]" strokeWidth={1.8} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default ParentSidebar;
