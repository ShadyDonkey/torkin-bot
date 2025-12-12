import type { MessageComponentInteraction } from 'dressed'
import { paginateSearch } from '@/server/bot/utilities/pagination'

export const pattern = 'find-goto-:page(\\d+)'

export default async function (interaction: MessageComponentInteraction) {
  await paginateSearch(interaction, 1)
}
