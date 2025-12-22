import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/builders'
import { buildListComponents } from '@/server/bot/utilities/commands/watchlist'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'

export const pattern = 'watchlist-items-:id-goto-:page(\\d+)-:throwaway'

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
  const watchlistId = args.id

  await interaction.deferUpdate()

  const take = 5
  const skip = (page - 1) * take

  const [dbErr, results] = await unwrap(
    db.watchlistItem.findMany({
      where: {
        watchlistId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    }),
  )

  if (dbErr) {
    console.error(dbErr)
    return await interaction.updateResponse({
      components: [TextDisplay('Error fetching watchlist items.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const count = await db.watchlistItem.count({
    where: {
      watchlistId,
    },
  })
  const totalPages = Math.ceil(count / take)
  const paginationButtons = buildPaginationButtons(page, totalPages, `watchlist-items-${watchlistId}`)

  // Get results from TMDB for each entry
  // Promise all
  // Result map into Discord components

  const providerResults = await Promise.all(
    results.map(async (item) => {
      // const [err, result] = unwrap(getDetail)
      // const [err, result] = await unwrap(provider.search(item.title))
      // return result
    }),
  )

  return await interaction.updateResponse({
    components: [paginationButtons],
    flags: MessageFlags.IsComponentsV2,
  })
}
