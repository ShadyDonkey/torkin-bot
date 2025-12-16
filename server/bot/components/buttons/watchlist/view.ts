import type { Params } from '@dressed/matcher'
import { codeBlock } from 'discord-fmt'
import { ActionRow, Button, type MessageComponentInteraction, TextDisplay } from 'dressed'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import { WatchlistState } from '@/server/zenstack/models'

export const pattern = 'watchlist-view-:id{-:originPage}'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
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

  if (watchlist.state === WatchlistState.PRIVATE && watchlist.discordUserId !== interaction.user.id) {
    return await interaction.updateResponse({ content: 'You do not have permission to view this watchlist.' })
  }

  return await interaction.updateResponse({
    components: [
      TextDisplay(`Watchlist fetched successfully.\n${codeBlock(JSON.stringify(watchlist, null, 2))}`),
      ActionRow(
        Button({
          label: 'Go to list',
          style: 'Primary',
          custom_id: 'watchlist-goto-1',
        }),
      ),
    ],
  })

  // TODO: if origin page, add "go to list" button
  // if owner, add manage button and have manage page.
  // if not owner, add owner mention/link
}
