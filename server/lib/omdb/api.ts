import ky, { type KyInstance } from 'ky'
import type { OMDBResponse } from './schema'

const API_KEY = process.env.OMDB_API_KEY
const API_URL = 'https://www.omdbapi.com/'
let client: KyInstance | null = null

function getClient() {
  client ??= ky.create({
    prefixUrl: API_URL,
    searchParams: {
      apikey: API_KEY,
    },
  })

  return client
}

/**
 * Get a response from OMDB using IMDB ID
 *
 * @export
 * @async
 * @param {string} id - IMDB ID
 * @returns {Promise<OMDBResponse>}
 */
export async function getById(id: string): Promise<OMDBResponse> {
  const client = getClient()
  const response = await client('', {
    method: 'get',
    searchParams: {
      i: id,
    },
  })

  return await response.json<OMDBResponse>()
}
