import { createAPIHandler } from '@/src/lib/api'
import { TriggerSelectionSchema } from '@/src/lib/validation/api-schemas'
import { TriggerService } from '@/src/services/chats'

export const dynamic = 'force-dynamic'

export const POST = createAPIHandler.post(
  TriggerSelectionSchema,
  async ({ triggers }, context) => {
    return await TriggerService.createTriggerSelection({
      studentId: context.id,
      triggers
    })
  },
  { requireAuth: true }
)
