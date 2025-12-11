import KeyvRedis from '@keyv/redis'
import { Cacheable } from 'cacheable'
import { Keyv } from 'keyv'
import { LRUCache } from 'lru-cache'

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
  lib: {
    tmdb: {
      watchProviders: {
        availableRegions: {
          key: () => 'lib:tmdb:watch_providers:available_regions',
          ttl: '1d',
        },
        tv: {
          key: () => 'lib:tmdb:watch_providers:tv',
          ttl: '1d',
        },
        movie: {
          key: () => 'lib:tmdb:watch_providers:movie',
          ttl: '1d',
        },
      },
    },
  },
}
