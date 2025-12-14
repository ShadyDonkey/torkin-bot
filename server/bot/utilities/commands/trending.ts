import { format } from 'date-fns'
import { h3 } from 'discord-fmt'
import { Button, Container, Section, Separator } from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/pagination'
import type { TrendingMovieResponse } from '@/server/lib/tmdb'
import { getTrendingMovies, getTrendingTv } from '@/server/lib/tmdb/helpers'
import { paginateArray, unwrap } from '@/server/utilities'

const ITEMS_PER_PAGE = 5

export async function handleMovie(timeWindow: 'day' | 'week', page: number) {
  const [trendingErr, trending] = await unwrap(getTrendingMovies(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending movies found')
  }

  const paginatedItems = await paginateArray(trending, page, ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(paginatedItems.page, paginatedItems.totalPages, 'trending')

  const entries = paginatedItems.results
    .map((movie, index) => {
      if ((!movie.title && !movie.original_title) || !movie.overview || movie.adult) {
        return null
      }

      let body = ''

      body += `${h3(movie.title ?? movie.original_title ?? 'Unknown')}`

      if (movie.release_date) {
        body += ` (${format(new Date(movie.release_date), 'yyyy')})\n`
      } else {
        body += ` (Not Released)\n`
      }

      if (movie.overview) {
        body += `\n${movie.overview.substring(0, 255)}...\n`
      }

      const components: any[] = [
        Section(
          [body],
          Button({
            custom_id: `trending-view-details-${movie.id}`,
            label: `‹ View Details`,
            style: 'Secondary',
            disabled: !movie.id,
          }),
        ),
      ]

      if (index < paginatedItems.results.length - 1) {
        components.push(Separator())
      }

      return components
    })
    .filter((entry) => entry !== null)
    .flat()

  return [Container(...entries), paginationComponents]
}

export async function handleTv(timeWindow: 'day' | 'week', page: number) {
  const [trendingErr, trending] = await unwrap(getTrendingTv(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending TV shows found')
  }

  const paginatedItems = await paginateArray(trending, page, ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(paginatedItems.page, paginatedItems.totalPages, 'trending')

  const entries = paginatedItems.results
    .map((tv, index) => {
      if ((!tv.name && !tv.original_name) || !tv.overview || tv.adult) {
        return null
      }

      let body = ''

      body += `${h3(tv.name ?? tv.original_name ?? 'Unknown')}`

      if (tv.first_air_date) {
        body += ` (${format(new Date(tv.first_air_date), 'yyyy')})\n`
      } else {
        body += ` (Not Released)\n`
      }

      if (tv.overview) {
        body += `\n${tv.overview.substring(0, 255)}...\n`
      }

      const components: any[] = [
        Section(
          [body],
          Button({
            custom_id: `trending-view-details-${tv.id}`,
            label: `‹ View Details`,
            style: 'Secondary',
            disabled: !tv.id,
          }),
        ),
      ]

      if (index < paginatedItems.results.length - 1) {
        components.push(Separator())
      }

      return components
    })
    .filter((entry) => entry !== null)
    .flat()

  return [Container(...entries), paginationComponents]
}
