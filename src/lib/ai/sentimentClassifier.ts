// Simple sentiment classifier for student messages
export class SentimentClassifier {
  // Positive sentiment keywords
  private static positiveWords = [
    'happy', 'good', 'great', 'awesome', 'fantastic', 'excellent', 
    'wonderful', 'amazing', 'love', 'like', 'excited', 'joy', 'pleased',
    'satisfied', 'content', 'relieved', 'proud', 'confident', 'optimistic',
    'hopeful', 'grateful', 'blessed', 'calm', 'peaceful', 'relaxed'
  ]

  // Negative sentiment keywords
  private static negativeWords = [
    'sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike',
    'angry', 'mad', 'upset', 'frustrated', 'annoyed', 'worried', 'anxious',
    'stressed', 'overwhelmed', 'depressed', 'lonely', 'confused', 'scared',
    'afraid', 'nervous', 'tired', 'exhausted', 'bored', 'disappointed',
    'hurt', 'pain', 'suffering', 'miserable', 'hopeless', 'helpless'
  ]

  // High-risk indicators that need immediate attention
  private static highRiskWords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself',
    'self harm', 'cutting', 'overdose', 'no reason to live', 'better off dead',
    'can\'t go on', 'give up', 'worthless', 'burden', 'everyone better without me'
  ]

  static classifySentiment(text: string): {
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    isHighRisk: boolean
    emotions: string[]
  } {
    const lowerText = text.toLowerCase()
    const words = lowerText.split(/\s+/)
    
    // Check for high-risk indicators first
    const isHighRisk = this.highRiskWords.some(word => 
      lowerText.includes(word)
    )

    if (isHighRisk) {
      return {
        sentiment: 'negative',
        confidence: 1.0,
        isHighRisk: true,
        emotions: ['crisis', 'urgent']
      }
    }

    // Count positive and negative words
    let positiveCount = 0
    let negativeCount = 0
    const detectedEmotions: string[] = []

    words.forEach(word => {
      if (this.positiveWords.includes(word)) {
        positiveCount++
        detectedEmotions.push('positive')
      }
      if (this.negativeWords.includes(word)) {
        negativeCount++
        detectedEmotions.push('negative')
      }
    })

    // Determine sentiment
    const totalSentimentWords = positiveCount + negativeCount
    let sentiment: 'positive' | 'negative' | 'neutral'
    let confidence: number

    if (totalSentimentWords === 0) {
      sentiment = 'neutral'
      confidence = 0.5
    } else if (positiveCount > negativeCount) {
      sentiment = 'positive'
      confidence = positiveCount / totalSentimentWords
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      confidence = negativeCount / totalSentimentWords
    } else {
      sentiment = 'neutral'
      confidence = 0.5
    }

    // Detect specific emotions based on keywords
    const emotions = this.detectSpecificEmotions(lowerText)

    return {
      sentiment,
      confidence,
      isHighRisk: false,
      emotions: Array.from(new Set([...detectedEmotions, ...emotions]))
    }
  }

  private static detectSpecificEmotions(text: string): string[] {
    const emotions: string[] = []

    // Anxiety indicators
    if (text.match(/worried|anxious|nervous|panic|fear|scared|afraid/)) {
      emotions.push('anxiety')
    }

    // Depression indicators
    if (text.match(/depressed|sad|hopeless|empty|numb|no motivation/)) {
      emotions.push('depression')
    }

    // Stress indicators
    if (text.match(/stress|overwhelmed|pressure|can\'t handle|too much/)) {
      emotions.push('stress')
    }

    // Anger indicators
    if (text.match(/angry|mad|furious|irritated|annoyed|frustrated/)) {
      emotions.push('anger')
    }

    // Loneliness indicators
    if (text.match(/lonely|alone|isolated|no one|nobody|misunderstood/)) {
      emotions.push('loneliness')
    }

    // Fear indicators
    if (text.match(/afraid|scared|terrified|fear|panic/)) {
      emotions.push('fear')
    }

    // Joy indicators
    if (text.match(/happy|joy|excited|thrilled|delighted|cheerful/)) {
      emotions.push('joy')
    }

    return emotions
  }

  // Get mood from sentiment analysis
  static getMoodFromSentiment(sentiment: {
    sentiment: 'positive' | 'negative' | 'neutral'
    emotions: string[]
  }): string {
    if (sentiment.emotions.includes('crisis') || sentiment.emotions.includes('urgent')) {
      return 'Anxious'
    }

    if (sentiment.emotions.includes('anxiety') || sentiment.emotions.includes('fear')) {
      return 'Anxious'
    }

    if (sentiment.emotions.includes('depression') || sentiment.emotions.includes('sadness')) {
      return 'Sad'
    }

    if (sentiment.emotions.includes('stress') || sentiment.emotions.includes('overwhelmed')) {
      return 'Tired'
    }

    if (sentiment.emotions.includes('joy') || sentiment.sentiment === 'positive') {
      return 'Happy'
    }

    return 'Okay'
  }
}

export default SentimentClassifier
