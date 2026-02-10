import { createAPIHandler } from '@/src/lib/create-api-handler'
import { MoodCheckinSchema } from '@/src/lib/validation/api-schemas'
import { MoodService } from '@/src/services/chats'

export const dynamic = 'force-dynamic'

export const POST = createAPIHandler.post(
  MoodCheckinSchema,
  async ({ mood, triggers, notes }, context) => {
    return await MoodService.createMoodCheckin({
      studentId: context.id,
      mood, 
      triggers,
      notes
    })
  },
  { requireAuth: true }
)
