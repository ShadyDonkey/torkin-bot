import { cache, cacheEntry } from '@/server/lib/cache'
import * as api from '@/server/lib/tmdb/api'
import type {
  SearchMovieResponse,
  SearchTvResponse,
  StandardListing,
  TimeWindow,
  TrendingMovieResponse,
  TrendingTvResponse,
  TypeSelection,
} from '@/server/lib/tmdb/types'
import { slugify, unwrap } from '@/server/utilities'
import { logger } from '@/server/utilities/logger'

const MAX_TRENDING_PAGES = 5
const CACHE_PREFIX = 'lib:tmdb'
export const CACHE_CONFIG = {
  watchProviders: {
    regions: cacheEntry(() => `${CACHE_PREFIX}:watch_providers:regions`, '1d'),
    tv: cacheEntry(() => `${CACHE_PREFIX}:watch_providers:tv`, '1d'),
    movie: cacheEntry(() => `${CACHE_PREFIX}:watch_providers:movie`, '1d'),
  },
  tv: {
    details: cacheEntry((id) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:details`, '1d'),
    watchProviders: cacheEntry((id) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:watch_providers`, '1d'),
  },
  movie: {
    details: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:details`, '1d'),
    watchProviders: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:watch_providers`, '1d'),
  },
  trending: cacheEntry(
    (type: TypeSelection, timeWindow: TimeWindow) => `${CACHE_PREFIX}:trending:${type}:${timeWindow}`,
    '14d',
  ),
  genres: cacheEntry(() => `${CACHE_PREFIX}:genres`, '14d'),
} as const

async function getOrSet<T>(key: string, ttl: string, fetcher: () => Promise<T>) {
  const [err, result] = await unwrap(
    cache.getOrSet(key, fetcher, {
      ttl,
    }),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No result found')
  }

  return result
}

export function getImageUrl(path: string, width?: number) {
  return `https://image.tmdb.org/t/p/${width ? `w${width}` : 'original'}${path.startsWith('/') ? path : `/${path}`}`
}

export async function search(type: TypeSelection, query: string, page: number = 1) {
  const response = await api.search(type, query, page)
  if (type === 'movie') {
    return (
      (response as SearchMovieResponse).results?.map(
        (r) =>
          ({
            id: r.id,
            title: r.title ?? r.original_title,
            description: r.overview,
            releaseDate: r.release_date,
            thumbnail: r.poster_path,
            voteAverage: r.vote_average,
            adult: r.adult,
            type: 'movie',
            details: r,
          }) as StandardListing<'movie'>,
      ) ?? []
    )
  }
  if (type === 'tv') {
    return (
      (response as SearchTvResponse).results?.map(
        (r) =>
          ({
            id: r.id,
            title: r.name ?? r.original_name,
            description: r.overview,
            releaseDate: r.first_air_date,
            thumbnail: r.poster_path,
            voteAverage: r.vote_average,
            adult: r.adult,
            type: 'tv',
            details: r,
          }) as StandardListing<'tv'>,
      ) ?? []
    )
  }
  return []
}

export async function getTrending(type: TypeSelection, timeWindow: TimeWindow) {
  const cached = await getOrSet(CACHE_CONFIG.trending.key(type, timeWindow), CACHE_CONFIG.trending.ttl, async () => {
    logger.info(`Requesting trending ${type} from TMDB for ${timeWindow}.`)

    const pages = await Promise.all(
      Array.from({ length: MAX_TRENDING_PAGES }, async (_, i) => (await api.trending(type, timeWindow, i + 1)).results),
    )

    const allResults = pages.flatMap((page) => page?.flat()).filter(Boolean)
    const uniqueResults = Array.from(
      new Map(allResults.filter((item) => item !== undefined).map((item) => [item.id, item])).values(),
    )
    const filtered = uniqueResults.filter((item) => item.poster_path !== null)
    return filtered.toSorted((a, b) => b.popularity - a.popularity)
  })

  if (type === 'movie') {
    return (
      (cached as TrendingMovieResponse['results'])?.map(
        (r) =>
          ({
            id: r.id,
            title: r.title ?? r.original_title,
            description: r.overview,
            releaseDate: r.release_date,
            thumbnail: r.poster_path,
            voteAverage: r.vote_average,
            adult: r.adult,
            type: 'movie',
            details: r,
          }) as StandardListing<'movie'>,
      ) ?? []
    )
  }

  return (
    (cached as TrendingTvResponse['results'])?.map(
      (r) =>
        ({
          id: r.id,
          title: r.name ?? r.original_name,
          description: r.overview,
          releaseDate: r.first_air_date,
          thumbnail: r.poster_path,
          voteAverage: r.vote_average,
          adult: r.adult,
          type: 'tv',
          details: r,
        }) as StandardListing<'tv'>,
    ) ?? []
  )
}

export async function getDetails<T>(type: TypeSelection, id: string | number, append = [] as string[]) {
  return await getOrSet(
    CACHE_CONFIG[type].details.key(id),
    CACHE_CONFIG[type].details.ttl,
    async () => await api.details<T>(type, id, append),
  )
}

export async function getItemWatchProviders(
  type: TypeSelection,
  options: TypeSelection extends 'movie' ? { id: string | number } : { id: string | number; season: string | number },
) {
  return await getOrSet(
    CACHE_CONFIG[type].watchProviders.key(options.id),
    CACHE_CONFIG[type].watchProviders.ttl,
    async () => await api.watchProviders(type, options),
  )
}

export async function getAvailableWatchProviders(type: 'regions' | 'movie' | 'tv') {
  return await getOrSet(
    CACHE_CONFIG.watchProviders[type].key(),
    CACHE_CONFIG.watchProviders[type].ttl,
    async () => await api.availableWatchProviders(type),
  )
}

export async function getGenres() {
  return await getOrSet(CACHE_CONFIG.genres.key(), CACHE_CONFIG.genres.ttl, async () => {
    const genres: Record<number, string> = {}
    const [movieErr, movieGenres] = await unwrap(api.genres('movie'))
    const [tvErr, tvGenres] = await unwrap(api.genres('tv'))

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
  })
}

export async function mapGenreIdsToRecord(ids: number[]) {
  const genres = await getGenres()

  return ids.map((id) => genres[id]).filter(Boolean)
}
