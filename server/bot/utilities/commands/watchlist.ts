import type { APIComponentInContainer } from 'discord-api-types/v10'
import { bold, link, subtext } from 'discord-fmt'
import { Button, Container, Label, Section, SelectMenu, Separator, TextDisplay, TextInput } from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/builders'
import { watchlistIdToUrl } from '@/server/bot/utilities/website'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import carp from '@/server/utilities/carp'
import { type Watchlist, WatchlistState } from '@/server/zenstack/models'

export function modalComponents() {
  return {
    title: 'Create Watchlist',
    custom_id: 'watchlist-create',
    components: [
      Label(
        'Name',
        TextInput({
          custom_id: 'name',
          placeholder: 'Enter watchlist name',
          value: 'My Watchlist',
          style: 'Short',
          required: true,
          min_length: 3,
          max_length: 100,
        }),
      ),
      Label(
        'Description',
        TextInput({
          custom_id: 'description',
          placeholder: 'Enter watchlist description',
          required: false,
          style: 'Paragraph',
          max_length: 255,
        }),
      ),
      Label(
        'Privacy',
        SelectMenu({
          custom_id: 'privacy',
          type: 'String',
          required: true,
          options: [
            {
              label: 'Public',
              value: 'public',
              default: true,
            },
            // {
            //   label: 'Private',
            //   value: 'private',
            //   default: true,
            // },
            // {
            //   label: 'Unlisted',
            //   value: 'unlisted',
            // },
          ],
        }),
      ),
      Label(
        'Make default watchlist?',
        SelectMenu({
          custom_id: 'default',
          type: 'String',
          required: true,
          options: [
            {
              label: 'Yes',
              value: 'yes',
            },
            {
              label: 'No',
              value: 'no',
              default: true,
            },
          ],
        }),
      ),
    ],
  }
}

export function convertToState(str: string): WatchlistState {
  const stateMap: Record<string, WatchlistState> = {
    public: WatchlistState.PUBLIC,
    // private: WatchlistState.PRIVATE,
    // unlisted: WatchlistState.UNLISTED,
  }

  return stateMap[str.toLowerCase().trim()] ?? WatchlistState.PUBLIC
  // ?? WatchlistState.PRIVATE
}

export function convertStateToLabel(state: WatchlistState): string {
  const stateMap: Record<WatchlistState, string> = {
    [WatchlistState.PUBLIC]: 'Public',
    // [WatchlistState.PRIVATE]: 'Private',
    // [WatchlistState.UNLISTED]: 'Unlisted',
  }

  return stateMap[state] ?? 'Unknown State'
}

export async function buildListComponents(
  userId: string,
  page: number,
  {
    limit = 5,
    sortKey = 'createdAt',
    sortDirection = 'desc',
  }: {
    limit?: number
    sortKey?: keyof Watchlist
    sortDirection?: 'asc' | 'desc'
  } = {},
) {
  const skip = (page - 1) * limit

  const [err, lists] = await unwrap(
    db.watchlist.findMany({
      where: {
        discordUserId: userId,
      },
      orderBy: {
        [sortKey]: sortDirection,
      },
      skip,
      take: limit,
    }),
  )

  if (err) {
    console.error({ err })
    return [TextDisplay('Could not retrieve watchlists, please try again later.')]
  }

  const count = await db.watchlist.count({ where: { discordUserId: userId } })
  const totalPages = Math.ceil(count / limit)
  const pagination = buildPaginationButtons(page, totalPages, 'watchlist-results')

  const listComponents = carp<APIComponentInContainer>(
    lists.flatMap((list, index) => [
      Section(
        carp(
          bold(`${list.name ?? 'Unnamed Watchlist'} - ${convertStateToLabel(list.state)}`),
          list.description && `\n${list.description}`,
          `\n${subtext(link('View on Torkin ↗', watchlistIdToUrl(list.id)))}`,
        ),
        // TODO: I don't like this wording...maybe come back to this.
        Button({
          custom_id: `watchlist-${list.id}-details-${page}`,
          label: 'Details',
          style: 'Secondary',
        }),
      ),
      index !== lists.length - 1 && Separator(),
    ]),
  )

  return [
    // TextDisplay(codeBlock(JSON.stringify(lists, null, 2))),
    Container(...listComponents),
    pagination,
  ]
}
