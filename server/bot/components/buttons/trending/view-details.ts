import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { ActionRow, Button, type MessageComponentInteraction, TextDisplay } from 'dressed'
import { buildItemActions } from '@/server/bot/utilities/builders'
import { buildDetailsComponent } from '@/server/bot/utilities/tmdb'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { unwrap } from '@/server/utilities'

export const pattern = 'trending-view-details-:id{-:originPage}'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply({
      components: [TextDisplay('No interaction found on the original message.')],
      ephemeral: true,
      flags: MessageFlags.IsComponentsV2,
    })
  }

  if (interaction.message.interaction_metadata.user.id !== interaction.user.id) {
    return await interaction.reply({
      components: [TextDisplay('This interaction is not for you.')],
      ephemeral: true,
      flags: MessageFlags.IsComponentsV2,
    })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdTrendingCacheEntry>(KEYV_CONFIG.cmd.trending.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    console.error({ cacheErr, cached })
    return await interaction.updateResponse({
      components: [TextDisplay('Could not retrieve cached trending results, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  if (interaction.user.id !== cached.userId) {
    return await interaction.reply({
      content: "You cannot interact with another user's search results.",
      ephemeral: true,
    })
  }
  return await interaction.updateResponse({
    components: [
      ...(await buildDetailsComponent(args.id, cached.type)),
      ...buildItemActions(args.id, cached.type),
      ActionRow(Button({ custom_id: `trending-goto-${args.originPage ?? 1}-back`, label: 'Back to Trending' })),
    ],
    flags: MessageFlags.IsComponentsV2,
  })
}
