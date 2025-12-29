import { Container, type MessageComponentInteraction, Separator } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { h2 } from 'discord-fmt'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ListingPreview, PaginationButtons } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { getTrending } from '@/server/lib/tmdb'
import type { StandardTrendingListing } from '@/server/lib/tmdb/types'
import { paginateArray, unwrap } from '@/server/utilities'

const ITEMS_PER_PAGE = 4

export function TrendingMovies({ window, initialPage }: Readonly<{ window: 'day' | 'week'; initialPage: number }>) {
  return (
    <>
      {h2(`Trending Movies ${window === 'day' ? 'Today' : 'this Week'}`)}
      <TrendingListings type="movie" window={window} initialPage={initialPage} />
    </>
  )
}

export function TrendingTv({ window, initialPage }: Readonly<{ window: 'day' | 'week'; initialPage: number }>) {
  return (
    <>
      {h2(`Trending TV Shows ${window === 'day' ? 'Today' : 'this Week'}`)}
      <TrendingListings type="tv" window={window} initialPage={initialPage} />
    </>
  )
}

function TrendingListings({
  type,
  window,
  initialPage,
}: Readonly<{
  type: 'movie' | 'tv'
  window: 'day' | 'week'
  initialPage: number
}>) {
  const query = useQuery({ queryKey: ['trending', type, window], queryFn: () => getTrending(type, window) })
  const [page, setPage] = useState(initialPage)
  if (!query.data) {
    return (
      <>
        <Container>
          {query.isLoading && 'Fetching listings...'}
          {query.isError && 'There was an error fetching listings!'}
        </Container>
        <PaginationButtons currentPage={initialPage} prefix="LOADING" />
      </>
    )
  }
  const { results, totalPages } = paginateArray(query.data, page, ITEMS_PER_PAGE)
  return (
    <>
      <Container>
        {results.map((item, index) => {
          if (!item.title || !item.description || item.adult) {
            return null
          }
          return (
            <Fragment key={item.id}>
              <ListingPreview linkId={`trending-view-details-${item.id}-${page}`} {...item} />
              {index < results.length - 1 && <Separator />}
            </Fragment>
          )
        })}
        {results.length === 0 && 'No trending listings found!'}
      </Container>
      <PaginationButtons currentPage={page} prefix="trending" totalPages={totalPages} setPage={setPage} />
    </>
  )
}

export async function handlePagination(interaction: MessageComponentInteraction, page: number) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdTrendingCacheEntry>(KEYV_CONFIG.cmd.trending.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
    return await interaction.updateResponse('Could not retrieve cached search results, please try again later.')
  }

  await interaction.updateResponse(
    cached.type === 'movie' ? (
      <TrendingMovies window={cached.timeWindow} initialPage={page} />
    ) : (
      <TrendingTv window={cached.timeWindow} initialPage={page} />
    ),
  )
}
