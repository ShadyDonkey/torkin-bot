import type { Params } from '@dressed/matcher'
import type { MessageComponentInteraction } from 'dressed'
import { paginateSearch } from '@/server/bot/utilities/pagination'

export const pattern = 'find-goto-:page(\\d+)-:throwaway'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  await paginateSearch(interaction, Number.parseInt(args.page, 10))
}
