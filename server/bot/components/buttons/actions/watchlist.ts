import type { Params } from '@dressed/matcher'
import { MessageFlags } from 'discord-api-types/v10'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import { db, PG_ERROR } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import { addItemToWatchlist, removeItemFromWatchlist } from '@/server/utilities/db/watchlist'
import { WatchlistState } from '@/server/zenstack/models'

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
      // TODO: Make this a helper function and remove this
      if ('dbErrorCode' in err) {
        switch (err.dbErrorCode) {
          case PG_ERROR.UNIQUE_VIOLATION:
            return await interaction.editReply({
              components: [TextDisplay('Item is already in watchlist')],
              flags: MessageFlags.IsComponentsV2,
            })
          default:
            console.error(err)
            return await interaction.editReply({
              components: [TextDisplay('Failed to add item to watchlist due to unknown DB error')],
              flags: MessageFlags.IsComponentsV2,
            })
        }
      }

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

  let watchlist = await db.watchlist.findFirst({
    where: {
      discordUserId: userId,
      default: true,
    },
    select: {
      id: true,
    },
  })

  if (!watchlist) {
    console.error('No default watchlist found for user', userId)

    watchlist = await db.watchlist.create({
      data: {
        default: true,
        discordUserId: userId,
        name: 'My Watchlist',
        state: WatchlistState.PUBLIC,
        createdBy: userId,
      },
    })
  }

  return watchlist.id
}
