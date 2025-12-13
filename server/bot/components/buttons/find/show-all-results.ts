import type { MessageComponentInteraction } from 'dressed'
import { paginateSearch } from '@/server/bot/utilities/find/pagination'

export const pattern = 'find-all-results'

export default async function (interaction: MessageComponentInteraction) {
  await paginateSearch(interaction, 1)
}
