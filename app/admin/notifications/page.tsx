"use client";

import React, { useState } from 'react';
import { useAdminNotifications } from '@/src/hooks/use-admin-notifications';
import { AdminHeader } from '@/src/components/admin/layout/AdminHeader';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, MessageSquare, Clock, Check, Trash2, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AdminNotificationsPage() {
  const { notifications, unreadCount, markAsRead, clearAll, refetch } = useAdminNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'escalation' | 'system'>('all');

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
      return <AlertTriangle className="h-5 w-5" />;
    }
    if (type === 'system') {
      return <Info className="h-5 w-5" />;
    }
    return <MessageSquare className="h-5 w-5" />;
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

  // Helper function to get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'escalation') return notification.type === 'escalation';
    if (filter === 'system') return notification.type === 'system';
    return true;
  });

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) {
      toast({ title: "No unread notifications" });
      return;
    }
    
    for (const id of unreadIds) {
      await markAsRead(id);
    }
    toast({ title: "All notifications marked as read" });
  };

  // Clear all notifications
  const handleClearAll = async () => {
    await clearAll();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Notifications" 
        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        showSchoolFilter={false}
        showTimeFilter={false}
      />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread ({unreadCount})
                </Button>
                <Button
                  variant={filter === 'escalation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('escalation')}
                >
                  Escalations
                </Button>
                <Button
                  variant={filter === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('system')}
                >
                  System
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                <p className="text-sm text-gray-500">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : filter === 'escalation' 
                    ? "No escalation notifications" 
                    : filter === 'system'
                    ? "No system notifications"
                    : "You have no notifications at the moment"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification: any, index: number) => (
              <div
                key={notification.id || `notification-${index}`}
                className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon with severity background */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${getSeverityColor(notification.severity)}`}>
                    {getNotificationIcon(notification.type, notification.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getSeverityBadge(notification.severity)}`}>
                            {notification.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {notification.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="flex-shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {notification.escalationAlert && (
                      <div className="bg-gray-50 rounded-md p-3 mb-2">
                        <div className="flex items-center gap-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              {notification.escalationAlert.studentName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.escalationAlert.studentClass}
                            </p>
                          </div>
                          {notification.escalationAlert.category && (
                            <div className="ml-auto">
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {notification.escalationAlert.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
