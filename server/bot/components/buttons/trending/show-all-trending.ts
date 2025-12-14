import type { MessageComponentInteraction } from 'dressed'
import { handlePagination } from '@/server/bot/utilities/commands/trending'

export const pattern = 'trending-all-results'

export default async function (interaction: MessageComponentInteraction) {
  await handlePagination(interaction, 1)
}
