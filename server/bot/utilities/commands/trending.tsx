import { Button, Container, type MessageComponentInteraction, Section, Separator } from '@dressed/react'
import { format } from 'date-fns'
import { h2 } from 'discord-fmt'
import { Fragment } from 'react/jsx-runtime'
import { PaginationButtons } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { getTrendingMovies, getTrendingTv } from '@/server/lib/tmdb/helpers'
import { paginateArray, unwrap } from '@/server/utilities'

const ITEMS_PER_PAGE = 5

export async function handleMovie(timeWindow: 'day' | 'week', page: number) {
  const [trendingErr, trending] = await unwrap(getTrendingMovies(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending movies found')
  }

  const paginatedItems = paginateArray(trending, page, ITEMS_PER_PAGE)

  return (
    <>
      {h2(`Trending Movies ${timeWindow === 'day' ? 'Today' : 'this Week'}`)}
      <Container>
        {paginatedItems.results.map((movie, index) => {
          if ((!movie.title && !movie.original_title) || !movie.overview || movie.adult) {
            return null
          }
          return (
            <Fragment key={movie.id}>
              <Section
                accessory={
                  <Button
                    custom_id={`trending-view-details-${movie.id > 0 ? movie.id : Math.random()}-${page}`}
                    label="View Details"
                    disabled={!movie.id}
                    style="Secondary"
                  />
                }
              >
                ### {movie.title ?? movie.original_title ?? 'Unknown'} (
                {movie.release_date ? format(new Date(movie.release_date), 'yyyy') : 'Not Released'}){'\n'}
                {movie.overview && `${movie.overview.substring(0, 255)} [...]`}
              </Section>
              {index < paginatedItems.results.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </Container>
      <PaginationButtons currentPage={paginatedItems.page} prefix="trending" totalPages={paginatedItems.totalPages} />
    </>
  )
}

export async function handleTv(timeWindow: 'day' | 'week', page: number) {
  const [trendingErr, trending] = await unwrap(getTrendingTv(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending TV shows found')
  }

  const paginatedItems = paginateArray(trending, page, ITEMS_PER_PAGE)

  return (
    <>
      {h2(`Trending TV Shows ${timeWindow === 'day' ? 'Today' : 'this Week'}`)}
      <Container>
        {paginatedItems.results.map((tv, index) => {
          if ((!tv.name && !tv.original_name) || !tv.overview || tv.adult) {
            return null
          }
          return (
            <Fragment key={tv.id}>
              <Section
                accessory={
                  <Button
                    custom_id={`trending-view-details-${tv.id}-${page}`}
                    label="View Details"
                    disabled={!tv.id}
                    style="Secondary"
                  />
                }
              >
                ### {tv.name ?? tv.original_name ?? 'Unknown'} (
                {tv.first_air_date ? format(new Date(tv.first_air_date), 'yyyy') : 'Not Released'}){'\n'}
                {tv.overview && `${tv.overview.substring(0, 255)} [...]`}
              </Section>
              {index < paginatedItems.results.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </Container>
      <PaginationButtons currentPage={paginatedItems.page} prefix="trending" totalPages={paginatedItems.totalPages} />
    </>
  )
}

export async function handlePagination(interaction: MessageComponentInteraction, page: number) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply('No interaction found on the original message.', {
      ephemeral: true,
    })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdTrendingCacheEntry>(KEYV_CONFIG.cmd.trending.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
    return await interaction.updateResponse('Could not retrieve cached search results, please try again later.')
  }

  await interaction.updateResponse(await (cached.type === 'movie' ? handleMovie : handleTv)(cached.timeWindow, page))
}
