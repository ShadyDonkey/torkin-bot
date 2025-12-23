import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { buildListComponents } from '@/server/bot/utilities/commands/watchlist'

export const pattern = 'watchlist-results-goto-:page(\\d+)-:throwaway'

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

  const page = Number.parseInt(args.page, 10)
  await interaction.deferUpdate()

  return await interaction.updateResponse({
    components: await buildListComponents(interaction.message.interaction_metadata.user.id, page),
    flags: MessageFlags.IsComponentsV2,
  })
}
