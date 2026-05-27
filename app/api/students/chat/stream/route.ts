import { NextResponse } from "next/server";
import prisma from "@/src/prisma";
import OpenAI from "openai";
import { PSYCHOLOGY_BUDDY_SYSTEM_PROMPT } from "@/src/lib/ai/prompts/system-prompt";
import { ContentEscalationDetector } from "@/src/services/escalations/content-escalation-detector";
import { EscalationAlertService } from "@/src/services/escalations/escalation-alert-service";
import { EscalationPipeline } from "@/src/services/escalations/escalation-pipeline";
import { AISafetyGuardrails } from "@/src/lib/ai/safety-guardrails";
import { buildConversationContext, formatMessagesForAI, estimateTokens, countMessageTokens } from "@/src/lib/ai/context-manager";

// Initialize OpenAI with error handling
let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
  openai = null as any;
}

export async function POST(req: Request) {
  try {
    const { message, studentId, sessionId } = await req.json();

    console.log('[ChatStream] Request received:', { studentId, sessionId, messageLength: message?.length });

    if (!message || !studentId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('Chat stream request:', { message, studentId, sessionId });

    // Verify that the chat session exists and belongs to the student
    // First get the user ID from studentId
    const user = await prisma.user.findUnique({
      where: { studentId: studentId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
        isActive: true
      }
    });

    console.log('Session lookup result:', session);

    if (!session) {
      // Try to find any session for this student to help debug
      const anySession = await prisma.chatSession.findFirst({
        where: {
          user: {
            studentId: studentId
          }
        }
      });
      console.log('Any session found for student:', anySession?.id);
      
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Get recent conversation history for context (limit to last 10 messages for performance)
    const conversationHistory = await prisma.chatMessage.findMany({
      where: {
        sessionId: sessionId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
    });

    console.log('Conversation history loaded:', conversationHistory.length, 'messages');

    // Save student message
    console.log('Saving student message for session:', sessionId);
    const studentMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: "STUDENT",
        content: message,
      },
    });
    console.log('Student message saved:', studentMessage.id);

    // Reverse to get chronological order and format for escalation detection
    const chronologicalHistory = conversationHistory.reverse();
    const conversationContext = chronologicalHistory
      .filter(msg => msg.senderType === 'STUDENT')
      .map(msg => msg.content);

    // Run escalation detection asynchronously (fire and forget) to not block response
    console.log('[EscalationCheck] Running escalation detection asynchronously');
    (async () => {
      try {
        // Use AI-powered escalation pipeline
        const pipeline = new EscalationPipeline();
        const pipelineResult = await pipeline.executePipeline(
          message,
          conversationContext,
          studentId,
          sessionId
        );

        console.log('[EscalationCheck] AI Pipeline result:', {
          success: pipelineResult.success,
          isEscalation: pipelineResult.detection?.isEscalation,
          riskLevel: pipelineResult.detection?.riskAssessment.overallRiskLevel,
          riskScore: pipelineResult.detection?.riskAssessment.riskScore,
          alertCreated: pipelineResult.alertCreated,
          notificationsSent: pipelineResult.notificationsSent
        });

        // If AI pipeline failed, fall back to keyword-based detection
        if (!pipelineResult.success) {
          console.log('[EscalationCheck] AI pipeline failed, falling back to keyword detection');
          const keywordDetection = await ContentEscalationDetector.analyzeMessage(
            message,
            studentId,
            sessionId,
            conversationContext
          );

          if (ContentEscalationDetector.isValidEscalation(keywordDetection)) {
            console.log('[EscalationCheck] Keyword-based escalation detected');
            // Create alert using existing service
            try {
              const alert = await EscalationAlertService.createEscalationAlert(
                studentId,
                sessionId,
                keywordDetection,
                message,
                studentMessage.createdAt.toISOString()
              );
              console.log('[EscalationCheck] Fallback alert created:', alert.id);
            } catch (error) {
              console.error('[EscalationCheck] Failed to create fallback alert:', error);
            }
          }
        }
      } catch (error) {
        console.error('[EscalationCheck] Error in AI escalation detection:', error);
        // Don't fail the chat request if escalation detection fails
      }
    })();

    // Try to get AI response with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Format conversation history for AI (use chronological order)
        const formattedHistory = formatMessagesForAI(chronologicalHistory);
        
        // Build conversation context with smart memory management
        const messagesForAI = await buildConversationContext(
          PSYCHOLOGY_BUDDY_SYSTEM_PROMPT,
          formattedHistory,
          message,
          openai
        );

        console.log('Sending to AI with context:', messagesForAI.length, 'messages');
        console.log('Total estimated tokens:', estimateTokens(PSYCHOLOGY_BUDDY_SYSTEM_PROMPT) + countMessageTokens(formattedHistory) + estimateTokens(message));

        const stream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messagesForAI,
          max_tokens: 150,  // Prevents long-winded "AI monologues" 
          temperature: 0.7,  // Keeps it creative but grounded
          frequency_penalty: 0.5,  // Reduces repetition
          stream: true,
        });

        const responseStream = new ReadableStream({
          async start(controller) {
            try {
              let rawResponse = "";
              
              // Stream chunks in real-time instead of collecting all first
              for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                  rawResponse += content;
                  // Send chunk immediately for real-time streaming
                  controller.enqueue(new TextEncoder().encode(content));
                }
              }

              console.log('AI response complete:', rawResponse);
              
              // Save bot reply message asynchronously after streaming is complete
              (async () => {
                try {
                  console.log('Saving bot message for session:', sessionId);
                  const botMessage = await prisma.chatMessage.create({
                    data: {
                      sessionId,
                      senderType: "BOT",
                      content: rawResponse,
                    },
                  });
                  console.log('Bot message saved:', botMessage.id);
                } catch (error) {
                  console.error('Failed to save bot message:', error);
                }
              })();
              
              controller.close();
            } catch (error) {
              console.error("Stream error:", error);
              controller.error(error);
            }
          },
        });

        return new Response(responseStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
          },
        });
      } catch (error: any) {
        if (error.message.includes('429') && retryCount < maxRetries - 1) {
          retryCount++;
          const delayMs = Math.pow(2, retryCount) * 1000;
          console.log(`Stream rate limited, retrying in ${delayMs}ms (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        console.log(`Stream AI request failed: ${error.message}`);
        break;
      }
    }
    
    // If all retries fail, send a fallback response
    const fallbackMessage = "I understand you're sharing something important. I'm Psychology Buddy, and sometimes the AI service might be busy, but I'm here to listen. Could you tell me more about what's on your mind?";
    console.log("Using fallback response");
    
    const fallbackStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fallbackMessage));
        controller.close();
      },
    });

    return new Response(fallbackStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Chat stream error:", err);
    
    if (err instanceof Error && err.message.includes('429')) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again in a few moments." },
        { status: 429 }
      );
    }
    
    if (err instanceof Error && err.message.includes('API key')) {
      return NextResponse.json(
        { error: "OpenAI service configuration error. Please contact support." },
        { status: 500 }
      );
    }
    
    if (err instanceof Error && err.message.includes('insufficient_quota')) {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Please check your billing details." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

