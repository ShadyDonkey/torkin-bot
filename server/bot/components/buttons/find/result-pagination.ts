import type { MessageComponentInteraction } from 'dressed'
import { paginateSearch } from '@/server/bot/utilities/find/pagination'

export const pattern = 'find-goto-:page(\\d+)-:throwaway'

export default async function (interaction: MessageComponentInteraction, args: { page: string }) {
  await paginateSearch(interaction, Number.parseInt(args.page, 10))
}
