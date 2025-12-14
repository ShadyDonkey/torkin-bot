import type { Params } from '@dressed/matcher'
import type { MessageComponentInteraction } from 'dressed'
import { handlePagination } from '@/server/bot/utilities/commands/trending'

export const pattern = 'trending-goto-:page(\\d+)-:throwaway'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  await handlePagination(interaction, Number.parseInt(args.page, 10))
}
