import ky, { type KyInstance } from 'ky'
import { cache } from '@/shared/cache'
import { toMs, unwrap } from '@/shared/utilities'
import type { paths } from './schema'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_URL = 'https://api.themoviedb.org/3/'

let client: KyInstance | null = null

export async function getTmdbClient() {
  client ??= ky.create({
    prefixUrl: TMDB_API_URL,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
  })

  return client
}

export async function getWatchProviderRegions(): Promise<
  paths['/3/watch/providers/regions']['get']['responses']['200']['content']['application/json']
> {
  const client = await getTmdbClient()
  const response = await client.get('watch/providers/regions')

  return response.json()
}

export async function getWatchProvidersTv(): Promise<
  paths['/3/watch/providers/tv']['get']['responses']['200']['content']['application/json']
> {
  const client = await getTmdbClient()
  const response = await client.get('watch/providers/tv')

  return response.json()
}

export async function getWatchProvidersMovie(): Promise<
  paths['/3/watch/providers/movie']['get']['responses']['200']['content']['application/json']
> {
  const client = await getTmdbClient()
  const response = await client.get('watch/providers/movie')

  return response.json()
}
