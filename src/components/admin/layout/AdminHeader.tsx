"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, Settings, Building2, X, MapPin, AlertTriangle, Info, MessageSquare, Clock } from 'lucide-react';
import { useAdminNotifications } from '@/src/hooks/use-admin-notifications';
import { useTimeFilter } from '@/src/contexts/TimeFilterContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showTimeFilter?: boolean;
  showSchoolFilter?: boolean;
  schoolFilterValue?: string;
  onSchoolFilterChange?: (value: string) => void;
  schools?: Array<{ id: string; name: string }>;
  showLocationFilter?: boolean;
  locationFilterValue?: string;
  onLocationFilterChange?: (value: string) => void;
  locations?: Array<{ id: string; name: string }>;
  actions?: React.ReactNode;
}

export function AdminHeader({ 
  title, 
  subtitle, 
  showTimeFilter = true, 
  showSchoolFilter = true, 
  schoolFilterValue,
  onSchoolFilterChange,
  schools,
  showLocationFilter = false,
  locationFilterValue,
  onLocationFilterChange,
  locations,
  actions 
}: AdminHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { timeFilter, setTimeFilter } = useTimeFilter();
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    clearAll 
  } = useAdminNotifications();

  // Helper function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  // Helper function to get icon based on notification type
  const getNotificationIcon = (type: string, severity: string) => {
    if (type === 'escalation') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (type === 'system') {
      return <Info className="h-4 w-4" />;
    }
    return <MessageSquare className="h-4 w-4" />;
  };

  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    markAsRead(notification.id);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border bg-white backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-[#65758b] text-muted-foreground">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          {showSchoolFilter && (
            <Select value={schoolFilterValue} onValueChange={onSchoolFilterChange}>
              <SelectTrigger className="w-44 h-9 bg-white focus:ring-2 focus:ring-[#3c83f6] ">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#65758b] text-muted-foreground " />
                  <SelectValue placeholder="Select School" />
                </div>
              </SelectTrigger>
              <SelectContent className='bg-white max-h-50 overflow-y-auto'>
                <SelectItem value="all">All Schools</SelectItem>
                {schools && schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showLocationFilter && (
            <Select value={locationFilterValue} onValueChange={onLocationFilterChange}>
              <SelectTrigger className="w-44 h-9 bg-white focus:ring-2 focus:ring-[#3c83f6] ">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#65758b] text-muted-foreground " />
                  <SelectValue placeholder="Select Location" />
                </div>
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Locations</SelectItem>
                {locations && locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showTimeFilter && (
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 h-9 bg-white focus:ring-2 focus:ring-[#3c83f6] ">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          )}

          {actions}

          {/* Notifications Dropdown */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearAll()}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                    <Bell className="h-8 w-8 text-gray-300" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification: any, index: number) => (
                    <DropdownMenuItem
                      key={notification.id || `notification-${index}`}
                      className={`flex flex-col items-start p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* Icon with severity background */}
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getSeverityColor(notification.severity)}`}>
                          {getNotificationIcon(notification.type, notification.severity)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          
                          {notification.escalationAlert && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-gray-600">
                                {notification.escalationAlert.studentName}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {notification.escalationAlert.studentClass}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(notification.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              
              {notifications.length > 5 && (
                <div className="p-2 border-t text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/admin/notifications')}
                    className="w-full"
                  >
                    View All ({notifications.length - 5} more)
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}