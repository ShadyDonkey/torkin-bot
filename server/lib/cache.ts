import KeyvRedis from '@keyv/redis'
import { Cacheable } from 'cacheable'
import { Keyv } from 'keyv'
import { LRUCache } from 'lru-cache'
import { unwrap } from '../utilities'

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

export function cacheEntry<T extends unknown[]>(key: (...args: T) => string, ttl: string) {
  return { key, ttl } as { key: (...args: T) => string; ttl: string }
}

export async function getOrSet<T>(key: string, ttl: string, fetcher: () => Promise<T>) {
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
