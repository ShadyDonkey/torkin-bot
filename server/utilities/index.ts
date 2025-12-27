import pkgSlugify from '@sindresorhus/slugify'

export function slugify(str: string) {
  return pkgSlugify(str, {
    separator: '_',
  })
}

export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number,
): {
  results: T[]
  page: number
  totalPages: number
  totalResults: number
} {
  const start = (page - 1) * limit
  const end = start + limit
  const results = items.slice(start, end)
  const totalPages = Math.ceil(items.length / limit)

  return {
    results,
    page,
    totalPages,
    totalResults: items.length,
  }
}

export { parse as toMs } from '@lukeed/ms'
export { to as unwrap } from 'await-to-js'
