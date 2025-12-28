import { cache, cacheEntry } from '@/server/lib/cache'
import * as api from '@/server/lib/tmdb/api'
import type { TimeWindow, TypeSelection } from '@/server/lib/tmdb/types'
import { slugify, unwrap } from '@/server/utilities'
import { logger } from '@/server/utilities/logger'

const MAX_TRENDING_PAGES = 5
const CACHE_PREFIX = 'lib:tmdb'
const CACHE_CONFIG = {
  watchProviders: {
    regions: cacheEntry(() => `${CACHE_PREFIX}:watch_providers:regions`, '1d'),
    tv: cacheEntry(() => `${CACHE_PREFIX}:watch_providers:tv`, '1d'),
    movie: cacheEntry(() => `${CACHE_PREFIX}:watch_providers:movie`, '1d'),
  },
  tv: {
    details: cacheEntry((id) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:details`, '1d'),
    watchProviders: cacheEntry((id) => `${CACHE_PREFIX}:tv:${slugify(String(id))}:watch_providers`, '1d'),
    genres: cacheEntry(() => `${CACHE_PREFIX}:tv:genres`, '14d'),
  },
  movie: {
    details: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:details`, '1d'),
    watchProviders: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:watch_providers`, '1d'),
    genres: cacheEntry(() => `${CACHE_PREFIX}:movie:genres`, '14d'),
  },
  trending: cacheEntry(
    (type: TypeSelection, timeWindow: TimeWindow) => `${CACHE_PREFIX}:trending:${type}:${timeWindow}`,
    '14d',
  ),
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

export async function search<T extends TypeSelection>(type: T, query: string, page: number = 1) {
  return await api.search<T>(type, query, page)
}

export async function getTrending<T extends TypeSelection>(type: T, timeWindow: TimeWindow) {
  return await getOrSet(CACHE_CONFIG.trending.key(type, timeWindow), CACHE_CONFIG.trending.ttl, async () => {
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
}

export async function getGenres<T extends TypeSelection>(type: T) {
  return await getOrSet(
    CACHE_CONFIG[type].genres.key(),
    CACHE_CONFIG[type].genres.ttl,
    async () => await api.genres(type),
  )
}

export async function getDetails<T extends TypeSelection>(type: T, id: string | number) {
  return await getOrSet(
    CACHE_CONFIG[type].details.key(id),
    CACHE_CONFIG[type].details.ttl,
    async () => await api.details(type, id),
  )
}

export async function getItemWatchProviders<T extends TypeSelection>(
  type: T,
  options: T extends 'movie' ? { id: string | number } : { id: string | number; season: string | number },
) {
  return await getOrSet(
    CACHE_CONFIG[type].watchProviders.key(options.id),
    CACHE_CONFIG[type].watchProviders.ttl,
    async () => await api.watchProviders(type, options),
  )
}

export async function getAvailableWatchProviders<T extends 'regions' | 'movie' | 'tv'>(type: T) {
  return await getOrSet(
    CACHE_CONFIG.watchProviders[type].key(),
    CACHE_CONFIG.watchProviders[type].ttl,
    async () => await api.availableWatchProviders(type),
  )
}
