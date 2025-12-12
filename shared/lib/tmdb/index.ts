import ky, { type KyInstance } from 'ky'
import { cache, cacheConfig } from '@/shared/cache'
import { toMs, unwrap } from '@/shared/utilities'
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

type WatchProviderRegionsResponse =
  paths['/3/watch/providers/regions']['get']['responses']['200']['content']['application/json']
export async function getWatchProviderRegions(): Promise<WatchProviderRegionsResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<WatchProviderRegionsResponse>(
      cacheConfig.lib.tmdb.availableWatchProviders.regions.key(),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get('watch/providers/regions')

        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.availableWatchProviders.regions.ttl,
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

type WatchProvidersTvResponse = paths['/3/watch/providers/tv']['get']['responses']['200']['content']['application/json']
export async function getWatchProvidersTv(): Promise<WatchProvidersTvResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<WatchProvidersTvResponse>(
      cacheConfig.lib.tmdb.availableWatchProviders.tv.key(),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get('watch/providers/tv')

        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.availableWatchProviders.tv.ttl,
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

type WatchProvidersMovieResponse =
  paths['/3/watch/providers/movie']['get']['responses']['200']['content']['application/json']
export async function getWatchProvidersMovie(): Promise<WatchProvidersMovieResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<WatchProvidersMovieResponse>(
      cacheConfig.lib.tmdb.availableWatchProviders.movie.key(),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get('watch/providers/movie')

        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.availableWatchProviders.movie.ttl,
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

type SearchMovieResponse = paths['/3/search/movie']['get']['responses']['200']['content']['application/json']
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

type SearchTvResponse = paths['/3/search/tv']['get']['responses']['200']['content']['application/json']
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

type MovieDetailsResponse = paths['/3/movie/{movie_id}']['get']['responses']['200']['content']['application/json']
export async function getMovieDetails(id: string | number): Promise<MovieDetailsResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<MovieDetailsResponse>(
      cacheConfig.lib.tmdb.movie.details.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`movie/${id}`)
        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.movie.details.ttl,
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

type MovieWatchProvidersResponse =
  paths['/3/movie/{movie_id}/watch/providers']['get']['responses']['200']['content']['application/json']
export async function getMovieWatchProviders(id: string | number): Promise<MovieWatchProvidersResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<MovieWatchProvidersResponse>(
      cacheConfig.lib.tmdb.movie.watchProviders.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`movie/${id}/watch/providers`)
        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.movie.watchProviders.ttl,
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

type TvDetailsResponse = paths['/3/tv/{series_id}']['get']['responses']['200']['content']['application/json']
export async function getTvDetails(id: string | number): Promise<TvDetailsResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<TvDetailsResponse>(
      cacheConfig.lib.tmdb.tv.details.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`tv/${id}`)
        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.tv.details.ttl,
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

type TvWatchProvidersResponse =
  paths['/3/tv/{series_id}/season/{season_number}/watch/providers']['get']['responses']['200']['content']['application/json']
export async function getTvWatchProviders(
  id: string | number,
  season: string | number,
): Promise<TvWatchProvidersResponse> {
  const [err, result] = await unwrap(
    cache.getOrSet<TvWatchProvidersResponse>(
      cacheConfig.lib.tmdb.tv.watchProviders.key(id.toString()),
      async () => {
        const client = await getTmdbClient()
        const response = await client.get(`tv/${id}/season/${season}/watch/providers`)
        return response.json()
      },
      {
        ttl: cacheConfig.lib.tmdb.tv.watchProviders.ttl,
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
