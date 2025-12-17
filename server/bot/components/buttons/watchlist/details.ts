import type { Params } from '@dressed/matcher'
import { count } from 'console'
import { MessageFlags } from 'discord-api-types/v10'
import { bold, codeBlock, h2, link, list, subtext } from 'discord-fmt'
import { ActionRow, Button, Container, type MessageComponentInteraction, Separator, TextDisplay } from 'dressed'
import { convertStateToLabel } from '@/server/bot/utilities/commands/watchlist'
import { watchlistIdToUrl } from '@/server/bot/utilities/website'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import { WatchlistState } from '@/server/zenstack/models'

export const pattern = 'watchlist-details-:id{-:originPage}'

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

  const { id, originPage } = args

  await interaction.deferUpdate()

  const [err, watchlist] = await unwrap(db.watchlist.findFirst({ where: { id, discordUserId: interaction.user.id } }))

  if (err) {
    console.error(err)
    return await interaction.updateResponse({ content: 'An error occurred while fetching the watchlist.' })
  }

  if (!watchlist) {
    return await interaction.updateResponse({ content: 'Watchlist not found.' })
  }

  // if (watchlist.state === WatchlistState.PRIVATE && watchlist.discordUserId !== interaction.user.id) {
  //   return await interaction.updateResponse({ content: 'You do not have permission to view this watchlist.' })
  // }

  const count = await db.watchlistItem.count({ where: { watchlistId: watchlist.id } })

  let body = bold(`${watchlist.name ?? 'Unnamed Watchlist'} - ${convertStateToLabel(watchlist.state)}`)
  body += `\n${subtext(`${count} Items`)}`

  if (watchlist.description) {
    body += `\n\n${watchlist.description}`
  }

  body += `\n\n${subtext(link('View on Torkin ↗', watchlistIdToUrl(watchlist.id)))}`

  return await interaction.updateResponse({
    components: [
      // TextDisplay(`Watchlist fetched successfully.\n${codeBlock(JSON.stringify(watchlist, null, 2))}`),

      Container(TextDisplay(body)),
      ActionRow(
        Button({
          custom_id: `watchlist-goto-${originPage || '1'}-back`,
          label: originPage ? 'Back to Lists' : 'Show All Lists',
          style: 'Primary',
        }),
      ),
    ],
  })

  // TODO: if origin page, add "go to list" button
  // if owner, add manage button and have manage page.
  // if not owner, add owner mention/link
}
