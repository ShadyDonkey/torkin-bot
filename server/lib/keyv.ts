import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'

export const keyv = new Keyv({
  store: new KeyvRedis(process.env.DRAGONFLY_URL || 'redis://localhost:6379'),
  namespace: 'torkin',
})
