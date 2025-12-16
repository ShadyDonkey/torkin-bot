import { codeBlock } from 'discord-fmt'
import { Label, SelectMenu, TextDisplay, TextInput } from 'dressed'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import { WatchlistState } from '@/server/zenstack/models'

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
          max_length: 500,
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
            },
            {
              label: 'Private',
              value: 'private',
              default: true,
            },
            {
              label: 'Unlisted',
              value: 'unlisted',
            },
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
    private: WatchlistState.PRIVATE,
    unlisted: WatchlistState.UNLISTED,
  }

  return stateMap[str.toLowerCase().trim()] ?? WatchlistState.PRIVATE
}

export async function buildListComponents(userId: string, page: number, limit: number = 5) {
  const skip = (page - 1) * limit

  const [err, lists] = await unwrap(
    db.watchlist.findMany({
      where: {
        discordUserId: userId,
      },
      skip,
      take: limit,
    }),
  )

  if (err) {
    console.error({ err })
    return [TextDisplay('Could not retrieve watchlists, please try again later.')]
  }

  return [TextDisplay(codeBlock(JSON.stringify(lists, null, 2)))]
}
