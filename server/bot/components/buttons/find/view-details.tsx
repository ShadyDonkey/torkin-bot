import type { Params } from '@dressed/matcher'
import type { MessageComponentInteraction } from '@dressed/react'
import { BackButton, ItemActions } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { buildSelectionDetails } from '@/server/bot/utilities/tmdb'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { unwrap } from '@/server/utilities'

export const pattern = 'find-view-details-:id{-:originPage}'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdFindCacheEntry>(KEYV_CONFIG.cmd.find.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
    return await interaction.updateResponse('Could not retrieve cached search results, please try again later.')
  }

  return await interaction.updateResponse(
    <>
      {await buildSelectionDetails(args.id, cached.searchType)}
      <ItemActions id={args.id} type={cached.searchType}>
        <BackButton prefix="find" page={args.originPage} title="Results" />
      </ItemActions>
    </>,
  )
}
