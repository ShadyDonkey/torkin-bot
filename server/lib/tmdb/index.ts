import { cacheEntry, getOrSet } from '../../lib/cache'
import { slugify, unwrap } from '../../utilities'
import { logger } from '../../utilities/logger'
import type { StandardListing, TimeWindow, TypeSelection } from '../tmdb/types'
import * as api from './api'

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
    recommendations: cacheEntry((id) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:recommendations`, '1d'),
    translations: cacheEntry((id) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:translations`, '1d'),
    episodeDetails: cacheEntry(
      (id, season, episode) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:episode_details:${season}:${episode}`,
      '1d',
    ),
  },
  movie: {
    details: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:details`, '1d'),
    watchProviders: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:watch_providers`, '1d'),
    recommendations: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:recommendations`, '1d'),
    translations: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:translations`, '1d'),
  },
  trending: cacheEntry(
    (type: TypeSelection, timeWindow: TimeWindow) => `${CACHE_PREFIX}:trending:${type}:${timeWindow}`,
    '14d',
  ),
  genres: cacheEntry(() => `${CACHE_PREFIX}:genres`, '14d'),
  config: {
    countries: cacheEntry(() => `${CACHE_PREFIX}:config:countries`, '7d'),
    languages: cacheEntry(() => `${CACHE_PREFIX}:config:languages`, '7d'),
    timezones: cacheEntry(() => `${CACHE_PREFIX}:config:timezones`, '7d'),
  },
} as const

export function getImageUrl(path: string, width?: number) {
  return `https://image.tmdb.org/t/p/${width ? `w${width}` : 'original'}${path.startsWith('/') ? path : `/${path}`}`
}

function standardizeListing<T extends TypeSelection>(type: T, data: StandardListing<T>['details']) {
  const details = data as StandardListing<'movie'>['details'] & StandardListing<'tv'>['details']
  return {
    id: data.id,
    title: details.title ?? details.original_title ?? details.name ?? details.original_name ?? 'Unknown title',
    description: data.overview || 'Missing description',
    releaseDate: details.release_date ?? details.first_air_date,
    thumbnail: data.poster_path,
    voteAverage: data.vote_average,
    adult: data.adult,
    type,
    details,
  } as StandardListing<T>
}

function stdListings<T extends TypeSelection>(type: T, data: StandardListing<T>['details'][]) {
  return data.map((d) => standardizeListing(type, d)).filter((l) => l.title !== 'Unknown title' && !l.adult)
}

export async function search(type: TypeSelection, query: string, page: number = 1) {
  const response = await api.search(type, query, page)
  return stdListings(type, (response.results as never) ?? [])
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

  return stdListings(type, (cached as never) ?? [])
}

export async function getDetails<M, TV>(type: TypeSelection, id: string | number, append = [] as string[]) {
  const details = await getOrSet(
    CACHE_CONFIG[type].details.key(id),
    CACHE_CONFIG[type].details.ttl,
    async () => await api.details<StandardListing<TypeSelection, M, TV>['details']>(type, id, append),
  )

  return standardizeListing(type, details) as StandardListing<TypeSelection, M, TV>
}

export async function getTranslations(type: TypeSelection, id: string | number) {
  return await getOrSet(
    CACHE_CONFIG[type].translations.key(id),
    CACHE_CONFIG[type].translations.ttl,
    async () => await api.translations(type, id),
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

export async function getCountries() {
  return await getOrSet(
    CACHE_CONFIG.config.countries.key(),
    CACHE_CONFIG.config.countries.ttl,
    async () => await api.countries(),
  )
}

export async function getLanguages() {
  return await getOrSet(
    CACHE_CONFIG.config.languages.key(),
    CACHE_CONFIG.config.languages.ttl,
    async () => await api.languages(),
  )
}

export async function getTimezones() {
  return await getOrSet(
    CACHE_CONFIG.config.timezones.key(),
    CACHE_CONFIG.config.timezones.ttl,
    async () => await api.timezones(),
  )
}

export async function getRecommendations(type: TypeSelection, id: string | number) {
  const cached = await getOrSet(
    CACHE_CONFIG[type].recommendations.key(id),
    CACHE_CONFIG[type].recommendations.ttl,
    async () => {
      logger.info(`Requesting ${type} recommendations from TMDB for id ${id}.`)

      const [err, firstPage] = await unwrap(api.recommendations(type, id, 1))

      if (err || !firstPage) {
        return []
      }

      const totalPages = firstPage.total_pages ?? 1
      const pagesToFetch = Math.min(totalPages, MAX_TRENDING_PAGES)

      const pages = await Promise.all(
        Array.from({ length: pagesToFetch }, async (_, i) => (await api.recommendations(type, id, i + 1)).results),
      )

      const allResults = pages.flatMap((page) => page?.flat()).filter(Boolean)
      const uniqueResults = Array.from(
        new Map(allResults.filter((item) => item !== undefined).map((item) => [item.id, item])).values(),
      )
      const filtered = uniqueResults.filter((item) => item.poster_path !== null)
      return filtered.toSorted((a, b) => b.popularity - a.popularity)
    },
  )

  return stdListings(type, (cached as never) ?? [])
}

export async function getEpisodeDetails(id: string | number, season: string | number, episode: string | number) {
  return await getOrSet(
    CACHE_CONFIG.tv.episodeDetails.key(id, season, episode),
    CACHE_CONFIG.tv.episodeDetails.ttl,
    async () => await api.episodeDetails(id, season, episode),
  )
}
