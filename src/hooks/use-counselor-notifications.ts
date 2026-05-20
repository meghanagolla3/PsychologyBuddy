'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'

export interface CounselorNotification {
  id: string
  userId: string
  type: 'system' | 'escalation' | 'session' | 'challenge'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  createdAt: string
  readAt?: string
  alert?: any
}

export function useCounselorNotifications() {
  const [notifications, setNotifications] = useState<CounselorNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/counselor/notifications')
      if (response.ok) {
        const data = await response.json()
        console.log('[CounselorNotifications] Fetched:', data.notifications?.length, 'unread:', data.unreadCount);
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[CounselorNotifications] Failed to fetch:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to fetch counselor notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id?: string) => {
    try {
      const response = await fetch('/api/counselor/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        if (id) {
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
          setUnreadCount(0)
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refetch: fetchNotifications
  }
}
