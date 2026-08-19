import { listAppEmojis } from 'dressed'
import { cache } from '../../lib/cache'

export async function getApplicationEmojis() {
  return cache.getOrSet(
    'lib:discord:application-emojis',
    async () => {
      const response = await listAppEmojis()

      return response.items ?? []
    },
    {
      ttl: '1d',
    },
  )
}
