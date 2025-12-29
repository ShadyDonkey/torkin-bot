import { Container, type MessageComponentInteraction, Separator } from '@dressed/react'
import { h2 } from 'discord-fmt'
import { Suspense, use } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ListingPreview, PaginationButtons } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { getTrending } from '@/server/lib/tmdb'
import type { StandardTrendingListing } from '@/server/lib/tmdb/types'
import { paginateArray, unwrap } from '@/server/utilities'

const ITEMS_PER_PAGE = 4

export function TrendingMovies({ window, page }: Readonly<{ window: 'day' | 'week'; page: number }>) {
  return (
    <>
      {h2(`Trending Movies ${window === 'day' ? 'Today' : 'this Week'}`)}
      <Suspense
        fallback={
          <>
            <Container>Fetching trending movies...</Container>
            <PaginationButtons currentPage={page} prefix="LOADING" disabled />
          </>
        }
      >
        <TrendingListings page={page} promise={getTrending('movie', window)} />
      </Suspense>
    </>
  )
}

export function TrendingTv({ window, page }: Readonly<{ window: 'day' | 'week'; page: number }>) {
  return (
    <>
      {h2(`Trending TV Shows ${window === 'day' ? 'Today' : 'this Week'}`)}
      <Suspense
        fallback={
          <>
            <Container>Fetching trending shows...</Container>
            <PaginationButtons currentPage={page} prefix="LOADING" disabled />
          </>
        }
      >
        <TrendingListings page={page} promise={getTrending('tv', window)} />
      </Suspense>
    </>
  )
}

function TrendingListings({ page, promise }: Readonly<{ page: number; promise: Promise<StandardTrendingListing[]> }>) {
  const trending = use(promise)
  const { results, totalPages } = paginateArray(trending, page, ITEMS_PER_PAGE)
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
      <PaginationButtons currentPage={page} prefix="trending" totalPages={totalPages} />
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
      <TrendingMovies window={cached.timeWindow} page={page} />
    ) : (
      <TrendingTv window={cached.timeWindow} page={page} />
    ),
  )
}
