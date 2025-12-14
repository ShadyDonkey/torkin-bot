import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'
import { toMs } from '@/server/utilities'

export const keyv = new Keyv({
  store: new KeyvRedis(process.env.DRAGONFLY_URL || 'redis://localhost:6379'),
  namespace: 'torkin',
})

export const KEYV_CONFIG = {
  cmd: {
    find: {
      key: (id: string) => `cmd:find:${id}`,
      ttl: toMs('1h'),
    },
    trending: {
      key: (id: string) => `cmd:trending:${id}`,
      ttl: toMs('1h'),
    },
  },
} as const

export type CmdFindCacheEntry = {
  searchType: 'movie' | 'tv'
  query: string
  userId: string
}

export type CmdTrendingCacheEntry = {
  timeWindow: 'day' | 'week'
  type: 'movie' | 'tv'
  userId: string
}
