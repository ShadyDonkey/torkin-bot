import type { paths } from './schema'

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
export type TvDetailsResponse = paths['/3/tv/{series_id}']['get']['responses']['200']['content']['application/json']
export type TvWatchProvidersResponse =
  paths['/3/tv/{series_id}/season/{season_number}/watch/providers']['get']['responses']['200']['content']['application/json']
export type TrendingMovieResponse =
  paths['/3/trending/movie/{time_window}']['get']['responses']['200']['content']['application/json']
export type TrendingTvResponse =
  paths['/3/trending/tv/{time_window}']['get']['responses']['200']['content']['application/json']
export type MovieGenresResponse = paths['/3/genre/movie/list']['get']['responses']['200']['content']['application/json']
export type TvGenresResponse = paths['/3/genre/tv/list']['get']['responses']['200']['content']['application/json']
