import { Container, Separator } from '@dressed/react'
import { type UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ListingPreview, PaginationButtons } from '@/server/bot/utilities/builders'
import type { StandardListing } from '@/server/lib/tmdb/types'
import { paginateArray } from '@/server/utilities'
import { ListingPage } from '../tmdb'

const ITEMS_PER_PAGE = 4

export function Listings({
  initialPage,
  queryData,
}: Readonly<{ initialPage: number; queryData: UndefinedInitialDataOptions<StandardListing[]> }>) {
  const query = useQuery(queryData)
  const [page, setPage] = useState(initialPage)
  const [focused, setFocused] = useState<number | undefined>()

  if (!query.data) {
    return (
      <>
        <Container>
          {query.isLoading && 'Fetching listings...'}
          {query.isError && 'There was an error fetching listings!'}
        </Container>
        <PaginationButtons currentPage={initialPage} />
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
              {focused === item.id && <ListingPage listing={item} onBack={() => setFocused(undefined)} />}
              {focused !== item.id && <ListingPreview onClick={() => setFocused(item.id)} {...item} />}
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
