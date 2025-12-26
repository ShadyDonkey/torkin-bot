import type { Params } from '@dressed/matcher'
import type { MessageComponentInteraction } from '@dressed/react'
import { BackButton, ItemActions } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { buildSelectionDetails } from '@/server/bot/utilities/tmdb'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { unwrap } from '@/server/utilities'

export const pattern = 'trending-view-details-:id{-:originPage}'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdTrendingCacheEntry>(KEYV_CONFIG.cmd.trending.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
    return await interaction.updateResponse('Could not retrieve cached trending results, please try again later.')
  }

  return await interaction.updateResponse(
    <>
      {await buildSelectionDetails(args.id, cached.type)}
      <ItemActions id={args.id} type={cached.type}>
        <BackButton prefix="trending" page={args.originPage} title="Trending" />
      </ItemActions>
    </>,
  )
}
