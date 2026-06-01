import { useState, useEffect, useRef, useCallback } from 'react'



import { useRouter } from 'next/navigation'



import { ChatAPI } from '../lib/ai/chat-api'



import { ConversationAnalyzer } from '../services/conversation-analysis'



import { AutomaticChatTermination, ChatTerminationResult } from '../services/chats/automatic-chat-termination'



import { ResponseFormatter, StructuredResponse } from '../lib/ai/response-templates'



import { ContentEscalationDetector } from '../services/escalations/content-escalation-detector'



import { EscalationAlertService } from '../services/escalations/escalation-alert-service'







export interface Message {



  id: string



  sender: "student" | "bot"



  content: string



  timestamp: string



  temp?: boolean



  type?: 'opening' | 'closing' | 'normal'



  importSuggestion?: {



    show: boolean



    lastTopic?: string



    lastDate?: string



  }



}







export interface ChatState {



  messages: Message[]



  input: string



  isLoading: boolean



  sessionId: string | null



  sessionStartTime: number | null



  escalationAlert?: {



    id: string



    category: string



    level: string



    severity: number



    requiresImmediateAction: boolean



    recommendation: string



  }



}







export interface UseChatOptions {



  studentId: string



  mood?: string



  triggers?: string[]



  notes?: string



  onMessage?: (message: Message) => void



  onError?: (error: Error) => void



  onEscalation?: (escalation: ChatState['escalationAlert']) => void



  importData?: { mainTopic?: string; sessionId?: string }



  importMessages?: Message[] // New: Support importing full conversation



}







