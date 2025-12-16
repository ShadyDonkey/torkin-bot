// TODO: This may not be the right env var
const BASE_URL = process.env.BASE_URL ?? 'https://torkin.xyz'

export function watchlistIdToUrl(watchlistId: string): string {
  // TODO: make this a short url
  return `${BASE_URL}/watchlist/${watchlistId}`
}
