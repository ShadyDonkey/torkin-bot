import { Button, Section, TextDisplay, Thumbnail } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { format, getUnixTime } from 'date-fns'
import { h3, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import { Fragment, type ReactNode } from 'react'
import { getImageUrl, getItemWatchProviders } from '@/server/lib/tmdb'
import type { StandardListing } from '@/server/lib/tmdb/types'

export function ListingPage({
  listing,
  onBack,
  backText,
}: Readonly<{ listing: StandardListing; onBack?: () => void; backText?: string }>) {
  const SecondWrapper = onBack
    ? ({ children }: Readonly<{ children: ReactNode }>) => (
        <Section accessory={<Thumbnail media={getImageUrl(listing.thumbnail ?? '')} />}>{children}</Section>
      )
    : Fragment
  return (
    <>
      <Section
        accessory={
          onBack ? (
            <Button onClick={onBack} label={backText ?? 'Hide Details'} style="Secondary" />
          ) : (
            <Thumbnail media={getImageUrl(listing.thumbnail ?? '')} />
          )
        }
      >
        ## {listing.title} {listing.releaseDate && `(${format(new Date(listing.releaseDate), 'yyyy')})`}
        {listing.voteAverage > 0 && <VoteSection voteAverage={listing.voteAverage} />}
      </Section>
      <SecondWrapper>
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
      </SecondWrapper>
    </>
  )
}

export function TrendingTvDetails({ details }: { details: StandardListing<'tv'>['details'] }) {
  // TODO add genres, will need to cache and parse here.

  const detailsList = []

  if (details.status) {
    detailsList.push(`Status: ${details.status}`)
  }

  if (details.last_air_date) {
    const epoch = getUnixTime(new Date(details.last_air_date)).toString()
    detailsList.push(
      `Last Air Date: ${timestamp(epoch, TimestampStyle.ShortDate)} (${timestamp(epoch, TimestampStyle.RelativeTime)})`,
    )
  }

  if (details.first_air_date) {
    const epoch = getUnixTime(new Date(details.first_air_date)).toString()
    detailsList.push(
      `First Air Date: ${timestamp(epoch, TimestampStyle.ShortDate)} (${timestamp(epoch, TimestampStyle.RelativeTime)})`,
    )
  }

  // TODO: This
  // if (details.next_episode_to_air) {
  //   detailsList.push(`Next Episode: ${details.next_episode_to_air}`)
  // }

  if (details.number_of_seasons) {
    detailsList.push(
      `Seasons: ${details.number_of_seasons}${details.number_of_episodes ? ` (${details.number_of_episodes} Episodes)` : ''}`,
    )
  }

  if (details.networks) {
    detailsList.push(`Networks: ${details.networks.map((network) => network.name).join(', ')}`)
  }

  if (detailsList.length === 0) {
    return null
  }

  return `${h3('More Info')}\n${detailsList.join('\n')}`
}

export function TrendingMovieDetails({ details }: { details: StandardListing<'movie'>['details'] }) {
  // TODO add genres, will need to cache and parse here.

  const detailsList = []

  if (details.status) {
    detailsList.push(`Status: ${details.status}`)
  }

  if (details.release_date) {
    const epoch = getUnixTime(new Date(details.release_date)).toString()
    detailsList.push(
      `Release Date: ${timestamp(epoch, TimestampStyle.ShortDate)} (${timestamp(epoch, TimestampStyle.RelativeTime)})`,
    )
  }

  if (details.runtime) {
    detailsList.push(`Runtime: ${details.runtime} minutes`)
  }

  if (details.budget && details.revenue) {
    const percentChange = ((details.revenue - details.budget) / details.budget) * 100
    const sign = percentChange >= 0 ? '+' : ''
    detailsList.push(
      `Budget: $${details.budget.toLocaleString()} / Revenue: $${details.revenue.toLocaleString()} (${sign}${percentChange.toFixed(1)}%)`,
    )
  }

  if (details.production_companies) {
    detailsList.push(`Production Companies: ${details.production_companies.map((pc) => pc.name).join(', ')}`)
  }

  if (detailsList.length === 0) {
    return null
  }

  return `${h3('More Info')}\n${detailsList.join('\n')}`
}

function Availability({ type, id }: Readonly<{ type: 'movie' | 'tv'; id: number }>) {
  const query = useQuery({
    queryKey: ['availibility', type, id],
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

export function VoteSection({ voteAverage }: Readonly<{ voteAverage: number }>) {
  const rating = Math.max(Math.round(voteAverage / 2), 0)
  return `\n${subtext('⭐'.repeat(rating))}`
}
