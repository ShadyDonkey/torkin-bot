import { Container, Section, TextDisplay, Thumbnail } from '@dressed/react'
import { format, getUnixTime } from 'date-fns'
import { h3, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import { logger } from '@/server/bot/utilities/logger'
import {
  getImageUrl,
  getMovieDetails,
  getMovieWatchProviders,
  getTvDetails,
  getTvWatchProviders,
  type MovieDetailsResponse,
  type TvDetailsResponse,
} from '@/server/lib/tmdb'
import { unwrap } from '@/server/utilities'

const REQUIRED_ATTRIBUTES_MOVIE = ['title', 'overview']
const REQUIRED_ATTRIBUTES_TV = ['name', 'overview', 'status']

export async function buildSelectionDetails(id: string, type: 'movie' | 'tv') {
  let detailsErr: Error | null = null
  let details: TvDetailsResponse | MovieDetailsResponse | null | undefined = null
  let requiredAttributes: string[] = []
  const missingAttributes: string[] = []

  if (type === 'movie') {
    ;[detailsErr, details] = await unwrap<MovieDetailsResponse>(getMovieDetails(id))
    requiredAttributes = REQUIRED_ATTRIBUTES_MOVIE
  } else if (type === 'tv') {
    ;[detailsErr, details] = await unwrap<TvDetailsResponse>(getTvDetails(id))
    requiredAttributes = REQUIRED_ATTRIBUTES_TV
  }

  if (detailsErr || !details) {
    if (detailsErr) {
      logger.error(detailsErr)
    }

    throw new Error('No details found')
  }

  for (const attribute of requiredAttributes) {
    if (!(attribute in details)) {
      missingAttributes.push(attribute)
    }
  }

  if (missingAttributes.length > 0) {
    throw new Error(`Missing required attributes: ${missingAttributes.join(', ')}`)
  }

  const body =
    type === 'movie'
      ? buildMovieBody(details as MovieDetailsResponse, id)
      : buildTvBody(details as TvDetailsResponse, id)

  return (
    <Container>
      <Section accessory={<Thumbnail media={getImageUrl(details.poster_path ?? '')} />}>{await body}</Section>
    </Container>
  )
}

async function buildTvBody(details: TvDetailsResponse, id: string) {
  // TODO add genres, will need to cache and parse here.

  function DetailsList() {
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

    if (detailsList.length === 0) return null

    return `${h3('More Info')}\n${detailsList.join('\n')}`
  }

  return (
    <>
      ## {details.name} {details.first_air_date && `(${format(new Date(details.first_air_date), 'yyyy')})`}
      {'\n'}
      {details.vote_average > 0 && <VoteSection voteAverage={details.vote_average} />}
      {details.overview}
      {'\n'}
      <DetailsList />
      {details.number_of_seasons > 0 && (await buildAvailability(id, 'tv'))}
    </>
  )
}

async function buildMovieBody(details: MovieDetailsResponse, id: string) {
  // TODO add genres, will need to cache and parse here.

  function DetailsList() {
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

    if (detailsList.length === 0) return null

    return `${h3('More Info')}\n${detailsList.join('\n')}`
  }

  return (
    <>
      ## {details.title} {details.release_date && `(${format(new Date(details.release_date), 'yyyy')})`}
      {'\n'}
      {details.vote_average > 0 && <VoteSection voteAverage={details.vote_average} />}
      {details.overview}
      {'\n'}
      <DetailsList />
      {await buildAvailability(id, 'movie')}
    </>
  )
}

async function buildAvailability(id: string | number, type: 'movie' | 'tv') {
  const [watchProvidersErr, watchProviders] = await unwrap(
    (type === 'movie' ? getMovieWatchProviders : getTvWatchProviders)(id, 1),
  )

  if (watchProvidersErr) {
    throw new Error('Failed to get watch providers')
  }

  if (watchProviders?.results) {
    return (
      <TextDisplay>
        Watch Now (US):
        {watchProviders.results.US?.flatrate?.length && watchProviders.results.US.flatrate.length > 0
          ? watchProviders.results.US?.flatrate?.map((p) => p.provider_name).join(', ')
          : 'Not Available'}
      </TextDisplay>
    )
  }
}

function VoteSection({ voteAverage }: Readonly<{ voteAverage: number }>) {
  const rating = Math.max(Math.round(voteAverage / 2), 0)
  return (
    <>
      {subtext('⭐'.repeat(rating))}
      {'\n'}
    </>
  )
}
