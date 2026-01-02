import { ActionRow, Button, Container, Separator } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { h2 } from 'discord-fmt'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ListingPreview, PaginationButtons } from '@/server/bot/components/builders'
import { ListingPage } from '@/server/bot/components/commands/listings'
import { getRecommendations } from '@/server/lib/tmdb'
import type { StandardListing } from '@/server/lib/tmdb/types'
import { paginateArray } from '@/server/utilities'
import ErrorPage from './error'

const ITEMS_PER_PAGE = 4

export function RecommendationsPage({ listing, onBack }: Readonly<{ listing: StandardListing; onBack: () => void }>) {
  const queryData = {
    queryKey: ['recommendations', listing.type, listing.id],
    queryFn: () => getRecommendations(listing.type, listing.id),
  }
  const query = useQuery(queryData)
  const [page, setPage] = useState(1)
  const [focused, setFocused] = useState<StandardListing | null>(null)

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

  if (focused) {
    return (
      <ListingPage
        listing={focused}
        onBack={() => setFocused(null)}
        backText="Back to Recommendations"
        disableRecommendations
        onShowRecommendations={(id, type) => {
          const rec = query.data.find((r) => r.id === id && r.type === type)
          if (rec) {
            setFocused(rec)
          }
        }}
      />
    )
  }

  const { results, totalPages } = paginateArray(query.data, page, ITEMS_PER_PAGE)

  return (
    <>
      <Container>
        {h2(`Similar to ${listing.title}`)}
        {results.map((item, index) => {
          if (!item.title || !item.description || item.adult) {
            return null
          }

          return (
            <Fragment key={item.id}>
              <ListingPreview
                title={item.title}
                description={item.description}
                releaseDate={item.releaseDate}
                thumbnail={item.thumbnail ?? undefined}
                onClick={() => setFocused(item)}
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
