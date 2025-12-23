import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { ActionRow, Button, type MessageComponentInteraction, TextDisplay } from 'dressed'
import { buildDetailsComponent } from '@/server/bot/utilities/tmdb'

export const pattern = 'watchlist-:watchlistId-item-details-:id-:type(movie|tv){-:originPage}'

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

  const { watchlistId, id, originPage, type } = args

  return await interaction.updateResponse({
    components: [
      ...(await buildDetailsComponent(id, type)),
      ActionRow(
        Button({
          custom_id: `watchlist-${watchlistId}-items-goto-${originPage ?? '1'}-back`,
          label: originPage ? 'Back' : 'See All Items',
          style: 'Secondary',
        }),
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
  })
}
