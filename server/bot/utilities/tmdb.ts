import { format, getUnixTime } from 'date-fns'
import { h2, h3, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import { Container, Section, Thumbnail } from 'dressed'
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

export async function buildDetailsComponent(id: string, type: 'movie' | 'tv') {
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
      console.error(detailsErr)
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
      ? await buildMovieBody(details as MovieDetailsResponse, id)
      : await buildTvBody(details as TvDetailsResponse, id)

  const components = [Container(Section([body], Thumbnail(getImageUrl(details.poster_path ?? ''))))]

  return components
}

async function buildTvBody(details: TvDetailsResponse, id: string) {
  let body = ''

  if (details.first_air_date) {
    body += h2(`${details.name} (${format(new Date(details.first_air_date), 'yyyy')})\n`)
  } else {
    body += `${h2(details.name ?? '')}\n`
  }

  if (details.vote_average) {
    body += buildVoteSection(details.vote_average)
  }

  // TODO add genres, will need to cache and parse here.

  body += `\n${details.overview}\n`

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

  if (detailsList.length > 0) {
    // body += `\n${bold('More Info')}\n${list(...detailsList)}\n`
    body += `${h3('More Info')}\n${detailsList.join('\n')}\n`
  }

  if (details.number_of_seasons > 0) {
    const [watchProvidersErr, watchProviders] = await unwrap(getTvWatchProviders(id, 1))

    if (watchProvidersErr) {
      throw new Error('Failed to get watch providers')
    }

    if (watchProviders?.results) {
      body += `\nWatch Now (US): ${watchProviders.results.US?.flatrate?.length && watchProviders.results.US.flatrate.length > 0 ? watchProviders.results.US?.flatrate?.map((p) => p.provider_name).join(', ') : 'Not Available'}`
    }
  }

  return body
}

async function buildMovieBody(details: MovieDetailsResponse, id: string) {
  let body = ''

  if (details.release_date) {
    body += h2(`${details.title} (${format(new Date(details.release_date), 'yyyy')})\n`)
  } else {
    body += h2(`${details.title}\n`)
  }

  if (details.vote_average) {
    body += buildVoteSection(details.vote_average)
  }

  // TODO add genres, will need to cache and parse here.

  body += `\n${details.overview}\n`

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

  if (detailsList.length > 0) {
    // body += `\n${bold('More Info')}\n${list(...detailsList)}\n`
    body += `${h3('More Info')}\n${detailsList.join('\n')}\n`
  }

  const [watchProvidersErr, watchProviders] = await unwrap(getMovieWatchProviders(id))

  if (watchProvidersErr) {
    throw new Error('Failed to get watch providers')
  }
  if (watchProviders?.results) {
    body += `\nWatch Now (US): ${watchProviders.results.US?.flatrate?.length && watchProviders.results.US.flatrate.length > 0 ? watchProviders.results.US?.flatrate?.map((p) => p.provider_name).join(', ') : 'Not Available'}`
  }

  return body
}

function buildVoteSection(voteAverage: number) {
  const rating = Math.max(Math.round(voteAverage / 2), 0)
  return subtext(`${'⭐'.repeat(rating)}\n`)
}
