// Summary extraction utilities for chat conversations
export class SummaryExtractor {
  
  // Extract main topics from conversation
  static extractMainTopics(messages: Array<{content: string, senderType: string}>): string[] {
    const topics: string[] = []
    const allText = messages.map(m => m.content).join(' ').toLowerCase()
    
    // Common student concern topics
    const topicKeywords = {
      'Academic Stress': ['exam', 'test', 'study', 'homework', 'grades', 'school', 'class', 'assignment', 'project'],
      'Social Relationships': ['friend', 'friends', 'social', 'peer', 'bully', 'relationship', 'talk', 'people'],
      'Family Issues': ['family', 'parent', 'parents', 'mom', 'dad', 'sibling', 'brother', 'sister', 'home'],
      'Mental Health': ['anxiety', 'depress', 'stress', 'worry', 'sad', 'happy', 'mood', 'feeling', 'emotion'],
      'Self-Esteem': ['confidence', 'self', 'worth', 'good enough', 'compare', 'body image', 'appearance'],
      'Future Concerns': ['future', 'college', 'career', 'job', 'goals', 'dreams', 'uncertain', 'decide'],
      'Sleep Issues': ['sleep', 'tired', 'exhausted', 'insomnia', 'night', 'rest', 'energy'],
      'Physical Health': ['health', 'body', 'sick', 'pain', 'exercise', 'eat', 'food', 'diet']
    }
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matchCount = keywords.filter(keyword => allText.includes(keyword)).length
      if (matchCount >= 2) { // At least 2 keywords to consider it a topic
        topics.push(topic)
      }
    })
    
    return topics.length > 0 ? topics : ['General Conversation']
  }
  
  // Extract key themes and patterns
  static extractThemes(messages: Array<{content: string, senderType: string}>): {
    themes: string[]
    patterns: string[]
    emotionalArc: string
  } {
    const studentMessages = messages.filter(m => m.senderType === 'student')
    const allText = studentMessages.map(m => m.content).join(' ').toLowerCase()
    
    // Emotional themes
    const themes: string[] = []
    
    if (allText.includes('worry') || allText.includes('anxious') || allText.includes('stress')) {
      themes.push('Anxiety and Worry')
    }
    
    if (allText.includes('sad') || allText.includes('depress') || allText.includes('cry')) {
      themes.push('Sadness and Depression')
    }
    
    if (allText.includes('angry') || allText.includes('mad') || allText.includes('frustrat')) {
      themes.push('Anger and Frustration')
    }
    
    if (allText.includes('lonely') || allText.includes('alone') || allText.includes('isolat')) {
      themes.push('Loneliness and Isolation')
    }
    
    if (allText.includes('confident') || allText.includes('proud') || allText.includes('accomplish')) {
      themes.push('Confidence and Achievement')
    }
    
    // Behavioral patterns
    const patterns: string[] = []
    
    if (allText.includes('can\'t') || allText.includes('unable') || allText.includes('difficult')) {
      patterns.push('Perceived Limitations')
    }
    
    if (allText.includes('should') || allText.includes('must') || allText.includes('have to')) {
      patterns.push('External Pressure')
    }
    
    if (allText.includes('want') || allText.includes('wish') || allText.includes('hope')) {
      patterns.push('Aspirations and Desires')
    }
    
    if (allText.includes('feel') || allText.includes('feeling') || allText.includes('emotion')) {
      patterns.push('Emotional Awareness')
    }
    
    // Determine emotional arc
    const emotionalArc = this.determineEmotionalArc(studentMessages)
    
    return {
      themes: themes.length > 0 ? themes : ['Self-Exploration'],
      patterns: patterns.length > 0 ? patterns : ['Personal Growth'],
      emotionalArc
    }
  }
  
  // Determine the emotional progression of the conversation
  private static determineEmotionalArc(messages: Array<{content: string}>): string {
    if (messages.length < 2) return 'Single Emotional State'
    
    const emotions = messages.map(m => this.getBasicEmotion(m.content))
    const startEmotion = emotions[0]
    const endEmotion = emotions[emotions.length - 1]
    
    if (startEmotion === endEmotion) {
      return 'Consistent Emotional State'
    }
    
    // Check if it's improving
    const emotionLevels = {
      'crisis': 0,
      'negative': 1,
      'neutral': 2,
      'positive': 3
    }
    
    const startLevel = emotionLevels[startEmotion as keyof typeof emotionLevels] || 2
    const endLevel = emotionLevels[endEmotion as keyof typeof emotionLevels] || 2
    
    if (endLevel > startLevel) {
      return 'Emotional Improvement'
    } else if (endLevel < startLevel) {
      return 'Emotional Decline'
    } else {
      return 'Emotional Fluctuation'
    }
  }
  
  // Get basic emotion from text
  private static getBasicEmotion(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Crisis indicators
    if (lowerText.includes('suicide') || lowerText.includes('kill myself') || lowerText.includes('harm myself')) {
      return 'crisis'
    }
    
    // Positive indicators
    if (lowerText.match(/happy|good|great|awesome|fantastic|excited|joy|wonderful|amazing/)) {
      return 'positive'
    }
    
    // Negative indicators
    if (lowerText.match(/sad|bad|terrible|awful|hate|angry|mad|upset|frustrated/)) {
      return 'negative'
    }
    
    return 'neutral'
  }
  
  // Generate reflection points
  static generateReflections(messages: Array<{content: string, senderType: string}>): string[] {
    const reflections: string[] = []
    const studentMessages = messages.filter(m => m.senderType === 'student')
    const allText = studentMessages.map(m => m.content).join(' ').toLowerCase()
    
    // Insight patterns
    if (allText.includes('realize') || allText.includes('understand') || allText.includes('learn')) {
      reflections.push('Gained new understanding about personal situation')
    }
    
    if (allText.includes('change') || allText.includes('different') || allText.includes('new')) {
      reflections.push('Explored possibilities for change and growth')
    }
    
    if (allText.includes('help') || allText.includes('support') || allText.includes('talk')) {
      reflections.push('Recognized the value of seeking support')
    }
    
    if (allText.includes('cope') || allText.includes('deal') || allText.includes('handle')) {
      reflections.push('Developed coping strategies and approaches')
    }
    
    if (allText.includes('feel') || allText.includes('emotion') || allText.includes('mood')) {
      reflections.push('Increased emotional awareness and expression')
    }
    
    // Default reflections
    if (reflections.length === 0) {
      reflections.push('Engaged in self-reflection and exploration')
      reflections.push('Practiced emotional expression')
    }
    
    return reflections
  }
  
  // Extract key takeaways
  static extractKeyTakeaways(messages: Array<{content: string, senderType: string}>): {
    insights: string[]
    actionItems: string[]
    supportNeeds: string[]
  } {
    const studentMessages = messages.filter(m => m.senderType === 'student')
    const allText = studentMessages.map(m => m.content).join(' ')
    
    const insights: string[] = []
    const actionItems: string[] = []
    const supportNeeds: string[] = []
    
    // Extract insights
    if (allText.toLowerCase().includes('realize')) {
      insights.push('Self-realization and awareness')
    }
    
    if (allText.toLowerCase().includes('understand')) {
      insights.push('Deeper understanding of issues')
    }
    
    // Extract action items
    if (allText.toLowerCase().includes('try') || allText.toLowerCase().includes('will')) {
      actionItems.push('Commitment to try new approaches')
    }
    
    if (allText.toLowerCase().includes('practice') || allText.toLowerCase().includes('exercise')) {
      actionItems.push('Willingness to practice coping techniques')
    }
    
    // Extract support needs
    if (allText.toLowerCase().includes('help') || allText.toLowerCase().includes('support')) {
      supportNeeds.push('Ongoing support and guidance')
    }
    
    if (allText.toLowerCase().includes('talk') || allText.toLowerCase().includes('someone')) {
      supportNeeds.push('Connection and understanding')
    }
    
    return {
      insights: insights.length > 0 ? insights : ['Self-exploration'],
      actionItems: actionItems.length > 0 ? actionItems : ['Personal reflection'],
      supportNeeds: supportNeeds.length > 0 ? supportNeeds : ['Emotional support']
    }
  }
}

export default SummaryExtractor