export function useChat({



  studentId,



  mood,



  triggers,



  notes,



  onMessage,



  onError,



  onEscalation,



  importData,



}: UseChatOptions) {



  const router = useRouter();



  



  const [state, setState] = useState<ChatState>({



    messages: [],



    input: '',



    isLoading: false,



    sessionId: null,



    sessionStartTime: null



  })







  const chatRef = useRef<HTMLDivElement>(null)



  const isInitialized = useRef(false)



  const sessionIdRef = useRef<string | null>(null)



  const sessionStartTimeRef = useRef<number | null>(null)



  const terminationCleanupRef = useRef<(() => void) | null>(null)



  const isTerminatingRef = useRef(false)



  const timerShouldBeActive = useRef(false) // Timer should only start after first student message







  // Function to update input value



  const setInput = useCallback((value: string) => {



    setState(prev => ({ ...prev, input: value }))



  }, [])







  // Auto scroll when messages update



  useEffect(() => {



    chatRef.current?.scrollTo({



      top: chatRef.current.scrollHeight,



      behavior: "smooth",



    });



  }, [state.messages]);







  // Debug: Log state changes



  useEffect(() => {



    console.log(`[AutoTermination] State changed: sessionId=${state.sessionId}, sessionStartTime=${state.sessionStartTime}, messages=${state.messages.length}`);



  }, [state.sessionId, state.sessionStartTime, state.messages]);







  // Debug: Monitor session time in real-time



  useEffect(() => {



    if (!state.sessionStartTime || !state.sessionId) return;







    const logSessionTime = () => {



      const currentTime = Date.now();



      // Use the ref value for consistency

      const sessionStartTime = sessionStartTimeRef.current || state.sessionStartTime;

      

      if (!sessionStartTime) return;



      const elapsed = currentTime - sessionStartTime;



      const elapsedSeconds = Math.round(elapsed / 1000);



      const remainingTime = AutomaticChatTermination.getRemainingSessionTime(sessionStartTime);



      const remainingSeconds = Math.round(remainingTime / 1000);



      const shouldWarn = AutomaticChatTermination.shouldShowTimeWarning(sessionStartTime);



      const config = AutomaticChatTermination.getConfiguration();







      console.log(`[AutoTermination] Session Monitor | Session: ${state.sessionId!.slice(0, 8)}... | Elapsed: ${elapsedSeconds}s | Remaining: ${remainingSeconds}s | Warning: ${shouldWarn ? '⚠️ YES' : 'No'} | Max: ${config.maxSessionDurationMinutes}min`);



    };







    // Log immediately



    logSessionTime();







    // Log every second



    const interval = setInterval(logSessionTime, 1000);







    return () => clearInterval(interval);



  }, [state.sessionStartTime, state.sessionId]);







  // Initialize chat session



  const initializeChat = useCallback(async (



    mood?: string, 



    triggers?: string[], 



    notes?: string,



    skipImportSuggestion: boolean = false,



    importData?: { mainTopic?: string; sessionId?: string }



  ) => {



    console.log('[AutoTermination] initializeChat called with:', { studentId, mood, triggers, notes, skipImportSuggestion, importData });



    



    if (!studentId) {



      console.warn('[AutoTermination] Cannot initialize chat: No student ID provided')



      return



    }



    



    if (isInitialized.current) {



      console.log('[AutoTermination] Chat already initialized')



      return



    }



    



    isInitialized.current = true



    console.log('[AutoTermination] isInitialized set to true')



    



    try {



      console.log('[AutoTermination] Initializing chat with:', { studentId, mood, triggers, notes, skipImportSuggestion, importData });



      



      // Call the chat start API to create a real session



      const response = await fetch('/api/students/chat/start', {



        method: 'POST',



        headers: {



          'Content-Type': 'application/json',



          'x-user-id': studentId



        },



        body: JSON.stringify({



          studentId,



          mood,



          triggers,



          notes,



          skipImportSuggestion,



          importData



        })



      })







      if (!response.ok) {



        const errorData = await response.json().catch(() => ({}))



        throw new Error(`Failed to start chat: ${response.status} - ${errorData.message || 'Unknown error'}`)



      }







      const data = await response.json()



      



      if (!data.success) {



        throw new Error(data.message || 'Failed to initialize chat session')



      }







      // Set the real session ID from the API response



      // Note: sessionStartTime is NOT set here - it will be set when student sends first message



      sessionIdRef.current = data.sessionId



      setState(prev => ({ 



        ...prev, 



        sessionId: data.sessionId



      }))



      



      console.log('Chat session created successfully:', data.sessionId);



      console.log('[AutoTermination] Session ID set, timer will start when student sends first message');







      // Check if there's already an opening message to prevent duplicates



      const hasOpeningMessage = state.messages.some(msg => msg.type === 'opening' || (msg.sender === 'bot' && state.messages.length === 0));



      



      if (!hasOpeningMessage) {



        // Display the opening message from the API (mood-based)



        const openingMessage: Message = {



          id: crypto.randomUUID(),



          sender: 'bot',



          content: data.openingMessage,



          timestamp: new Date().toISOString(),



          type: 'opening'



        }



        



        console.log('Opening message from API:', openingMessage)







        setState(prev => ({



          ...prev,



          messages: [...prev.messages, openingMessage]



        }))







        onMessage?.(openingMessage)



      } else {



        console.log('Opening message already exists, skipping duplicate');



      }







    } catch (error) {



      const err = error instanceof Error ? error : new Error('Failed to initialize chat')



      console.error('Chat initialization error:', err)



      onError?.(err)



      // Reset flag on error so it can be retried



      isInitialized.current = false



    }



  }, [studentId, onMessage, onError])







  // Generate summary and end chat



  const generateSummaryAndEndChat = useCallback(async () => {



    if (!sessionIdRef.current || !studentId) return;







    console.log(`[AutoTermination] Starting summary generation for session ${sessionIdRef.current}`);



    console.log(`[AutoTermination] Message count: ${state.messages.length}`);







    try {



      const requestPayload = {



        sessionId: sessionIdRef.current,



        conversation: state.messages.map((msg: Message) => ({



          role: msg.sender === "student" ? "user" : "assistant",



          content: msg.content



        })),



      };



      



      console.log(`[AutoTermination] Request payload:`, requestPayload);



      console.log(`[AutoTermination] Student ID: ${studentId}`);







      // Call summary generation API



      const response = await fetch("/api/students/summary/generate", {



        method: "POST",



        headers: { 



          "Content-Type": "application/json",



          "x-user-id": studentId



        },



        body: JSON.stringify(requestPayload),



      });







      console.log(`[AutoTermination] Summary API response status: ${response.status}`);







      const data = await response.json();



      console.log(`[AutoTermination] Summary API response:`, data);



      console.log(`[AutoTermination] Response data type:`, typeof data);



      console.log(`[AutoTermination] Response data keys:`, Object.keys(data));







      if (data && data.success) {



        // Store for last-session preview use



        sessionStorage.setItem("lastSummaryId", data.data.id);



        console.log(`[AutoTermination] Summary generated successfully, ID: ${data.data.id}`);



        



        // Don't clear session here - let handleAutomaticTermination handle it after redirect



        console.log(`[AutoTermination] Summary stored, session will be cleared after redirect`);



        



      } else {



        console.error(`[AutoTermination] Summary generation failed:`, data);



        isTerminatingRef.current = false;



      }



    } catch (error) {



      console.error('Failed to generate summary during automatic termination:', error);



      isTerminatingRef.current = false;



    }



  }, [state.messages, studentId, initializeChat]);







  // Automatic chat termination logic



  const handleAutomaticTermination = useCallback(async (result: ChatTerminationResult) => {



    if (isTerminatingRef.current || !sessionIdRef.current) return;



    



    isTerminatingRef.current = true;



    console.log('Automatic chat termination triggered:', result.reason);



    



    try {



      // Add closing message from AI



      if (result.closingMessage) {



        console.log(`[AutoTermination] Adding closing message: ${result.closingMessage}`);



        const closingMessage: Message = {



          id: `closing_${Date.now()}`,



          sender: 'bot',



          content: result.closingMessage,



          timestamp: new Date().toISOString(),



          type: 'closing'



        };



        



        setState(prev => ({



          ...prev,



          messages: [...prev.messages, closingMessage]



        }));



      }







      // Wait a moment for user to read the closing message



      console.log(`[AutoTermination] Waiting 3 seconds before generating summary...`);



      await new Promise(resolve => setTimeout(resolve, 3000));







      console.log(`[AutoTermination] Proceeding with summary generation...`);



      // Generate summary and end chat



      await generateSummaryAndEndChat();



      



      // Wait a moment after summary generation to ensure it's stored before redirecting



      console.log(`[AutoTermination] Waiting 2 seconds after summary generation...`);



      await new Promise(resolve => setTimeout(resolve, 2000));



      



      // Redirect to reflections page to show the new summary



      console.log(`[AutoTermination] Redirecting to reflections page...`);



      // Only redirect if summary was successfully generated



      const lastSummaryId = sessionStorage.getItem("lastSummaryId");



      if (lastSummaryId) {



        console.log(`[AutoTermination] Summary ID found (${lastSummaryId}), redirecting to reflections`);



        



        // Clear termination timer



        if (terminationTimerRef.current) {



          clearTimeout(terminationTimerRef.current);



          terminationTimerRef.current = null;



        }



        timerSetRef.current = false;



        



        // Mark session as inactive in database

        if (sessionIdRef.current) {

          try {

            await fetch(`/api/students/chat/end`, {

              method: 'POST',

              headers: {

                'Content-Type': 'application/json',

                'x-user-id': studentId

              },

              body: JSON.stringify({

                sessionId: sessionIdRef.current

              })

            });

            console.log(`[AutoTermination] Session ${sessionIdRef.current} marked as inactive in database`);

          } catch (error) {

            console.error('[AutoTermination] Failed to mark session as inactive:', error);

          }

        }



        // Clear current session for this student before redirect



        const studentSessionKey = `chatSessionId_${studentId}`;



        sessionStorage.removeItem(studentSessionKey);



        sessionIdRef.current = null;



        sessionStartTimeRef.current = null;



        isInitialized.current = false;



        isTerminatingRef.current = false;



        timerShouldBeActive.current = false;



        



        // Reset state for new chat



        setState({



          messages: [],



          input: '',



          isLoading: false,



          sessionId: null,



          sessionStartTime: null



        });



        



        router.push('/students/reflections');



      } else {



        console.log(`[AutoTermination] No summary ID found, skipping redirect and starting new chat`);



        // Start new chat without redirect



        await initializeChat();



      }



      



    } catch (error) {



      console.error('Error during automatic termination:', error);



      isTerminatingRef.current = false;



    }



  }, [generateSummaryAndEndChat]);







  // Set up automatic termination monitoring



  useEffect(() => {



    // Automatic termination disabled for performance - causing slow chat responses



    // console.log(`[AutoTermination] useEffect triggered! sessionId=${state.sessionId}, sessionStartTime=${state.sessionStartTime}`);



    // 



    // const currentSessionId = state.sessionId;



    // const messageCount = state.messages.length;



    // const sessionStartTime = state.sessionStartTime;



    // 



    // console.log(`[AutoTermination] Setting up monitoring: sessionId=${currentSessionId}, messageCount=${messageCount}, sessionStartTime=${sessionStartTime ? new Date(sessionStartTime).toISOString() : 'null'}`);



    // 



    // if (!currentSessionId) {



    //   console.log(`[AutoTermination] No session ID, skipping monitoring setup`);



    //   return; // Only need a valid session ID for time-based monitoring



    // }



    // 



    // // Clean up any existing termination check



    // if (terminationCleanupRef.current) {



    //   console.log(`[AutoTermination] Cleaning up previous interval before setting up new one`);



    //   try {



    //     const cleanup = terminationCleanupRef.current;



    //     terminationCleanupRef.current = null;



    //     cleanup();



    //   } catch (error) {



    //     console.error('[AutoTermination] Error during initial cleanup:', error);



    //   }



    // }



    // 



    // console.log(`[AutoTermination] Starting termination monitoring for ${messageCount} messages (time-based checks enabled)`);



    // 



    // // Set up new termination check with a function that returns current messages



    // terminationCleanupRef.current = AutomaticChatTermination.setupTerminationCheck(



    //   () => state.messages, // Pass a function to get current messages



    //   currentSessionId,



    //   handleAutomaticTermination, // Use the stable callback directly



    //   sessionStartTime || undefined



    // );



    // 



    // console.log(`[AutoTermination] Monitoring setup complete`);



    // 



    // return () => {



    //   if (terminationCleanupRef.current) {



    //     console.log(`[AutoTermination] Effect cleanup - cleaning up termination monitoring`);



    //     try {



    //       const cleanup = terminationCleanupRef.current;



    //       terminationCleanupRef.current = null;



    //       cleanup();



    //     } catch (error) {



    //       console.error('[AutoTermination] Error during cleanup:', error);



    //     }



    //   }



    // };



  }, [state.sessionId, state.sessionStartTime, handleAutomaticTermination]); // Include handleAutomaticTermination in dependencies







  // Timer reference for automatic termination



  const terminationTimerRef = useRef<NodeJS.Timeout | null>(null);



  const timerSetRef = useRef(false);







  // Set up automatic termination timer when session starts



  useEffect(() => {



    if (state.sessionStartTime && sessionIdRef.current && !isTerminatingRef.current && !timerSetRef.current && timerShouldBeActive.current) {



      timerSetRef.current = true;



      



      const maxDuration = AutomaticChatTermination.getMaxSessionDuration();



      const currentTime = Date.now();



      // Use the ref value for consistency

      const sessionStartTime = sessionStartTimeRef.current || state.sessionStartTime;

      

      if (!sessionStartTime) return;



      const elapsed = currentTime - sessionStartTime;



      const remainingTime = Math.max(0, maxDuration - elapsed);



      



      if (remainingTime > 0) {



        console.log(`[AutoTermination] Setting up timer for ${Math.round(remainingTime / 1000)} seconds`);



        



        // Set timer to trigger termination when duration is reached



        console.log(`[AutoTermination] Timer will trigger in ${Math.round(remainingTime / 1000)} seconds at ${new Date(Date.now() + remainingTime).toISOString()}`);



        terminationTimerRef.current = setTimeout(async () => {



          console.log(`[AutoTermination] Timer expired - auto terminating session at ${new Date().toISOString()}`);



          if (!isTerminatingRef.current && sessionIdRef.current) {



            console.log(`[AutoTermination] Proceeding with automatic termination`);



            const result: ChatTerminationResult = {



              shouldTerminate: true,



              reason: 'Time limit reached',



              analysis: {



                shouldEnd: true,



                reason: 'Session time limit exceeded',



                completionScore: 100,



                nextSteps: [],



                emotionalProgress: { improvement: false },



                conversationQuality: { depth: 'moderate', engagement: 'medium', resolution: 'partial' }



              },



              closingMessage: "I've enjoyed our conversation and will generate a summary for you to review later. Take care!"



            };



            



            await handleAutomaticTermination(result);



          } else {



            console.log(`[AutoTermination] Timer expired but session already terminating or no session ID`);



          }



        }, remainingTime);



      }



    }



    



    // Cleanup timer when session ends or component unmounts



    return () => {



      if (terminationTimerRef.current) {



        clearTimeout(terminationTimerRef.current);



        terminationTimerRef.current = null;



        timerSetRef.current = false;



      }



    };



  }, [state.sessionStartTime, state.sessionId, handleAutomaticTermination]);







  // Simple time-based termination check (runs only when needed - for immediate termination if already expired)



  const checkSessionTimeLimit = useCallback(async () => {



    if (!state.sessionStartTime || !sessionIdRef.current || isTerminatingRef.current) {



      return;



    }



    



    const currentTime = Date.now();



    // Use the ref value for consistency

    const sessionStartTime = sessionStartTimeRef.current || state.sessionStartTime;

    

    if (!sessionStartTime) return;



    const sessionDuration = currentTime - sessionStartTime;



    const maxDuration = AutomaticChatTermination.getMaxSessionDuration();



    



    if (sessionDuration >= maxDuration) {



      console.log(`[AutoTermination] Session time limit reached, ending chat`);



      // Generate a simple termination result



      const result: ChatTerminationResult = {



        shouldTerminate: true,



        reason: 'Time limit reached',



        analysis: {



          shouldEnd: true,



          reason: 'Session time limit exceeded',



          completionScore: 100,



          nextSteps: [],



          emotionalProgress: { improvement: false },



          conversationQuality: { depth: 'moderate', engagement: 'medium', resolution: 'partial' }



        },



        closingMessage: "I've enjoyed our conversation and will generate a summary for you to review later. Take care!"



      };



      



      await handleAutomaticTermination(result);



    }



  }, [state.sessionStartTime, handleAutomaticTermination]);







  // Send message with streaming



  const sendMessage = useCallback(async (messageText: string) => {



    console.log(`[AutoTermination] sendMessage called with: "${messageText}"`);



    console.log(`[AutoTermination] Current state before sending: sessionId=${state.sessionId}, sessionStartTime=${state.sessionStartTime}`);



    



    if (!messageText.trim()) {



      console.log('Cannot send message: empty message')



      return



    }







    // Start the session timer on the first student message



    if (!sessionStartTimeRef.current && !state.sessionStartTime) {



      const startTime = Date.now()



      sessionStartTimeRef.current = startTime



      setState(prev => ({ ...prev, sessionStartTime: startTime }))



      timerShouldBeActive.current = true // Activate timer after first message



      console.log(`[AutoTermination] Session timer started on first student message: ${new Date(startTime).toISOString()}`);



    }







    // Check if this is the first message (temp session)



    const isFirstMessage = sessionIdRef.current?.startsWith('temp_')



    console.log(`[AutoTermination] Is first message? ${isFirstMessage}, current sessionIdRef: ${sessionIdRef.current}`);



    



    if (isFirstMessage) {



      console.log('First message detected, creating actual chat session...')



      



      try {



        // Create the actual session with the student's first message



        const data = await ChatAPI.startChat({



          studentId,



          mood: mood && mood.trim() ? mood : undefined,



          triggers: triggers && triggers.length > 0 ? triggers : undefined,



          notes: notes && notes.trim() ? notes : undefined,



          skipImportSuggestion: false,



          importData



        })







        console.log('Chat session created successfully:', data);







        // Update session ID



        sessionIdRef.current = data.sessionId



        console.log(`[AutoTermination] About to update state sessionId to: ${data.sessionId}`);



        setState(prev => {



          console.log(`[AutoTermination] State update - prev sessionId: ${prev.sessionId}, new sessionId: ${data.sessionId}`);



          return { ...prev, sessionId: data.sessionId }



        })



        



        // Save the real session ID for this specific student



        const studentSessionKey = `chatSessionId_${studentId}`



        sessionStorage.setItem(studentSessionKey, data.sessionId)



        



      } catch (error) {



        console.error('Failed to create chat session:', error)



        onError?.(error as Error)



        setState(prev => ({ ...prev, isLoading: false }))



        return // Stop execution if session creation fails



      }



    }







    const userMessage: Message = {



      id: crypto.randomUUID(),



      sender: "student",



      content: messageText,



      timestamp: new Date().toLocaleTimeString(),



    }







    // Add user message immediately



    setState(prev => ({



      ...prev,



      messages: [...prev.messages, userMessage],



      input: '',



      isLoading: true



    }))







    onMessage?.(userMessage)







    // Check for escalation indicators in the student's message



    console.log('[EscalationCheck] Analyzing message for escalation indicators');



    try {



      // Get conversation context for better analysis



      const conversationContext = state.messages



        .slice(-5) // Last 5 messages for context



        .map(msg => msg.content);







      // Analyze the message for escalation indicators



      const detection = await ContentEscalationDetector.analyzeMessage(



        messageText,



        studentId,



        sessionIdRef.current || 'unknown',



        conversationContext



      );







      console.log('[EscalationCheck] Detection result:', {



        isEscalation: detection.isEscalation,



        category: detection.category.type,



        level: detection.level.level,



        severity: detection.level.severity,



        confidence: detection.category.confidence



      });







      // If this is a valid escalation, create an alert and update state



      if (ContentEscalationDetector.isValidEscalation(detection)) {



        console.log('[EscalationCheck] Valid escalation detected, creating alert');



        



        try {



          // Create alert through API (this will be handled by the chat stream route too)



          const response = await fetch('/api/students/escalations', {



            method: 'POST',



            headers: {



              'Content-Type': 'application/json',



              'x-user-id': studentId



            },



            body: JSON.stringify({



              message: messageText,



              studentId,



              sessionId: sessionIdRef.current



            })



          });







          if (response.ok) {



            const alertData = await response.json();



            console.log('[EscalationCheck] Alert created successfully:', alertData.alert?.id);



            



            if (alertData.escalationDetected && alertData.alert) {



              const escalationAlert = {



                id: alertData.alert.id,



                category: alertData.alert.category,



                level: alertData.alert.level,



                severity: alertData.alert.severity,



                requiresImmediateAction: alertData.alert.requiresImmediateAction,



                recommendation: alertData.alert.recommendation



              };







              // Update state with escalation alert



              setState(prev => ({ ...prev, escalationAlert: escalationAlert }));



              



              // Call escalation callback



              onEscalation?.(escalationAlert);



              



              console.log('[EscalationCheck] Escalation alert set in state and callback triggered');



            }



          } else {



            console.error('[EscalationCheck] Failed to create escalation alert:', response.status);



          }



        } catch (error) {



          console.error('[EscalationCheck] Error creating escalation alert:', error);



          // Don't fail the chat request if alert creation fails



        }



      }



    } catch (error) {



      console.error('[EscalationCheck] Error in escalation detection:', error);



      // Don't fail the chat request if escalation detection fails



    }







    try {



      // Validate required fields before sending request



      console.log(`[SendMessage] Debug - sessionIdRef.current: ${sessionIdRef.current}, state.sessionId: ${state.sessionId}, isInitialized: ${isInitialized.current}`)



      



      if (!sessionIdRef.current) {



        // Try to create a new session if none exists



        if (!isInitialized.current && studentId) {



          console.log('[SendMessage] No session found, creating new session...')



          



          // Call the chat start API to create a real session



          const response = await fetch('/api/students/chat/start', {



            method: 'POST',



            headers: {



              'Content-Type': 'application/json',



              'x-user-id': studentId



            },



            body: JSON.stringify({



              studentId,



              skipImportSuggestion: true // Skip import when creating emergency session



            })



          })







          if (!response.ok) {



            const errorData = await response.json().catch(() => ({}))



            throw new Error(`Failed to create emergency session: ${response.status} - ${errorData.message || 'Unknown error'}`)



          }







          const data = await response.json()



          



          if (!data.success) {



            throw new Error(data.message || 'Failed to create emergency chat session')



          }







          // Set the real session ID from the API response



          sessionIdRef.current = data.sessionId



          setState(prev => ({ 



            ...prev, 



            sessionId: data.sessionId,



            sessionStartTime: Date.now()



          }))



          isInitialized.current = true



          console.log('[SendMessage] Created emergency session:', data.sessionId)



        } else {



          throw new Error(`No active session found. Session state: ref=${sessionIdRef.current}, state=${state.sessionId}, initialized=${isInitialized.current}`)



        }



      }



      



      if (!studentId) {



        throw new Error('Student ID is required')



      }



      



      if (!messageText || messageText.trim() === '') {



        throw new Error('Message cannot be empty')



      }







      const requestBody = {



        sessionId: sessionIdRef.current,



        studentId: studentId,



        message: messageText



      }



      



      console.log('Sending chat request:', requestBody)



      



      const response = await fetch('/api/students/chat/stream', {



        method: 'POST',



        headers: {



          'Content-Type': 'application/json',



          'x-user-id': studentId



        },



        body: JSON.stringify(requestBody)



      })







      if (!response.ok) {



        const errorData = await response.json().catch(() => ({}))



        console.error('Chat API error:', {



          status: response.status,



          statusText: response.statusText,



          error: errorData



        })



        throw new Error(`HTTP error! status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`)



      }







      const reader = response.body?.getReader()



      const decoder = new TextDecoder()



      let botReply = ''







      if (reader) {



        while (true) {



          const { done, value } = await reader.read()



          if (done) break







          botReply += decoder.decode(value)







          // Update streaming temporary message



          setState(prev => {



            const withoutTemp = prev.messages.filter(m => m.id !== "temp-bot")



            return {



              ...prev,



              messages: [



                ...withoutTemp,



                {



                  id: "temp-bot",



                  sender: "bot",



                  content: botReply,



                  timestamp: new Date().toLocaleTimeString(),



                  temp: true,



                },



              ]



            }



          })



        }



      }







      // Finalize the bot message



      setState(prev => {



        const withoutTemp = prev.messages.filter(m => m.id !== "temp-bot")



        return {



          ...prev,



          messages: [



            ...withoutTemp,



            {



              id: crypto.randomUUID(),



              sender: "bot",



              content: botReply,



              timestamp: new Date().toLocaleTimeString(),



            },



          ]



        }



      })







      onMessage?.(userMessage)







      // Note: Timer handles automatic termination, no need to check after each message







    } catch (error) {



      console.error('Failed to send message:', error)



      onError?.(error as Error)



    } finally {



      setState(prev => ({ ...prev, isLoading: false }))



    }



  }, [studentId, sessionIdRef, mood, triggers, notes, onMessage, onError, onEscalation, importData, state.messages])







  // End chat session and clean up



  const endChat = useCallback(async () => {



    try {



      if (sessionIdRef.current) {



        // Mark session as inactive in database



        await fetch(`/api/students/chat/end`, {



          method: 'POST',



          headers: {



            'Content-Type': 'application/json',



            'x-user-id': studentId



          },



          body: JSON.stringify({



            sessionId: sessionIdRef.current



          })



        })



      }







      // Clean up local state for this student



      const studentSessionKey = `chatSessionId_${studentId}`



      sessionStorage.removeItem(studentSessionKey)



      sessionIdRef.current = null



      sessionStartTimeRef.current = null



      isInitialized.current = false



      timerShouldBeActive.current = false



      



      setState(prev => ({ ...prev, sessionId: null, isLoading: false }))



      



    } catch (error) {



      console.error('Failed to end chat:', error)



      onError?.(error as Error)



    }



  }, [studentId, onError])







  // Fetch existing messages for a session



  const fetchExistingMessages = useCallback(async (sessionId: string) => {



    try {



      console.log(`[AutoTermination] Fetching existing messages for session: ${sessionId}`)



      



      const response = await fetch(`/api/students/chat/messages?sessionId=${sessionId}`)



      const data = await response.json()



      



      if (data.success && data.messages) {



        const formattedMessages: Message[] = data.messages.map((msg: any) => ({



          id: msg.id,



          sender: msg.role === 'user' ? 'student' : 'bot',



          content: msg.content,



          timestamp: msg.timestamp,



          type: 'normal'



        }))



        



        setState(prev => ({ ...prev, messages: formattedMessages }))



        



        // Restore session start time from database to continue timer correctly



        if (data.session && data.session.startedAt) {



          const sessionStartTime = new Date(data.session.startedAt).getTime();



          sessionStartTimeRef.current = sessionStartTime;



          setState(prev => ({ ...prev, sessionStartTime }));



          console.log(`[AutoTermination] Session loaded from database with start time: ${new Date(sessionStartTime).toISOString()}`);



        } else {



          console.log(`[AutoTermination] Session loaded but no start time found, timer will start when student sends first message`);



        }



        



        return data // Return the data so caller can check message count



      }



      



      return null



    } catch (error) {



      console.error('Failed to fetch existing messages:', error)



      return null



    }



  }, [studentId, state.sessionStartTime])







  // Initialize chat on mount



  useEffect(() => {



    const initializeChatOnMount = async () => {



      if (!isInitialized.current && studentId) {



        try {



          // Check for existing session for this specific student



          const studentSessionKey = `chatSessionId_${studentId}`



          let savedSessionId = sessionStorage.getItem(studentSessionKey)



          



          // If no session ID in sessionStorage, check database for an active session



          if (!savedSessionId) {



            console.log('No session ID in sessionStorage, checking database for active session for student:', studentId)



            try {



              const activeSessionResponse = await fetch(`/api/students/chat/active-session?studentId=${studentId}`)



              if (activeSessionResponse.ok) {



                const activeSessionData = await activeSessionResponse.json()



                if (activeSessionData.success && activeSessionData.activeSession) {



                  savedSessionId = activeSessionData.activeSession.id



                  if (savedSessionId) {



                    sessionStorage.setItem(studentSessionKey, savedSessionId)



                  }



                  console.log('Found active session in database, restoring:', savedSessionId)



                }



              }



            } catch (activeSessionError) {



              console.error('Failed to fetch active session from database:', activeSessionError)



            }



          }



          



          if (savedSessionId && !savedSessionId.startsWith('temp_')) {



            // Continue existing session



            sessionIdRef.current = savedSessionId



            setState(prev => ({ ...prev, sessionId: savedSessionId }))



            isInitialized.current = true



            console.log('Continuing existing chat session for student', studentId, ':', savedSessionId)



            



            // Fetch existing messages for this session (will also set session start time)



            const messageData = await fetchExistingMessages(savedSessionId)



            



            // If no messages exist in DB, create a fresh session with mood-based opening



            if (!messageData || messageData.messages.length === 0) {



              console.log('No messages in existing session, creating fresh session with mood data:', { mood, triggers, notes })



              // Clear the stale empty session and create a new one with mood context



              sessionStorage.removeItem(`chatSessionId_${studentId}`)



              sessionIdRef.current = null



              isInitialized.current = false



              await initializeChat(mood, triggers, notes)



            }



          } else {



            // Create new session with mood-aware opening message



            console.log('Creating new session with mood data:', { mood, triggers, notes })



            await initializeChat(mood, triggers, notes)



          }



        } catch (error) {



          console.error('Failed to initialize chat:', error)



          onError?.(error as Error)



        }



      }



    }







    initializeChatOnMount()



  }, [studentId, onError, initializeChat, mood, triggers, notes])







  // Import conversation messages from a previous session



  const importConversation = useCallback((messages: Message[], sessionId: string, sessionStartTime?: number) => {



    console.log(`[ImportConversation] Importing ${messages.length} messages for session ${sessionId}`)



    



    setState(prev => ({



      ...prev,



      messages: messages, // Replace messages, not append



      sessionId: sessionId,



      isLoading: false



    }))



    



    // Update refs



    sessionIdRef.current = sessionId



    isInitialized.current = true



    



    // Set session start time for imported session



    // Use provided session start time, or current time if not provided



    const startTime = sessionStartTime || Date.now()



    sessionStartTimeRef.current = startTime



    setState(prev => ({ ...prev, sessionStartTime: startTime }))



    



    console.log(`[ImportConversation] Session imported successfully with start time: ${new Date(startTime).toISOString()}`)



  }, [])







  // Return the hook's public interface



  return {



    ...state,



    input: state.input,



    chatRef,



    sendMessage,



    setInput,



    initializeChat,



    endChat,



    importConversation,



  }



}