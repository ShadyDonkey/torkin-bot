// import type { Params } from '@dressed/matcher'
// import type { MessageComponentInteraction } from '@dressed/react'
// import { logger } from '@/server/bot/utilities/logger'
// import { db, PG_ERROR } from '@/server/lib/db'
// import { unwrap } from '@/server/utilities'
// import { addItemToWatchlist, removeItemFromWatchlist } from '@/server/utilities/db/watchlist'
// import { WatchlistItemType, WatchlistState } from '@/server/zenstack/models'

// export const pattern = 'action-watchlist-:action(add|remove)-:id-:type(movie|tv)-:list(default|other)'

// export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
//   if (!interaction.message.interaction_metadata) {
//     return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
//   }

//   // TODO: Change this behavior to update the original interaction IF the metadata interaction user is the same as the interaction user

//   await interaction.deferReply({ ephemeral: true })

//   const watchlistId = await getWatchlistId(interaction.user.id, args)

//   if (args.action === 'add') {
//     const [err] = await unwrap(
//       addItemToWatchlist({
//         discordUserId: interaction.user.id,
//         watchlistId: watchlistId,
//         externalId: args.id,
//         externalProvider: 'tmdb',
//         type: args.type === 'movie' ? WatchlistItemType.MOVIE : WatchlistItemType.TV,
//       }),
//     )

//     if (err) {
//       // TODO: Make this a helper function and remove this
//       if ('dbErrorCode' in err) {
//         switch (err.dbErrorCode) {
//           case PG_ERROR.UNIQUE_VIOLATION:
//             return await interaction.editReply('Item is already in watchlist')
//           default:
//             logger.error(err)
//             return await interaction.editReply('Failed to add item to watchlist due to unknown DB error')
//         }
//       }

//       logger.error(err)
//       return await interaction.editReply('Failed to add item to watchlist')
//     }

//     return await interaction.editReply('Item has been added to watchlist')
//   } else if (args.action === 'remove') {
//     const [err] = await unwrap(
//       removeItemFromWatchlist({
//         discordUserId: interaction.user.id,
//         watchlistId: watchlistId,
//         externalId: args.id,
//         externalProvider: 'tmdb',
//       }),
//     )

//     if (err) {
//       logger.error(err)

//       return await interaction.editReply('Failed to remove item from watchlist')
//     }

//     return await interaction.editReply('Item has been removed from watchlist')
//   }
// }

// async function getWatchlistId(userId: string, _args: Params<typeof pattern>) {
//   // TODO: Support other watchlist handling

//   let watchlist = await db.watchlist.findFirst({
//     where: {
//       discordUserId: userId,
//       default: true,
//     },
//     select: {
//       id: true,
//     },
//   })

//   if (!watchlist) {
//     logger.error(
//       {
//         userId,
//       },
//       'No default watchlist found for user',
//     )

//     watchlist = await db.watchlist.create({
//       data: {
//         default: true,
//         discordUserId: userId,
//         name: 'My Watchlist',
//         state: WatchlistState.PUBLIC,
//         createdBy: userId,
//       },
//     })
//   }

//   return watchlist.id
// }
