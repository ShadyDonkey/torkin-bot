import { MessageFlags } from 'discord-api-types/v10'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { buildDetailsComponent } from '@/server/bot/utilities/tmdb'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { unwrap } from '@/shared/utilities'

export const pattern = 'find-view-details-:id'

export default async function (interaction: MessageComponentInteraction, args: { id: string }) {
  if (!interaction.message.interaction_metadata) {
    return interaction.update({
      components: [TextDisplay('No interaction found on the original message.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdFindCacheEntry>(KEYV_CONFIG.cmd.find.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    console.error({ cacheErr, cached })
    return interaction.update({
      components: [TextDisplay('Could not retrieve cached search results, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const components = await buildDetailsComponent(args.id, cached.searchType)

  return interaction.update({
    components,
    flags: MessageFlags.IsComponentsV2,
  })
}
