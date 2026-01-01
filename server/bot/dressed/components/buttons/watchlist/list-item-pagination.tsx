// import type { Params } from '@dressed/matcher'
// import {
//   ActionRow,
//   Button,
//   Container,
//   type MessageComponentInteraction,
//   Section,
//   Separator,
//   TextDisplay,
//   Thumbnail,
// } from '@dressed/react'
// import { format } from 'date-fns'
// import { h2 } from 'discord-fmt'
// import { Fragment } from 'react/jsx-runtime'
// import { PaginationButtons } from '@/server/bot/components/builders'
// import { logger } from '@/server/bot/utilities/logger'
// import { db } from '@/server/lib/db'
// import { getDetails, getImageUrl } from '@/server/lib/tmdb'
// import { unwrap } from '@/server/utilities'
// import { WatchlistItemType } from '@/server/zenstack/models'

// export const pattern = 'watchlist-:id-items-goto-:page(\\d+)-:throwaway'

// export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
//   if (!interaction.message.interaction_metadata) {
//     return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
//   }

//   const page = Number.parseInt(args.page, 10)
//   const watchlistId = args.id

//   await interaction.deferUpdate()

//   const take = 3
//   const skip = (page - 1) * take

//   const [dbErr, results] = await unwrap(
//     db.watchlistItem.findMany({
//       where: {
//         watchlistId,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//       skip,
//       take,
//     }),
//   )

//   if (dbErr) {
//     logger.error(dbErr)
//     return await interaction.updateResponse('Error fetching watchlist items.')
//   }

//   const watchlist = await db.watchlist.findUnique({
//     where: {
//       id: watchlistId,
//     },
//   })

//   const count = await db.watchlistItem.count({
//     where: {
//       watchlistId,
//     },
//   })
//   const totalPages = Math.ceil(count / take)

//   const providerResults = await Promise.all(
//     results.map((e) =>
//       e.type === WatchlistItemType.MOVIE ? getDetails('movie', e.externalId) : getDetails('tv', e.externalId),
//     ),
//   )

//   return await interaction.updateResponse(
//     <>
//       <Container>
//         {h2(watchlist?.name ?? 'Unnamed Watchlist')}
//         {providerResults.map((entry, index) => {
//           if (!entry?.poster_path || entry.adult) {
//             return null
//           }

//           const type = 'release_date' in entry ? 'movie' : 'tv'

//           function MovieBody() {
//             if (!('release_date' in entry)) {
//               return null
//             }
//             return (
//               <>
//                 ### {entry.title ?? entry.original_title ?? 'Unknown'}
//                 {entry.release_date && <>({format(new Date(entry.release_date), 'yyyy')})</>}
//               </>
//             )
//           }

//           function TVBody() {
//             if (!('first_air_date' in entry)) {
//               return null
//             }
//             return (
//               <>
//                 ### {entry.name ?? entry.original_name ?? 'Unknown'}
//                 {entry.first_air_date && <>({format(new Date(entry.first_air_date), 'yyyy')})</>}
//               </>
//             )
//           }

//           return (
//             <Fragment key={entry.id}>
//               <Section accessory={<Thumbnail media={getImageUrl(entry.poster_path)} />}>
//                 {'release_date' in entry ? <MovieBody /> : <TVBody />}
//                 {entry.overview && <TextDisplay>{entry.overview.substring(0, 125)}</TextDisplay>}
//               </Section>
//               <ActionRow>
//                 <Button
//                   custom_id={`watchlist-${watchlistId}-item-details-${entry.id}-${type}-${page}`}
//                   label="View Details"
//                   style="Secondary"
//                 />
//                 {/* TODO: this */}
//                 <Button custom_id={Math.random().toString()} label="Remove" style="Secondary" disabled />
//               </ActionRow>

//               {index < providerResults.length - 1 && <Separator />}
//             </Fragment>
//           )
//         })}
//       </Container>
//       <PaginationButtons currentPage={page} totalPages={totalPages} />
//       <ActionRow>
//         <Button custom_id={`watchlist-${watchlistId}-details`} label="Back" style="Secondary" />
//       </ActionRow>
//     </>,
//   )
// }
