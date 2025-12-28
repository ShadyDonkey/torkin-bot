import { slugify } from '@/server/utilities'

const CACHE_CONFIG = {
  availableWatchProviders: {
    regions: {
      key: () => 'lib:tmdb:available_watch_providers:regions',
      ttl: '1d',
    },
    tv: {
      key: () => 'lib:tmdb:available_watch_providers:tv',
      ttl: '1d',
    },
    movie: {
      key: () => 'lib:tmdb:available_watch_providers:movie',
      ttl: '1d',
    },
  },
  tv: {
    details: {
      key: (id: string) => `lib:tmdb:tv:${slugify(id)}:details`,
      ttl: '1d',
    },
    watchProviders: {
      key: (id: string) => `lib:tmdb:tv:${slugify(id)}:watch_providers`,
      ttl: '1d',
    },
    genres: {
      key: () => `lib:tmdb:tv:genres`,
      ttl: '14d',
    },
  },
  movie: {
    details: {
      key: (id: string) => `lib:tmdb:movie:${slugify(id)}:details`,
      ttl: '1d',
    },
    watchProviders: {
      key: (id: string) => `lib:tmdb:movie:${slugify(id)}:watch_providers`,
      ttl: '1d',
    },
    genres: {
      key: () => `lib:tmdb:movie:genres`,
      ttl: '14d',
    },
  },
  trending: {
    key: (type: 'movie' | 'tv', timeWindow: 'day' | 'week') => `lib:tmdb:trending:${type}:${timeWindow}`,
    ttl: '14d',
  },
} as const
