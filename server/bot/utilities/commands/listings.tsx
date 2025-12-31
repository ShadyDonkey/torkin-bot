import { Button, Container, Section, Separator, TextDisplay, Thumbnail } from '@dressed/react'
import { type UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { h2 } from 'discord-fmt'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ItemActions, ListingPreview, PaginationButtons } from '@/server/bot/utilities/builders'
import { getImageUrl, getItemWatchProviders } from '@/server/lib/tmdb'
import type { StandardListing } from '@/server/lib/tmdb/types'
import { paginateArray } from '@/server/utilities'
import { TrendingMovieDetails, TrendingTvDetails, VoteSection } from '../tmdb'
import ErrorPage from './error'

const ITEMS_PER_PAGE = 4

export function Listings({
  initialPage,
  queryData,
  listTitle,
}: Readonly<{ initialPage: number; queryData: UndefinedInitialDataOptions<StandardListing[]>; listTitle?: string }>) {
  const query = useQuery(queryData)
  const [page, setPage] = useState(initialPage)
  const [focused, setFocused] = useState<number>()

  if (!query.data) {
    return (
      <>
        {query.isLoading ? (
          <>
            <Container>Fetching listings...</Container>
            <PaginationButtons currentPage={initialPage} />
          </>
        ) : (
          <ErrorPage code={500}>There was an error fetching listings!</ErrorPage>
        )}
      </>
    )
  }

  if (focused !== undefined && query.data[focused]) {
    return <ListingPage listing={query.data[focused]} onBack={() => setFocused(undefined)} />
  }

  const { results, totalPages } = paginateArray(query.data, page, ITEMS_PER_PAGE)

  return (
    <>
      {listTitle && h2(listTitle)}
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
        {results.length === 0 && 'No listings found!'}
      </Container>
      <PaginationButtons currentPage={page} totalPages={totalPages} setPage={setPage} />
    </>
  )
}

export function ListingPage({
  listing,
  onBack,
  backText,
}: Readonly<{ listing: StandardListing; onBack: () => void; backText?: string }>) {
  return (
    <>
      <Container>
        <Section accessory={<Thumbnail media={getImageUrl(listing.thumbnail ?? '')} />}>
          ## {listing.title} {listing.releaseDate && `(${format(new Date(listing.releaseDate), 'yyyy')})`}
          {listing.voteAverage > 0 && <VoteSection voteAverage={listing.voteAverage} />}
        </Section>
        {listing.description}
        {'\n'}
        {listing.type === 'movie' ? (
          <TrendingMovieDetails details={listing.details} />
        ) : (
          <TrendingTvDetails details={listing.details} />
        )}
        <TextDisplay>
          Watch Now (US): <Availability id={listing.id} type={listing.type} />
        </TextDisplay>
      </Container>
      <ItemActions id={listing.id.toString()} type={listing.type}>
        <Button onClick={onBack} label={backText ?? 'Back'} />
      </ItemActions>
    </>
  )
}

function Availability({ type, id }: Readonly<{ type: 'movie' | 'tv'; id: number }>) {
  const query = useQuery({
    queryKey: ['availability', type, id],
    queryFn: () => getItemWatchProviders(type, { id, season: 1 }),
  })

  if (!query.data?.results) {
    return (
      <TextDisplay>
        {query.isLoading && '...'}
        {query.isError && 'Error Loading'}
      </TextDisplay>
    )
  }

  return (
    <TextDisplay>
      {query.data.results.US?.flatrate?.length && query.data.results.US.flatrate.length > 0
        ? query.data.results.US?.flatrate?.map((p) => p.provider_name).join(', ')
        : 'Not Available'}
    </TextDisplay>
  )
}
