import type { Params } from '@dressed/matcher'
import { format } from 'date-fns'
import { type APIComponentInContainer, ComponentType, MessageFlags } from 'discord-api-types/v10'
import { h2, h3 } from 'discord-fmt'
import {
  ActionRow,
  Button,
  Container,
  type MessageComponentInteraction,
  Section,
  Separator,
  TextDisplay,
  Thumbnail,
} from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/builders'
import { convertStateToLabel } from '@/server/bot/utilities/commands/watchlist'
import { db } from '@/server/lib/db'
import { getImageUrl, getMovieDetails, getTvDetails } from '@/server/lib/tmdb'
import { unwrap } from '@/server/utilities'
import { WatchlistItemType } from '@/server/zenstack/models'

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

  const take = 3
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

  const watchlist = await db.watchlist.findUnique({
    where: {
      id: watchlistId,
    },
  })

  const count = await db.watchlistItem.count({
    where: {
      watchlistId,
    },
  })
  const totalPages = Math.ceil(count / take)
  const paginationButtons = buildPaginationButtons(page, totalPages, `watchlist-items-${watchlistId}`)

  const tvPromises = results.filter((e) => e.type === WatchlistItemType.TV).map((e) => getTvDetails(e.externalId))
  const tvResults = await Promise.all(tvPromises)

  const tvEntries = tvResults
    .map((entry) => {
      if (!entry?.poster_path || entry.adult) {
        return null
      }

      let body = ''

      if (entry.first_air_date) {
        body += h3(`${entry.name} (${format(new Date(entry.first_air_date), 'yyyy')})\n`)
      } else {
        body += `${h3(entry.name ?? '')}\n`
      }

      if (entry.overview) {
        body += `\n${entry.overview.substring(0, 125)} [...]\n`
      }

      const section = Section([body], Thumbnail(getImageUrl(entry.poster_path)))

      return [
        section,
        ActionRow(
          Button({
            custom_id: Math.random().toString(),
            label: 'View Details',
            style: 'Secondary',
          }),
          Button({
            custom_id: Math.random().toString(),
            label: 'Remove',
            style: 'Secondary',
          }),
        ),
      ]
    })
    .filter((entry) => entry !== null)
    .flat()

  const moviePromises = results
    .filter((e) => e.type === WatchlistItemType.MOVIE)
    .map((e) => getMovieDetails(e.externalId))
  const movieResults = await Promise.all(moviePromises)

  const movieEntries = movieResults
    .map((entry) => {
      if (!entry?.poster_path || entry.adult) {
        return null
      }

      let body = ''
      if (entry.release_date) {
        body += h3(`${entry.title} (${format(new Date(entry.release_date), 'yyyy')})\n`)
      } else {
        body += `${h3(entry.title ?? '')}\n`
      }

      if (entry.overview) {
        body += `\n${entry.overview.substring(0, 125)} [...]\n`
      }

      const section = Section([body], Thumbnail(getImageUrl(entry.poster_path)))

      return [
        section,
        ActionRow(
          Button({
            custom_id: Math.random().toString(),
            label: 'View Details',
            style: 'Secondary',
          }),
          Button({
            custom_id: Math.random().toString(),
            label: 'Remove',
            style: 'Secondary',
          }),
        ),
      ]
    })
    .filter((entry) => entry !== null)
    .flat()

  const entries = [...tvEntries, ...movieEntries]

  const components = [
    Container(
      TextDisplay(h2(watchlist?.name ?? 'Unnamed Watchlist')),
      ...entries.flatMap((entry, index): APIComponentInContainer[] => {
        if (entry.type === ComponentType.ActionRow && index < entries.length - 1) {
          return [entry, Separator()]
        }

        return [entry]
      }),
    ),
    paginationButtons,
    ActionRow(
      Button({
        custom_id: Math.random().toString(),
        label: 'Back',
        style: 'Secondary',
      }),
    ),
  ]

  return await interaction.updateResponse({
    components,
    flags: MessageFlags.IsComponentsV2,
  })
}
