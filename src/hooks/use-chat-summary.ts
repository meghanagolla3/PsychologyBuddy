import { useState, useEffect } from 'react'

export interface SummaryPreview {
  id: string
  mainTopic: string
  createdAt: string
}

// Add debug interface to see what we actually get
interface RawSummaryData {
  id?: string
  mainTopic?: string
  title?: string // Might be 'title' instead of 'mainTopic'
  createdAt?: string
  [key: string]: any
}

export interface UseChatSummaryOptions {
  studentId: string
}

export function useChatSummary({ studentId }: UseChatSummaryOptions) {
  const [lastSummary, setLastSummary] = useState<SummaryPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLastSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/students/summary/last?studentId=${studentId}`)
      const data = await response.json()
      
      console.log('Last summary API response:', data) // Debug log
      
      if (data.success && data.data) {
        const rawData: RawSummaryData = data.data
        console.log('Raw summary data:', rawData) // Debug log
        
        // Transform the data to match our interface
        const transformedSummary: SummaryPreview = {
          id: rawData.id || '',
          mainTopic: rawData.mainTopic || rawData.title || 'Previous Conversation',
          createdAt: rawData.createdAt || new Date().toISOString()
        }
        
        console.log('Transformed summary:', transformedSummary) // Debug log
        setLastSummary(transformedSummary)
      } else {
        console.log('No summary data found or API returned error:', data) // Debug log
        setLastSummary(null)
      }
    } catch (err) {
      console.error('Error fetching last summary:', err) // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studentId) {
      fetchLastSummary()
    }
  }, [studentId])

  const importLastSummary = () => {
    console.log('importLastSummary called, lastSummary:', lastSummary) // Debug log
    
    if (!lastSummary) {
      console.log('No last summary found') // Debug log
      return ''
    }
    
    const topic = lastSummary.mainTopic || 'our previous conversation'
    console.log('Using topic:', topic) // Debug log
    
    return `I want to continue talking about: ${topic}`
  }

  return {
    lastSummary,
    loading,
    error,
    fetchLastSummary,
    importLastSummary
  }
}
