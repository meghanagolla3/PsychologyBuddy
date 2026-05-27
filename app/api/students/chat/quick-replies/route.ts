import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { mood, triggers, notes, botMessage, lastMessages, messageCount } = await req.json();

    console.log('Quick replies request:', { mood, triggers, notes, botMessage, messageCount });

    // Build context for generating quick replies
    let context = "";
    
    if (mood) {
      context += `Current Mood: ${mood}\n`;
    }
    
    if (triggers?.length) {
      context += `Triggers/Concerns: ${triggers.join(", ")}\n`;
    }
    
    if (notes) {
      context += `Additional Notes: ${notes}\n`;
    }

    if (botMessage) {
      context += `Buddy's Last Message: ${botMessage}\n`;
    }
    
    if (messageCount === 0) {
      context += `Conversation Stage: Just starting\n`;
    } else if (messageCount < 5) {
      context += `Conversation Stage: Early conversation (${messageCount} messages)\n`;
    } else {
      context += `Conversation Stage: Ongoing conversation (${messageCount} messages)\n`;
    }
    
    if (lastMessages?.length) {
      context += `\nRecent Context:\n`;
      lastMessages.slice(-2).forEach((msg: any, idx: number) => {
        const role = msg.sender === 'student' ? 'Student' : 'Buddy';
        context += `${role}: ${msg.content.substring(0, 100)}...\n`;
      });
    }

    // Generate quick replies using OpenAI
    const prompt = `You are Buddy, a supportive AI friend for students.

${context}

TASK:
Generate 3-4 quick reply suggestions that are DIRECT responses to Buddy's last message above.

CRITICAL RULES:
- Each reply MUST be a direct response to what Buddy just said
- If Buddy asked a question, provide answers to that question
- If Buddy made a statement, provide reactions or follow-up thoughts
- If Buddy offered help, provide acceptance, decline, or specific requests
- Keep replies short and natural (3-8 words each)
- Make them empathetic and authentic

EXAMPLES:
- If Buddy asks "How are you feeling today?": ["I'm feeling anxious", "Pretty good thanks", "A bit overwhelmed"]
- If Buddy says "I'm here to listen": ["I need to talk about stress", "Thanks for being here", "Can you help me?"]
- If Buddy suggests "Try taking deep breaths": ["I'll try that now", "Does that really help?", "What else can I do?"]

Return ONLY a JSON array of strings, like:
["I'm feeling overwhelmed", "Can we talk about exams?", "I need some advice"]

No explanations, no markdown, just the JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log('OpenAI response:', content);

    // Parse the JSON response
    let quickReplies: string[] = [];
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        quickReplies = parsed.slice(0, 4).filter((reply: any) => 
          typeof reply === 'string' && reply.length > 0 && reply.length < 50
        );
      }
    } catch (parseError) {
      console.error('Failed to parse quick replies as JSON:', parseError);
      // Fallback: extract lines that look like replies
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => 
          line.length > 0 && 
          line.length < 50 &&
          !line.startsWith('-') &&
          !line.startsWith('*')
        );
      quickReplies = lines.slice(0, 4);
    }

    // If still no valid replies, use fallback based on mood
    if (quickReplies.length === 0) {
      quickReplies = getFallbackQuickReplies(mood, triggers);
    }

    console.log('Generated quick replies:', quickReplies);

    return NextResponse.json({
      success: true,
      quickReplies,
    });
  } catch (error) {
    console.error('Error generating quick replies:', error);
    
    // Return fallback replies on error
    const { mood, triggers } = await req.json().catch(() => ({}));
    const fallbackReplies = getFallbackQuickReplies(mood, triggers);
    
    return NextResponse.json({
      success: true,
      quickReplies: fallbackReplies,
    });
  }
}

function getFallbackQuickReplies(mood?: string, triggers?: string[]): string[] {
  const moodReplies: Record<string, string[]> = {
    "Happy": ["I'm feeling great today", "Want to hear something good?", "I'm in a good mood"],
    "Okay": ["I'm doing alright", "Just checking in", "How are you doing?"],
    "Sad": ["I'm feeling down", "I need to talk", "Can you help me?"],
    "Anxious": ["I'm feeling anxious", "I'm worried about something", "I need to calm down"],
    "Tired": ["I'm exhausted", "I need a break", "I'm feeling drained"],
  };

  const triggerReplies: Record<string, string[]> = {
    "exams": ["I'm stressed about exams", "Can we talk about studying?", "I need exam tips"],
    "family": ["Family issues are bothering me", "I'm having family problems", "Can we talk about family?"],
    "friends": ["Friendship problems", "I'm having issues with friends", "Can you help with friendships?"],
    "sleep": ["I can't sleep well", "I need better sleep", "I'm always tired"],
    "school": ["School is overwhelming", "I need help with school work", "Can we talk about school?"],
    "health": ["I'm worried about my health", "I need health advice", "Can we talk about wellness?"],
  };

  // Try mood-based replies first
  if (mood && moodReplies[mood]) {
    return moodReplies[mood];
  }

  // Try trigger-based replies
  if (triggers?.length) {
    for (const trigger of triggers) {
      if (triggerReplies[trigger]) {
        return triggerReplies[trigger];
      }
    }
  }

  // Default fallback
  return ["I'm feeling anxious", "I need help with stress", "I'm feeling sad"];
}
