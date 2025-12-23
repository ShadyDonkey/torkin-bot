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
import { db } from '@/server/lib/db'
import { getImageUrl, getMovieDetails, getTvDetails } from '@/server/lib/tmdb'
import { unwrap } from '@/server/utilities'
import { WatchlistItemType } from '@/server/zenstack/models'

export const pattern = 'watchlist-:id-items-goto-:page(\\d+)-:throwaway'

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
  const paginationButtons = buildPaginationButtons(page, totalPages, `watchlist-${watchlistId}-items`)

  const providerResults = await Promise.all(
    results.map((e) =>
      e.type === WatchlistItemType.MOVIE ? getMovieDetails(e.externalId) : getTvDetails(e.externalId),
    ),
  )

  const entries = providerResults
    .map((entry, index) => {
      if (!entry?.poster_path || entry.adult) {
        return null
      }

      let body = ''
      let type = 'movie'

      if ('release_date' in entry) {
        if (entry.release_date) {
          body += h3(`${entry.title} (${format(new Date(entry.release_date), 'yyyy')})\n`)
        } else {
          body += `${h3(entry.title ?? '')}\n`
        }
      }

      if ('first_air_date' in entry) {
        type = 'tv'
        if (entry.first_air_date) {
          body += h3(`${entry.name} (${format(new Date(entry.first_air_date), 'yyyy')})\n`)
        } else {
          body += `${h3(entry.name ?? '')}\n`
        }
      }

      if (entry.overview) {
        body += `\n${entry.overview.substring(0, 125)} [...]\n`
      }

      const section = Section([body], Thumbnail(getImageUrl(entry.poster_path)))

      const components: APIComponentInContainer[] = [
        section,
        ActionRow(
          Button({
            custom_id: `watchlist-${watchlistId}-item-details-${entry.id}-${type}-${page}`,
            label: 'View Details',
            style: 'Secondary',
          }),
          // TODO: this
          Button({
            custom_id: Math.random().toString(),
            label: 'Remove',
            style: 'Secondary',
            disabled: true,
          }),
        ),
      ]

      if (index < providerResults.length - 1) {
        components.push(Separator())
      }

      return components
    })
    .filter((entry) => entry !== null)
    .flat()

  const components = [
    Container(TextDisplay(h2(watchlist?.name ?? 'Unnamed Watchlist')), ...entries),
    paginationButtons,
    ActionRow(
      Button({
        custom_id: `watchlist-${watchlistId}-details`,
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
