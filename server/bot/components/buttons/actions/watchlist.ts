import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import { addItemToWatchlist, removeItemFromWatchlist } from '@/server/utilities/db/watchlist'

export const pattern = 'action-watchlist-:action(add|remove)-:id-:list(default|other)'

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

  // TODO: Change this behavior to update the original interaction IF the metadata interaction user is the same as the interaction user

  await interaction.deferReply({
    ephemeral: true,
  })

  const watchlistId = await getWatchlistId(interaction.user.id, args)

  if (args.action === 'add') {
    const [err] = await unwrap(
      addItemToWatchlist({
        discordUserId: interaction.user.id,
        watchlistId: watchlistId,
        externalId: args.id,
        externalProvider: 'tmdb',
      }),
    )

    if (err) {
      console.error(err)
      return await interaction.editReply({
        components: [TextDisplay('Failed to add item to watchlist')],
        flags: MessageFlags.IsComponentsV2,
      })
    }

    return await interaction.editReply({
      components: [TextDisplay('Item has been added to watchlist')],
      flags: MessageFlags.IsComponentsV2,
    })
  } else if (args.action === 'remove') {
    const [err] = await unwrap(
      removeItemFromWatchlist({
        discordUserId: interaction.user.id,
        watchlistId: watchlistId,
        externalId: args.id,
        externalProvider: 'tmdb',
      }),
    )

    if (err) {
      console.error(err)
      return await interaction.editReply({
        components: [TextDisplay('Failed to remove item from watchlist')],
        flags: MessageFlags.IsComponentsV2,
      })
    }

    return await interaction.editReply({
      components: [TextDisplay('Item has been removed from watchlist')],
      flags: MessageFlags.IsComponentsV2,
    })
  }
}

async function getWatchlistId(userId: string, _args: Params<typeof pattern>) {
  // TODO: Support other watchlist handling

  const watchlist = await db.watchlist.findFirstOrThrow({
    where: {
      discordUserId: userId,
      default: true,
    },
    select: {
      id: true,
    },
  })

  return watchlist.id
}
