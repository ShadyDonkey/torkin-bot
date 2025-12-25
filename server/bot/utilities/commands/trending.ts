import { format } from 'date-fns'
import { type APIComponentInContainer, MessageFlags } from 'discord-api-types/v10'
import { h2, h3 } from 'discord-fmt'
import { Button, Container, type MessageComponentInteraction, Section, Separator, TextDisplay } from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/builders'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { logger } from '@/server/lib/pino'
import { getTrendingMovies, getTrendingTv } from '@/server/lib/tmdb/helpers'
import { paginateArray, unwrap } from '@/server/utilities'
import carp from '@/server/utilities/carp'

const ITEMS_PER_PAGE = 5

export async function handleMovie(timeWindow: 'day' | 'week', page: number) {
  const [trendingErr, trending] = await unwrap(getTrendingMovies(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending movies found')
  }

  const paginatedItems = await paginateArray(trending, page, ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(paginatedItems.page, paginatedItems.totalPages, 'trending')

  const entries = carp<APIComponentInContainer>(
    paginatedItems.results.flatMap((movie, index) => {
      if ((!movie.title && !movie.original_title) || !movie.overview || movie.adult) {
        return null
      }
      return [
        Section(
          carp(
            `${h3(movie.title ?? movie.original_title ?? 'Unknown')} (${movie.release_date ? format(new Date(movie.release_date), 'yyyy') : 'Not Released'})`,
            movie.overview && `${movie.overview.substring(0, 255)} [...]`,
          ),
          Button({
            custom_id: `trending-view-details-${movie.id > 0 ? movie.id : Math.random()}-${page}`,
            label: `‹ View Details`,
            style: 'Secondary',
            disabled: !movie.id,
          }),
        ),
        index < paginatedItems.results.length - 1 && Separator(),
      ]
    }),
  )

  return [
    TextDisplay(h2(`Trending Movies ${timeWindow === 'day' ? 'Today' : 'this Week'}`)),
    Container(...entries),
    paginationComponents,
  ]
}

export async function handleTv(timeWindow: 'day' | 'week', page: number) {
  const [trendingErr, trending] = await unwrap(getTrendingTv(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending TV shows found')
  }

  const paginatedItems = await paginateArray(trending, page, ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(paginatedItems.page, paginatedItems.totalPages, 'trending')

  const entries = carp<APIComponentInContainer>(
    paginatedItems.results.flatMap((tv, index) => {
      if ((!tv.name && !tv.original_name) || !tv.overview || tv.adult) {
        return null
      }
      return [
        Section(
          carp(
            `${h3(tv.name ?? tv.original_name ?? 'Unknown')} (${tv.first_air_date ? format(new Date(tv.first_air_date), 'yyyy') : 'Not Released'})`,
            `${tv.overview.substring(0, 255)} [...]`,
          ),
          Button({
            custom_id: `trending-view-details-${tv.id}-${page}`,
            label: `‹ View Details`,
            style: 'Secondary',
            disabled: !tv.id,
          }),
        ),
        index < paginatedItems.results.length - 1 && Separator(),
      ]
    }),
  )

  return [
    TextDisplay(h2(`Trending TV Shows ${timeWindow === 'day' ? 'Today' : 'this Week'}`)),
    Container(...entries),
    paginationComponents,
  ]
}

export async function handlePagination(interaction: MessageComponentInteraction, page: number) {
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
    keyv.get<CmdTrendingCacheEntry>(KEYV_CONFIG.cmd.trending.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
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

  await interaction.updateResponse({
    components: await (cached.type === 'movie' ? handleMovie : handleTv)(cached.timeWindow, page),
    flags: MessageFlags.IsComponentsV2,
  })
}
