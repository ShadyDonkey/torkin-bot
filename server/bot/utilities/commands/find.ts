import { type APIComponentInContainer, MessageFlags } from 'discord-api-types/v10'
import { bold, subtext } from 'discord-fmt'
import {
  Button,
  Container,
  type MessageComponentInteraction,
  Section,
  Separator,
  TextDisplay,
  Thumbnail,
} from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/builders'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { REMOTE_IDS_MOVIE, REMOTE_IDS_SERIES, search } from '@/server/lib/tvdb'
import { unwrap } from '@/server/utilities'
import carp from '@/server/utilities/carp'

const ITEMS_PER_PAGE = 3

export async function paginateSearch(interaction: MessageComponentInteraction, page: number) {
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

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdFindCacheEntry>(KEYV_CONFIG.cmd.find.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    console.error({ cacheErr, cached })
    return await interaction.updateResponse({
      components: [TextDisplay('Could not retrieve cached search results, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  if (interaction.user.id !== cached.userId) {
    return await interaction.reply({
      content: "You cannot interact with another user's search results.",
      ephemeral: true,
    })
  }

  const [searchErr, searchResponse] = await unwrap(
    search(cached.query, cached.searchType === 'tv' ? 'series' : 'movie', page, ITEMS_PER_PAGE),
  )

  if (searchErr || !searchResponse.data) {
    console.error({ searchErr })
    return await interaction.updateResponse({
      components: [TextDisplay('An error occurred while searching for movies, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const totalResults = searchResponse.links?.total_items || 1
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(page, totalPages, 'find')

  const entries = carp<APIComponentInContainer>(
    searchResponse.data.flatMap((entry, index) => {
      if (!entry.image_url) {
        return null
      }

      const tmdbId = entry.remote_ids?.find((remoteId) =>
        cached.searchType === 'movie'
          ? remoteId.type === REMOTE_IDS_MOVIE.tmdb
          : remoteId.type === REMOTE_IDS_SERIES.tmdb,
      )?.id

      const yearText = entry.year ? `(${entry.year})` : ''
      const titleWithYear = `${bold(entry.title ?? entry.name ?? 'Unknown')} ${yearText}`

      return [
        Section(
          carp(
            entry.extended_title ? bold(entry.extended_title) : titleWithYear,
            entry.genres && entry.genres.length > 0 && subtext(entry.genres.join(', ')),
          ),
          Button({
            custom_id: `find-view-details-${tmdbId || entry.id}-${page}`,
            label: 'View Details',
            style: 'Secondary',
            disabled: !tmdbId,
          }),
        ),
        Section([entry.overview ? `${entry.overview.substring(0, 255)}...` : '‎ '], Thumbnail(entry.image_url)),
        searchResponse.data?.length && index < searchResponse.data.length - 1 && Separator(),
      ]
    }),
  )

  return await interaction.updateResponse({
    components: [Container(...entries), paginationComponents],
    flags: MessageFlags.IsComponentsV2,
  })
}
