import { ReadonlyURLSearchParams } from 'next/navigation';

export interface ChatParams {
  mood?: string;
  triggers?: string[];
  notes?: string;
  moodCheckinId?: string;
  triggerId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
}

export class SearchParamsUtils {
  static extractChatParams(searchParams: ReadonlyURLSearchParams): ChatParams {
    const params: ChatParams = {};

    // Extract mood
    const mood = searchParams.get('mood');
    if (mood) {
      params.mood = mood;
    }

    // Extract triggers (comma-separated)
    const triggers = searchParams.get('triggers');
    if (triggers) {
      params.triggers = triggers.split(',').map(t => t.trim()).filter(t => t);
    }

    // Extract notes
    const notes = searchParams.get('notes');
    if (notes) {
      params.notes = notes;
    }

    // Extract mood checkin ID
    const moodCheckinId = searchParams.get('moodCheckinId');
    if (moodCheckinId) {
      params.moodCheckinId = moodCheckinId;
    }

    // Extract trigger ID
    const triggerId = searchParams.get('triggerId');
    if (triggerId) {
      params.triggerId = triggerId;
    }

    return params;
  }

  static validateChatParams(params: ChatParams): ValidationResult {
    const missing: string[] = [];

    // For now, we don't require any specific parameters
    // The chat system can work without mood checkin parameters
    // This validation can be enhanced later if needed

    return {
      isValid: missing.length === 0,
      missing
    };
  }
}
