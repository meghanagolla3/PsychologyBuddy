import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { SearchParamsUtils, NavigationUtils } from '@/src/utils'
import { useEffect, useState } from 'react'

export interface UseChatParamsReturn {
  params: {
    mood?: string
    triggers?: string[]
    notes?: string
    moodCheckinId?: string
    triggerId?: string
  }
  isValid: boolean
  missing: string[]
  loading: boolean
}

export function useChatParams(redirectToMoodCheckin = true): UseChatParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Extract chat parameters using utility
  const chatParams = SearchParamsUtils.extractChatParams(searchParams)
  const { isValid, missing } = SearchParamsUtils.validateChatParams(chatParams)

  useEffect(() => {
    // Redirect to mood checkin if missing required parameters
    if (!loading && !isValid && redirectToMoodCheckin) {
      NavigationUtils.navigateToMoodCheckin(router)
    }
    setLoading(false)
  }, [isValid, loading, missing, router, redirectToMoodCheckin])

  return {
    params: chatParams,
    isValid,
    missing,
    loading
  }
}
