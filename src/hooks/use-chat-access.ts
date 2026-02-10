import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { SearchParamsUtils, NavigationUtils } from '@/src/utils'
import { useAuth } from '@/src/contexts/AuthContext'

export interface UseChatAccessReturn {
  canAccessChat: boolean
  requiresMoodCheckin: boolean
  params: {
    mood?: string
    triggers?: string[]
    notes?: string
    moodCheckinId?: string
    triggerId?: string
  }
  loading: boolean
  hasCheckedInToday: boolean
}

export function useChatAccess(): UseChatAccessReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)

  // Extract chat parameters using utility
  const chatParams = SearchParamsUtils.extractChatParams(searchParams)
  const { isValid, missing } = SearchParamsUtils.validateChatParams(chatParams)

  useEffect(() => {
    const checkChatAccess = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Check if user has already checked in today (optional info)
        const response = await fetch(`/api/students/mood/checkin/today?studentId=${user.id}`)
        const data = await response.json()
        
        const hasTodayCheckin = data.success && data.data
        setHasCheckedInToday(hasTodayCheckin)

        // NEW LOGIC: Always allow chat access after login
        // No restrictions based on mood check-in
        // Mood check-in is optional and only enhances the chat experience

      } catch (error) {
        console.error('Error checking today\'s mood checkin:', error)
        // Even if we can't check, still allow chat access
      } finally {
        setLoading(false)
      }
    }

    checkChatAccess()
  }, [user])

  return {
    canAccessChat: true, // Always allow chat access after login
    requiresMoodCheckin: false, // Never require mood check-in
    params: chatParams,
    loading,
    hasCheckedInToday
  }
}
