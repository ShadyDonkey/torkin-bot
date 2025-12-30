import { Button, Container, Section, Separator, Thumbnail } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { h2 } from 'discord-fmt'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ItemActions, ListingPreview, PaginationButtons } from '@/server/bot/utilities/builders'
import { getImageUrl, getTrending } from '@/server/lib/tmdb'
import type { StandardListing } from '@/server/lib/tmdb/types'
import { paginateArray } from '@/server/utilities'
import { Availability, TrendingMovieDetails, TrendingTvDetails, VoteSection } from '../tmdb'

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
  const [focused, setFocused] = useState<number>()

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

  if (focused) {
    const focusedListing = results[focused]
    if (!focusedListing) {
      return null
    }
    return <ListingPage listing={focusedListing} onBack={() => setFocused(undefined)} />
  }

  return (
    <>
      <Container>
        {results.map((item, index) => {
          if (!item.title || !item.description || item.adult) {
            return null
          }
          return (
            <Fragment key={item.id}>
              <ListingPreview onClick={() => setFocused(index)} {...item} />
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

export function ListingPage({ listing, onBack }: Readonly<{ listing: StandardListing; onBack: () => void }>) {
  return (
    <>
      <Container>
        <Section accessory={<Thumbnail media={getImageUrl(listing.thumbnail ?? '')} />}>
          ## {listing.title} {listing.releaseDate && `(${format(new Date(listing.releaseDate), 'yyyy')})`}
          {'\n'}
          {listing.voteAverage > 0 && <VoteSection voteAverage={listing.voteAverage} />}
          {listing.description}
          {'\n'}
          {listing.type === 'movie' ? (
            <TrendingMovieDetails details={listing.details} />
          ) : (
            <TrendingTvDetails details={listing.details} />
          )}
          <Availability id={listing.id} type={listing.type} />
        </Section>
      </Container>
      <ItemActions id={`${listing?.id}`} type={listing.type}>
        <Button onClick={onBack} label="Back" />
      </ItemActions>
    </>
  )
}
