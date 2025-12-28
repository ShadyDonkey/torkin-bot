import { CACHE_CONFIG, cache } from '@/server/lib/cache'
import type { TrendingMovieResponse, TrendingTvResponse } from '@/server/lib/tmdb'
import { getMovieGenres, getTrending, getTvGenres } from '@/server/lib/tmdb'
import { unwrap } from '@/server/utilities'
import { logger } from '@/server/utilities/logger'

const MAX_TRENDING_PAGES = 4

export interface StandardTrendingListing {
  id: number
  title?: string
  description?: string
  releaseDate?: string
  thumbnail?: string
  adult: boolean
}

export async function getTrendingMovies(timeWindow: 'day' | 'week'): Promise<StandardTrendingListing[]> {
  const [cacheErr, cached] = await unwrap(
    cache.getOrSet<TrendingMovieResponse['results']>(
      CACHE_CONFIG.lib.tmdb.trending.key('movie', timeWindow),
      async () => requestTrendingMovies(timeWindow),
    ),
  )

  if (cacheErr) {
    logger.error({ error: cacheErr }, 'Error fetching cached trending movies:')
  }

  return (cached || []).map((l) => ({
    id: l.id,
    title: l.title ?? l.original_title,
    description: l.overview,
    releaseDate: l.release_date,
    thumbnail: l.poster_path,
    adult: l.adult,
  }))
}

export async function requestTrendingMovies(timeWindow: 'day' | 'week'): Promise<TrendingMovieResponse['results']> {
  logger.info('Requesting all trending movies from TMDB.')
  const pages = await Promise.all(
    Array.from({ length: MAX_TRENDING_PAGES }, (_, i) => getTrending('movie', timeWindow, i + 1)),
  )

  const allResults = pages.flatMap((page) => page.results || [])
  const uniqueResults = Array.from(new Map(allResults.map((movie) => [movie.id, movie])).values())
  const filtered = uniqueResults.filter((movie) => movie.poster_path !== null)
  filtered.sort((a, b) => b.popularity - a.popularity)

  return filtered
}

export async function getTrendingTv(timeWindow: 'day' | 'week'): Promise<StandardTrendingListing[]> {
  const [cacheErr, cached] = await unwrap(
    cache.getOrSet<TrendingTvResponse['results']>(CACHE_CONFIG.lib.tmdb.trending.key('tv', timeWindow), async () =>
      requestTrendingTv(timeWindow),
    ),
  )

  if (cacheErr) {
    logger.error({ error: cacheErr }, 'Error fetching cached trending TV shows:')
  }

  return (cached || []).map((l) => ({
    id: l.id,
    title: l.name ?? l.original_name,
    description: l.overview,
    releaseDate: l.first_air_date,
    thumbnail: l.poster_path,
    adult: l.adult,
  }))
}

export async function requestTrendingTv(timeWindow: 'day' | 'week'): Promise<TrendingTvResponse['results']> {
  logger.info('Requesting all trending TV shows from TMDB.')
  const pages = await Promise.all(
    Array.from({ length: MAX_TRENDING_PAGES }, (_, i) => getTrending('tv', timeWindow, i + 1)),
  )

  const allResults = pages.flatMap((page) => page.results || [])
  const filtered = allResults.filter((tv) => tv.poster_path !== null)
  filtered.sort((a, b) => b.popularity - a.popularity)

  return filtered
}

export async function parseGenreIds(ids: number[]) {
  const genres = await getGenres()

  return ids.map((id) => genres[id]).filter((name) => !!name)
}

export async function getGenres() {
  const [cacheErr, cached] = await unwrap(
    cache.getOrSet<Record<number, string>>(CACHE_CONFIG.lib.tmdb.genres.key(), async () => {
      const genres: Record<number, string> = {}
      const [movieErr, movieGenres] = await unwrap(getMovieGenres())
      const [tvErr, tvGenres] = await unwrap(getTvGenres())

      if (movieErr) {
        logger.error({ error: movieErr }, 'Error fetching movie genres:')
      }

      if (tvErr) {
        logger.error({ error: tvErr }, 'Error fetching TV genres:')
      }

      movieGenres?.genres?.forEach((genre) => {
        if (genre.id && genre.name) {
          genres[genre.id] = genre.name
        }
      })

      tvGenres?.genres?.forEach((genre) => {
        if (genre.id && genre.name) {
          genres[genre.id] = genre.name
        }
      })

      return genres
    }),
  )

  if (cacheErr) {
    logger.error({ error: cacheErr }, 'Error fetching cached genres:')
  }

  return cached || {}
}
