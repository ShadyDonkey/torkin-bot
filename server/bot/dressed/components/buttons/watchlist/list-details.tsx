// import type { Params } from '@dressed/matcher'
// import { ActionRow, Container, type MessageComponentInteraction, TextDisplay } from '@dressed/react'
// import { h2, link, subtext } from 'discord-fmt'
// import { BackButton } from '@/server/bot/components/builders'
// import { convertStateToLabel } from '@/server/bot/components/commands/watchlist'
// import { logger } from '@/server/bot/utilities/logger'
// import { watchlistIdToUrl } from '@/server/bot/utilities/website'
// import { db } from '@/server/lib/db'
// import { unwrap } from '@/server/utilities'

// export const pattern = 'watchlist-:id-details{-:originPage}'

// export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
//   if (!interaction.message.interaction_metadata) {
//     return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
//   }

//   const { id, originPage } = args

//   await interaction.deferUpdate()

//   const [err, watchlist] = await unwrap(db.watchlist.findFirst({ where: { id, discordUserId: interaction.user.id } }))

//   if (err) {
//     logger.error(err)
//     return await interaction.updateResponse('An error occurred while fetching the watchlist.')
//   }

//   if (!watchlist) {
//     return await interaction.updateResponse('Watchlist not found.')
//   }

//   // if (watchlist.state === WatchlistState.PRIVATE && watchlist.discordUserId !== interaction.user.id) {
//   //   return await interaction.updateResponse({ content: 'You do not have permission to view this watchlist.' })
//   // }

//   const count = await db.watchlistItem.count({ where: { watchlistId: watchlist.id } })

//   return await interaction.updateResponse(
//     <>
//       <Container>
//         {h2(`${watchlist.name ?? 'Unnamed Watchlist'} - ${convertStateToLabel(watchlist.state)}`)}
//         {'\n'}
//         {subtext(`${count} Total Items`)}
//         {watchlist.description && <TextDisplay>{watchlist.description}</TextDisplay>}
//         <TextDisplay>{subtext(link('View on Torkin ↗', watchlistIdToUrl(watchlist.id)))}</TextDisplay>
//       </Container>
//       <ActionRow>
//         <BackButton prefix={`watchlist-${watchlist.id}-items`} page={originPage} title="Items" label="View Items" />
//         <BackButton prefix="Watchlist-results" page={originPage} title="Lists" style="Secondary" />
//       </ActionRow>
//     </>,
//   )

//   // TODO: if origin page, add "go to list" button
//   // if owner, add manage button and have manage page.
//   // if not owner, add owner mention/link
// }
