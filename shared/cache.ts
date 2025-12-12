import KeyvRedis from '@keyv/redis'
import slugify from '@sindresorhus/slugify'
import { Cacheable } from 'cacheable'
import { Keyv } from 'keyv'
import { LRUCache } from 'lru-cache'
import { toMs } from '@/shared/utilities'

const primary = new Keyv({
  store: new LRUCache({
    max: 2000,
  }),
})

const secondary = new KeyvRedis(process.env.DRAGONFLY_URL || 'redis://localhost:6379')

export const cache = new Cacheable({
  primary,
  secondary,
  namespace: 'torkin-cache',
  stats: true,
  ttl: '1h',
})

export const cacheConfig = {
  cmd: {
    find: {
      key: (id: string) => `cmd:find:${id}`,
      ttl: toMs('1h'),
    },
  },
  lib: {
    tmdb: {
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
      },
    },
  },
} as const
