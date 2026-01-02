import { ActionRow, Button, Container, Separator } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { h2 } from 'discord-fmt'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ListingPreview, PaginationButtons } from '@/server/bot/components/builders'
import { getRecommendations } from '@/server/lib/tmdb'
import type { StandardListing } from '@/server/lib/tmdb/types'
import { paginateArray } from '@/server/utilities'
import ErrorPage from './error'

const ITEMS_PER_PAGE = 4

type RecommendationResult = {
  id: number
  title?: string
  name?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  poster_path?: string | null
  vote_average: number
  adult: boolean
}

export function RecommendationsPage({ listing, onBack }: Readonly<{ listing: StandardListing; onBack: () => void }>) {
  const queryData = {
    queryKey: ['recommendations', listing.type, listing.id],
    queryFn: () => getRecommendations(listing.type, listing.id),
  }
  const query = useQuery(queryData)
  const [page, setPage] = useState(1)

  if (!query.data) {
    return (
      <>
        {query.isLoading ? (
          <>
            <Container>Fetching recommendations...</Container>
            <PaginationButtons currentPage={1} />
          </>
        ) : (
          <ErrorPage code={500}>There was an error fetching recommendations!</ErrorPage>
        )}
      </>
    )
  }

  const { results, totalPages } = paginateArray(query.data, page, ITEMS_PER_PAGE)

  return (
    <>
      <Container>
        {h2(`Recommendations for ${listing.title}`)}
        {results.map((item, index) => {
          const typedItem = item as unknown as RecommendationResult
          const title = typedItem.title ?? typedItem.name
          const overview = typedItem.overview

          if (!title || !overview || typedItem.adult) {
            return null
          }

          const releaseDate = typedItem.release_date ?? typedItem.first_air_date
          const voteAverage = typedItem.vote_average

          return (
            <Fragment key={typedItem.id}>
              <ListingPreview
                title={title}
                subtitle={
                  releaseDate
                    ? `${format(new Date(releaseDate), 'yyyy')} • ${voteAverage.toFixed(1)} ★`
                    : `${voteAverage.toFixed(1)} ★`
                }
                description={overview}
                releaseDate={releaseDate}
                thumbnail={typedItem.poster_path ?? undefined}
                onClick={() => {}}
              />
              {index < results.length - 1 && <Separator />}
            </Fragment>
          )
        })}
        {results.length === 0 && 'No recommendations found!'}
      </Container>
      <PaginationButtons currentPage={page} totalPages={totalPages} setPage={setPage} />
      <ActionRow>
        <Button onClick={onBack} label="Back" style="Secondary" />
      </ActionRow>
    </>
  )
}
