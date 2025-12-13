export async function paginateArray<T>(
  items: T[],
  page: number,
  limit: number,
): Promise<{
  results: T[]
  page: number
  total_pages: number
  total_results: number
}> {
  const start = (page - 1) * limit
  const end = start + limit
  const results = items.slice(start, end)
  const total_pages = Math.ceil(items.length / limit)

  return {
    results,
    page,
    total_pages,
    total_results: items.length,
  }
}

export { parse as toMs } from '@lukeed/ms'
export { to as unwrap } from 'await-to-js'
