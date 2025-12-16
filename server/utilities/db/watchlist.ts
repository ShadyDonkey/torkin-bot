import { db } from '@/server/lib/db'
import type { WatchlistState } from '@/server/zenstack/models'

export type CreateWatchlist = {
  discordUserId: string
  name?: string
  description?: string
  state: WatchlistState
  default: boolean
}

export async function createWatchlist(data: CreateWatchlist) {
  if (data.default) {
    await db.watchlist.updateMany({
      where: {
        discordUserId: data.discordUserId,
        default: true,
      },
      data: {
        default: false,
      },
    })
  }

  const watchlist = await db.watchlist.create({
    data: {
      discordUserId: data.discordUserId,
      name: data.name,
      description: data.description,
      state: data.state,
      createdBy: data.discordUserId,
      default: data.default,
    },
  })

  return watchlist
}

export type AddWatchlistItem = {
  discordUserId: string
  watchlistId: string
  externalId: string
  externalProvider: string
}

export async function addItemToWatchlist(data: AddWatchlistItem) {
  const item = await db.watchlistItem.create({
    data: {
      externalId: data.externalId,
      externalProvider: data.externalProvider,
      watchlistId: data.watchlistId,
      createdBy: data.discordUserId,
    },
  })
  return item
}

export type RemoveWatchlistItem = {
  discordUserId: string
  watchlistId: string
  externalId: string
  externalProvider: string
}

export async function removeItemFromWatchlist(data: RemoveWatchlistItem) {
  const item = await db.watchlistItem.delete({
    where: {
      watchlist_item_pkey: {
        externalId: data.externalId,
        watchlistId: data.watchlistId,
      },
      externalProvider: data.externalProvider,
    },
  })
  return item
}
