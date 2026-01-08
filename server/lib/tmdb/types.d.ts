import type { paths } from './schema'

export type TypeSelection = 'movie' | 'tv'
export type TimeWindow = 'day' | 'week'
export type StandardListing<T extends TypeSelection = TypeSelection, MD = unknown, TVD = unknown> = {
  id: number
  title?: string
  description?: string
  releaseDate?: string
  thumbnail?: string
  voteAverage: number
  adult: boolean
  type: T
} & ({ type: 'movie'; details: MovieDetailsResponse & MD } | { type: 'tv'; details: TvDetailsResponse & TVD })

export type WatchProviderRegionsResponse =
  paths['/3/watch/providers/regions']['get']['responses']['200']['content']['application/json']
export type WatchProvidersTvResponse =
  paths['/3/watch/providers/tv']['get']['responses']['200']['content']['application/json']
export type WatchProvidersMovieResponse =
  paths['/3/watch/providers/movie']['get']['responses']['200']['content']['application/json']
export type SearchMovieResponse = paths['/3/search/movie']['get']['responses']['200']['content']['application/json']
export type SearchTvResponse = paths['/3/search/tv']['get']['responses']['200']['content']['application/json']
export type MovieDetailsResponse =
  paths['/3/movie/{movie_id}']['get']['responses']['200']['content']['application/json']
export type MovieWatchProvidersResponse =
  paths['/3/movie/{movie_id}/watch/providers']['get']['responses']['200']['content']['application/json']
export type MovieExternalIdsResponse =
  paths['/3/movie/{movie_id}/external_ids']['get']['responses']['200']['content']['application/json']
export type MovieVideosResponse =
  paths['/3/movie/{movie_id}/videos']['get']['responses']['200']['content']['application/json']
export type MovieTranslationsResponse =
  paths['/3/movie/{movie_id}/translations']['get']['responses']['200']['content']['application/json']
export type TvDetailsResponse = paths['/3/tv/{series_id}']['get']['responses']['200']['content']['application/json']
export type TvWatchProvidersResponse =
  paths['/3/tv/{series_id}/season/{season_number}/watch/providers']['get']['responses']['200']['content']['application/json']
export type TvExternalIdsResponse =
  paths['/3/tv/{series_id}/external_ids']['get']['responses']['200']['content']['application/json']
export type TvVideosResponse =
  paths['/3/tv/{series_id}/videos']['get']['responses']['200']['content']['application/json']
export type TvTranslationsResponse =
  paths['/3/tv/{series_id}/translations']['get']['responses']['200']['content']['application/json']
export type TrendingMovieResponse =
  paths['/3/trending/movie/{time_window}']['get']['responses']['200']['content']['application/json']
export type TrendingTvResponse =
  paths['/3/trending/tv/{time_window}']['get']['responses']['200']['content']['application/json']
export type MovieGenresResponse = paths['/3/genre/movie/list']['get']['responses']['200']['content']['application/json']
export type TvGenresResponse = paths['/3/genre/tv/list']['get']['responses']['200']['content']['application/json']

export type ConfigTimezonesResponse =
  paths['/3/configuration/timezones']['get']['responses']['200']['content']['application/json']
export type ConfigCountriesResponse =
  paths['/3/configuration/countries']['get']['responses']['200']['content']['application/json']
export type ConfigLanguagesResponse =
  paths['/3/configuration/languages']['get']['responses']['200']['content']['application/json']
export type MovieRecommendationsResponse =
  paths['/3/movie/{movie_id}/recommendations']['get']['responses']['200']['content']['application/json']
export type TvRecommendationsResponse =
  paths['/3/tv/{series_id}/recommendations']['get']['responses']['200']['content']['application/json']

export type DiscoverMovieQueryParams = paths['/3/discover/movie']['get']['parameters']['query']
export type DiscoverMovieResponse = paths['/3/discover/movie']['get']['responses']['200']['content']['application/json']
export type DiscoverTvQueryParams = paths['/3/discover/tv']['get']['parameters']['query']
export type DiscoverTvResponse = paths['/3/discover/tv']['get']['responses']['200']['content']['application/json']
