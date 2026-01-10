import { getUnixTime } from 'date-fns'
import { h3, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import type { StandardListing, TvEpisodeDetails } from '../../lib/tmdb/types'

export function TrendingTvDetails({ details }: { details: StandardListing<'tv'>['details'] }) {
  // TODO add genres, will need to cache and parse here.

  const detailsList = []

  if (details.status) {
    detailsList.push(`Status: ${details.status}`)
  }

  if (details.next_episode_to_air) {
    const nextEpisode = details.next_episode_to_air as TvEpisodeDetails

    if (nextEpisode.air_date) {
      const epoch = getUnixTime(new Date(nextEpisode.air_date)).toString()
      detailsList.push(
        `Next Episode: ${timestamp(epoch, TimestampStyle.ShortDate)} (${timestamp(epoch, TimestampStyle.RelativeTime)})`,
      )
    }
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

export function VoteSection({ voteAverage }: Readonly<{ voteAverage: number }>) {
  const rating = Math.max(Math.round(voteAverage / 2), 0)
  return `\n${subtext('⭐'.repeat(rating))}`
}
