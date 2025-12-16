import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { codeBlock } from 'discord-fmt'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { buildListComponents } from '@/server/bot/utilities/commands/watchlist'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'

export const pattern = 'watchlist-goto-:page(\\d+)-:throwaway'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  const page = Number.parseInt(args.page, 10)
  await interaction.deferUpdate()

  if (!interaction.message.interaction_metadata) {
    return await interaction.updateResponse({
      components: [TextDisplay('No interaction found on the original message.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  return await interaction.updateResponse({
    components: await buildListComponents(interaction.message.interaction_metadata.user.id, page),
    flags: MessageFlags.IsComponentsV2,
  })
}
