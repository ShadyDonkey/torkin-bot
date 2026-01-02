import ky, { type KyInstance, type SearchParamsOption } from 'ky'
import type {
  ConfigCountriesResponse,
  ConfigLanguagesResponse,
  ConfigTimezonesResponse,
  MovieGenresResponse,
  MovieRecommendationsResponse,
  MovieWatchProvidersResponse,
  SearchMovieResponse,
  SearchTvResponse,
  TimeWindow,
  TrendingMovieResponse,
  TrendingTvResponse,
  TvGenresResponse,
  TvRecommendationsResponse,
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

export async function search(type: TypeSelection, query: string, page: number = 1) {
  return (await fetch)<typeof type extends 'movie' ? SearchMovieResponse : SearchTvResponse>(`search/${type}`, {
    query,
    page,
    include_adult: false,
  })
}

export async function availableWatchProviders(type: 'regions' | 'movie' | 'tv') {
  return await fetch<
    TypeSelection extends 'regions'
      ? WatchProviderRegionsResponse
      : TypeSelection extends 'movie'
        ? WatchProvidersMovieResponse
        : WatchProvidersTvResponse
  >(`watch/providers/${type}`)
}

export async function details<T>(type: TypeSelection, id: string | number, append = [] as string[]) {
  return await fetch<T>(`${type}/${id}`, {
    append_to_response: append.join(','),
  })
}

export async function watchProviders(
  type: TypeSelection,
  options: TypeSelection extends 'movie' ? { id: string | number } : { id: string | number; season: string | number },
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

export async function trending(type: TypeSelection, timeWindow: TimeWindow, page: number = 1) {
  return await fetch<typeof type extends 'movie' ? TrendingMovieResponse : TrendingTvResponse>(
    `trending/${type}/${timeWindow}`,
    {
      page,
    },
  )
}

export async function genres(type: TypeSelection) {
  return await fetch<typeof type extends 'movie' ? MovieGenresResponse : TvGenresResponse>(`genre/${type}/list`)
}

export async function timezones() {
  return await fetch<ConfigTimezonesResponse>('configuration/timezones')
}

export async function countries() {
  return await fetch<ConfigCountriesResponse>('configuration/countries')
}

export async function languages() {
  return await fetch<ConfigLanguagesResponse>('configuration/languages')
}

export async function recommendations(type: TypeSelection, id: string | number, page: number = 1) {
  return await fetch<typeof type extends 'movie' ? MovieRecommendationsResponse : TvRecommendationsResponse>(
    `${type}/${id}/recommendations`,
    { page },
  )
}
