import type { MessageComponentInteraction } from '@dressed/react'
import { handlePagination } from '@/server/bot/utilities/commands/trending'

export const pattern = 'trending-all-results'

export default async function (interaction: MessageComponentInteraction) {
  return await handlePagination(interaction, 1)
}
