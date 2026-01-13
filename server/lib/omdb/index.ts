import { slugify } from '../../utilities'
import { getOrSet } from '../cache'
import * as api from './api'

export async function getById(id: string) {
  return await getOrSet(`lib:omdb:response:${slugify(id)}`, '7d', async () => await api.getById(id))
}
