import { cacheEntry } from '@/server/lib/cache'
import { slugify } from '@/server/utilities'

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
    genres: cacheEntry(() => `${CACHE_PREFIX}:tv:genres`, '14d'),
  },
  movie: {
    details: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:details`, '1d'),
    watchProviders: cacheEntry((id) => `${CACHE_PREFIX}:movie:${slugify(String(id))}:watch_providers`, '1d'),
    genres: cacheEntry(() => `${CACHE_PREFIX}:movie:genres`, '14d'),
  },
  trending: cacheEntry(
    (type: 'movie' | 'tv', timeWindow: 'day' | 'week') => `${CACHE_PREFIX}:trending:${type}:${timeWindow}`,
    '14d',
  ),
} as const
