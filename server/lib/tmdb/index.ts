import ky, { type KyInstance } from 'ky'
import { CACHE_CONFIG, cache } from '@/server/lib/cache'
import { unwrap } from '@/server/utilities'
import type { paths } from './schema'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_URL = 'https://api.themoviedb.org/3/'

let client: KyInstance | null = null

export function getImageUrl(path: string, width?: number) {
  return `https://image.tmdb.org/t/p/${width ? `w${width}` : 'original'}${path.startsWith('/') ? path : `/${path}`}`
}

export async function getTmdbClient() {
  client ??= ky.create({
    prefixUrl: TMDB_API_URL,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
  })

  return client
}

export type WatchProviderRegionsResponse =
  paths['/3/watch/providers/regions']['get']['responses']['200']['content']['application/json']
export async function getWatchProviderRegions(): Promise<WatchProviderRegionsResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<WatchProviderRegionsResponse>(
      CACHE_CONFIG.lib.tmdb.availableWatchProviders.regions.key(),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get('watch/providers/regions')

        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.availableWatchProviders.regions.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No watch provider regions found')
  }

  return result
}

export type WatchProvidersTvResponse =
  paths['/3/watch/providers/tv']['get']['responses']['200']['content']['application/json']
export async function getWatchProvidersTv(): Promise<WatchProvidersTvResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<WatchProvidersTvResponse>(
      CACHE_CONFIG.lib.tmdb.availableWatchProviders.tv.key(),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get('watch/providers/tv')

        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.availableWatchProviders.tv.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No TV watch providers found')
  }

  return result
}

export type WatchProvidersMovieResponse =
  paths['/3/watch/providers/movie']['get']['responses']['200']['content']['application/json']
export async function getWatchProvidersMovie(): Promise<WatchProvidersMovieResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<WatchProvidersMovieResponse>(
      CACHE_CONFIG.lib.tmdb.availableWatchProviders.movie.key(),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get('watch/providers/movie')

        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.availableWatchProviders.movie.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No movie watch providers found')
  }

  return result
}

export type SearchMovieResponse = paths['/3/search/movie']['get']['responses']['200']['content']['application/json']
export async function searchMovie(query: string, page: number = 1): Promise<SearchMovieResponse> {
  const client = await getTmdbClient()
  const response = await client.get('search/movie', {
    searchParams: {
      query,
      page,
      include_adult: false,
    },
  })

  return response.json()
}

export type SearchTvResponse = paths['/3/search/tv']['get']['responses']['200']['content']['application/json']
export async function searchTv(query: string, page: number = 1): Promise<SearchTvResponse> {
  const client = await getTmdbClient()
  const response = await client.get('search/tv', {
    searchParams: {
      query,
      page,
      include_adult: false,
    },
  })

  return response.json()
}

export type MovieDetailsResponse =
  paths['/3/movie/{movie_id}']['get']['responses']['200']['content']['application/json']
export async function getMovieDetails(id: string | number): Promise<MovieDetailsResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<MovieDetailsResponse>(
      CACHE_CONFIG.lib.tmdb.movie.details.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`movie/${id}`)
        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.movie.details.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No movie details found')
  }

  return result
}

export type MovieWatchProvidersResponse =
  paths['/3/movie/{movie_id}/watch/providers']['get']['responses']['200']['content']['application/json']
export async function getMovieWatchProviders(id: string | number): Promise<MovieWatchProvidersResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<MovieWatchProvidersResponse>(
      CACHE_CONFIG.lib.tmdb.movie.watchProviders.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`movie/${id}/watch/providers`)
        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.movie.watchProviders.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No movie watch providers found')
  }

  return result
}

export type TvDetailsResponse = paths['/3/tv/{series_id}']['get']['responses']['200']['content']['application/json']
export async function getTvDetails(id: string | number): Promise<TvDetailsResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<TvDetailsResponse>(
      CACHE_CONFIG.lib.tmdb.tv.details.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`tv/${id}`)
        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.tv.details.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No TV details found')
  }

  return result
}

export type TvWatchProvidersResponse =
  paths['/3/tv/{series_id}/season/{season_number}/watch/providers']['get']['responses']['200']['content']['application/json']
export async function getTvWatchProviders(
  id: string | number,
  season: string | number,
): Promise<TvWatchProvidersResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<TvWatchProvidersResponse>(
      CACHE_CONFIG.lib.tmdb.tv.watchProviders.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`tv/${id}/season/${season}/watch/providers`)
        return response.json()
      },
      {
        ttl: CACHE_CONFIG.lib.tmdb.tv.watchProviders.ttl,
      },
    ),
  )

  if (err) {
    throw err
  }

  if (!result) {
    throw new Error('No TV watch providers found')
  }

  return result
}

export type TrendingMovieResponse =
  paths['/3/trending/movie/{time_window}']['get']['responses']['200']['content']['application/json']
export type TrendingTvResponse =
  paths['/3/trending/tv/{time_window}']['get']['responses']['200']['content']['application/json']
export async function getTrending<T extends 'movie' | 'tv'>(
  type: T,
  timeWindow: 'day' | 'week',
  page: number = 1,
): Promise<T extends 'movie' ? TrendingMovieResponse : TrendingTvResponse> {
  const client = await getTmdbClient()
  const response = await client.get(`trending/${type}/${timeWindow}`, {
    searchParams: { page },
  })
  return response.json()
}

export type MovieGenresResponse = paths['/3/genre/movie/list']['get']['responses']['200']['content']['application/json']
export async function getMovieGenres(): Promise<MovieGenresResponse> {
  const client = await getTmdbClient()
  const response = await client.get('genre/movie/list')
  return response.json()
}

export type TvGenresResponse = paths['/3/genre/tv/list']['get']['responses']['200']['content']['application/json']
export async function getTvGenres(): Promise<TvGenresResponse> {
  const client = await getTmdbClient()
  const response = await client.get('genre/tv/list')
  return response.json()
}
