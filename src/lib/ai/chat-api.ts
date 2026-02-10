export interface ChatStartRequest {
  studentId: string
  mood?: string
  triggers?: string[]
  notes?: string
  skipImportSuggestion?: boolean
  importData?: { mainTopic?: string; sessionId?: string }
}

export interface ChatStartResponse {
  success: boolean
  sessionId: string
  openingMessage: string
  message?: string
}

export interface ChatStreamRequest {
  message: string
  studentId: string
  sessionId: string
}

export class ChatAPI {
  /**
   * Start a new chat session
   */
  static async startChat(data: ChatStartRequest): Promise<ChatStartResponse> {
    const response = await fetch('/api/students/chat/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Important: include cookies for auth
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to start chat')
    }

    return response.json()
  }

  /**
   * Send a streaming message
   */
  static async sendMessage(data: ChatStreamRequest): Promise<Response> {
    console.log('Sending message to stream API:', data);
    
    const response = await fetch('/api/students/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Important: include cookies for auth
    })

    console.log('Stream API response status:', response.status);
    console.log('Stream API response headers:', response.headers);

    if (!response.ok) {
      // Try to get error details
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text() || 'No error details available';
      }
      
      console.error('Stream API error details:', errorDetails);
      throw new Error(`Failed to send message: ${errorDetails}`);
    }

    return response
  }

  /**
   * Get chat history
   */
  static async getChatHistory(studentId: string): Promise<any[]> {
    const response = await fetch(`/api/students/chat/history?studentId=${studentId}`, {
      credentials: 'include', // Important: include cookies for auth
    })
    
    if (!response.ok) {
      throw new Error('Failed to get chat history')
    }

    return response.json()
  }

  /**
   * Validate a chat session
   */
  static async validateSession(sessionId: string, studentId: string): Promise<any> {
    console.log('Validating session:', { sessionId, studentId });
    
    const response = await fetch('/api/students/chat/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, studentId }),
      credentials: 'include', // Important: include cookies for auth
    })

    console.log('Validate response status:', response.status);
    console.log('Validate response headers:', response.headers);

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text() || 'No error details available';
        console.error('Non-JSON error response:', errorDetails);
      }
      throw new Error(errorDetails)
    }

    try {
      return response.json()
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  /**
   * Generate summary for a chat session
   */
  static async generateSummary(sessionId: string, messages: any[]): Promise<any> {
    console.log('Generating summary for session:', sessionId);
    
    // Convert messages to the format expected by the summary API
    const conversation = messages.map(msg => ({
      role: msg.sender === 'student' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    const response = await fetch('/api/students/summary/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        conversation
      }),
      credentials: 'include', // Important: include cookies for auth
    })

    console.log('Summary generation response status:', response.status);

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text() || 'No error details available';
        console.error('Non-JSON error response:', errorDetails);
      }
      throw new Error(errorDetails)
    }

    try {
      return response.json()
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  /**
   * Get summary for a specific session
   */
  static async getSessionSummary(sessionId: string): Promise<any> {
    console.log('Getting summary for session:', sessionId);
    
    const response = await fetch(`/api/students/summary?sessionId=${sessionId}`, {
      credentials: 'include', // Important: include cookies for auth
    })

    console.log('Get summary response status:', response.status);

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text() || 'No error details available';
        console.error('Non-JSON error response:', errorDetails);
      }
      throw new Error(errorDetails)
    }

    try {
      return response.json()
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  /**
   * Get all summaries for a student
   */
  static async getStudentSummaries(studentId: string): Promise<any> {
    console.log('Getting summaries for student:', studentId);
    
    const response = await fetch(`/api/students/summary?studentId=${studentId}`, {
      credentials: 'include', // Important: include cookies for auth
    })

    console.log('Get student summaries response status:', response.status);

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text() || 'No error details available';
        console.error('Non-JSON error response:', errorDetails);
      }
      throw new Error(errorDetails)
    }

    try {
      return response.json()
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  /**
   * End a chat session
   */
  static async endSession(sessionId: string): Promise<void> {
    const response = await fetch(`/api/students/chat/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
      credentials: 'include', // Important: include cookies for auth
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to end chat session')
    }
  }
}
