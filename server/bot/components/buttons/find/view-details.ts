import { MessageFlags } from 'discord-api-types/v10'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { updateResponse } from '@/server/bot/utilities/response'
import { buildDetailsComponent } from '@/server/bot/utilities/tmdb'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { unwrap } from '@/server/utilities'

export const pattern = 'find-view-details-:id'

export default async function (interaction: MessageComponentInteraction, args: { id: string }) {
  if (!interaction.message.interaction_metadata) {
    return updateResponse(interaction, {
      components: [TextDisplay('No interaction found on the original message.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdFindCacheEntry>(KEYV_CONFIG.cmd.find.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    console.error({ cacheErr, cached })
    return updateResponse(interaction, {
      components: [TextDisplay('Could not retrieve cached search results, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  if (interaction.user.id !== cached.userId) {
    return interaction.reply({
      content: "You cannot interact with another user's search results.",
      ephemeral: true,
    })
  }

  const components = await buildDetailsComponent(args.id, cached.searchType)

  return updateResponse(interaction, {
    components,
    flags: MessageFlags.IsComponentsV2,
  })
}
