'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Check, Clock } from 'lucide-react';
import { useCounselorNotifications } from '@/src/hooks/use-counselor-notifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function CounselorNotifications() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, loading } = useCounselorNotifications();

  console.log('[CounselorNotifications] Rendering, unreadCount:', unreadCount);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Redirect based on type
    if (notification.type === 'escalation' && notification.alertId) {
      router.push(`/counselor/alerts`);
    } else if (notification.type === 'session') {
      router.push(`/counselor/sessions`);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-slate-100 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-[#E1E1E1] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead()}
                className="text-xs h-8 text-blue-600 hover:bg-slate-100"
              >
                Mark all
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto bg-white">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start p-4 cursor-pointer border-b last:border-b-0 focus:bg-slate-50",
                  !n.read && "bg-slate-50/50"
                )}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex gap-3 w-full">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex shrink-0 items-center justify-center",
                    n.severity === 'critical' ? "bg-red-100 text-red-600" :
                    n.severity === 'high' ? "bg-orange-100 text-orange-600" :
                    n.severity === 'medium' ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {n.type === 'escalation' ? '🚨' : n.type === 'session' ? '📅' : '🔔'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-sm leading-snug", !n.read ? "font-semibold" : "text-muted-foreground")}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t bg-gray-50/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { router.push('/counselor/notifications'); setOpen(false); }}
              className="w-full text-xs text-muted-foreground"
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
