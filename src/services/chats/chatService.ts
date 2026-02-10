// Types for chat service
export interface ChatSessionData {
  sessionId: string
  studentId: string
  mood?: string
  triggers?: string[]
  notes?: string
  isActive: boolean
  startedAt: string
  endedAt?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatStartResponse {
  sessionId: string
  openingMessage: string
  success: boolean
}

export class ChatService {
  static async startSession(studentId: string, mood: string, triggers: string[], notes?: string) {
    return await fetch("/api/students/chat/start", {
      method: "POST",
      body: JSON.stringify({
        studentId,
        mood,
        triggers,
        notes: notes || "",
      }),
    }).then((res) => res.json());
  }

  static async sendStreamMessage({ message, studentId, sessionId }: any) {
    return fetch("/api/students/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message, studentId, sessionId }),
    });
  }
}
