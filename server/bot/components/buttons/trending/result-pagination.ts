import type { Params } from '@dressed/matcher'
import type { MessageComponentInteraction } from '@dressed/react'
import { handlePagination } from '@/server/bot/utilities/commands/trending'

export const pattern = 'trending-goto-:page(\\d+)-:throwaway'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  return await handlePagination(interaction, Number.parseInt(args.page, 10))
}
