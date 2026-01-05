import { listApplicationEmojis } from 'dressed'
import { cache } from '../../lib/cache'

export async function getApplicationEmojis() {
  return cache.getOrSet(
    'lib:discord:application-emojis',
    async () => {
      const response = await listApplicationEmojis()

      return response.items ?? []
    },
    {
      ttl: '1d',
    },
  )
}
