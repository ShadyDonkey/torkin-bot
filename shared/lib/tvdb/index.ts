import ky, { type KyInstance } from 'ky'
import { cache } from '@/shared/cache'
import { toMs, unwrap } from '@/shared/utilities'
import type { paths } from './schema'

const TVDB_API_KEY = process.env.TVDB_API_KEY
const TVDB_API_URL = 'https://api4.thetvdb.com/v4/'

let bearerToken: string | null = null
let client: KyInstance | null = null

export async function getTvDBClient() {
  if (client) {
    return client
  }

  if (!bearerToken) {
    // TODO: also check if the token is still valid since it's a 1 month expiry
    const cached = await cache.getOrSet(
      'lib:tvdb:token',
      async () => {
        const [err, token] = await unwrap(login())

        if (err) {
          // TODO: switch to proper logger
          console.error('TVDB login failed', err)
        }

        if (!token) {
          throw new Error('TVDB login failed')
        }

        if (token.data?.token) {
          console.debug('Retrieved TVDB token from cache')
          return token.data?.token
        }

        return null
      },
      { ttl: '14d' },
    )

    if (!cached) {
      throw new Error('TVDB login failed')
    }

    bearerToken = cached
  }

  if (!bearerToken) {
    throw new Error('TVDB API key not found')
  }

  client = ky.create({
    prefixUrl: TVDB_API_URL,
    timeout: toMs('5m'),
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
  })

  return client
}

async function login(): Promise<paths['/login']['post']['responses']['200']['content']['application/json']> {
  const response = await ky.post(`${TVDB_API_URL}login`, {
    json: {
      apikey: TVDB_API_KEY,
    },
  })
  return response.json()
}

export async function search(
  query: string,
  type: 'movie' | 'series',
  page: number = 1,
  limit: number = 5,
): Promise<paths['/search']['get']['responses']['200']['content']['application/json']> {
  const offset = (page - 1) * limit
  const client = await getTvDBClient()
  const response = await client.get(`search`, {
    searchParams: {
      query,
      type,
      offset,
      limit,
    },
  })
  return response.json()
}
