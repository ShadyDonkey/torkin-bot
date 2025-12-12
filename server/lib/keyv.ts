import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'
import { toMs } from '@/shared/utilities'

export const keyv = new Keyv({
  store: new KeyvRedis(process.env.DRAGONFLY_URL || 'redis://localhost:6379'),
  namespace: 'torkin',
})

export const keyvConfig = {
  cmd: {
    find: {
      key: (id: string) => `cmd:find:${id}`,
      ttl: toMs('1h'),
    },
  },
} as const

export type CmdFindCacheEntry = {
  searchType: 'movie' | 'tv'
  query: string
  userId: string
}
