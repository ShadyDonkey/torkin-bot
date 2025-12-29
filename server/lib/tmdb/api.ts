import ky, { type KyInstance, type SearchParamsOption } from 'ky'
import type {
  MovieDetailsResponse,
  MovieGenresResponse,
  MovieWatchProvidersResponse,
  SearchMovieResponse,
  SearchTvResponse,
  TimeWindow,
  TrendingMovieResponse,
  TrendingTvResponse,
  TvDetailsResponse,
  TvGenresResponse,
  TvWatchProvidersResponse,
  TypeSelection,
  WatchProviderRegionsResponse,
  WatchProvidersMovieResponse,
  WatchProvidersTvResponse,
} from '@/server/lib/tmdb/types'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_URL = 'https://api.themoviedb.org/3/'
let client: KyInstance | null = null

function getClient() {
  client ??= ky.create({
    prefixUrl: TMDB_API_URL,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
  })

  return client
}

async function fetch<T>(path: string, params?: SearchParamsOption, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') {
  const client = getClient()
  const response = await client(path, {
    method,
    searchParams: params ?? undefined,
  })

  return await response.json<T>()
}

export async function search<T extends TypeSelection>(type: T, query: string, page: number = 1) {
  return await fetch<T extends 'movie' ? SearchMovieResponse : SearchTvResponse>(`search/${type}`, {
    query,
    page,
    include_adult: false,
  })
}

export async function availableWatchProviders<T extends 'regions' | 'movie' | 'tv'>(type: T) {
  return await fetch<
    T extends 'regions'
      ? WatchProviderRegionsResponse
      : T extends 'movie'
        ? WatchProvidersMovieResponse
        : WatchProvidersTvResponse
  >(`watch/providers/${type}`)
}

export async function details<T extends TypeSelection>(type: T, id: string | number) {
  return await fetch<T extends 'movie' ? MovieDetailsResponse : TvDetailsResponse>(`${type}/${id}`)
}

export async function watchProviders<T extends TypeSelection>(
  type: T,
  options: T extends 'movie' ? { id: string | number } : { id: string | number; season: string | number },
) {
  if (type === 'movie') {
    const movieOptions = options as { id: string | number }
    const url = `movie/${movieOptions.id}/watch/providers`
    return await fetch<MovieWatchProvidersResponse>(url)
  } else {
    const tvOptions = options as { id: string | number; season: string | number }
    const url = `tv/${tvOptions.id}/season/${tvOptions.season}/watch/providers`
    return await fetch<TvWatchProvidersResponse>(url)
  }
}

export async function trending<T extends TypeSelection>(type: T, timeWindow: TimeWindow, page: number = 1) {
  return await fetch<T extends 'movie' ? TrendingMovieResponse : TrendingTvResponse>(`trending/${type}/${timeWindow}`, {
    page,
  })
}

export async function genres<T extends TypeSelection>(type: T) {
  return await fetch<T extends 'movie' ? MovieGenresResponse : TvGenresResponse>(`genre/${type}/list`)
}
