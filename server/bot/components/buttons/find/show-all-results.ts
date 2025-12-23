import type { MessageComponentInteraction } from 'dressed'
import { paginateSearch } from '@/server/bot/utilities/commands/find'

export const pattern = 'find-all-results'

export default async function (interaction: MessageComponentInteraction) {
  return await paginateSearch(interaction, 1)
}
