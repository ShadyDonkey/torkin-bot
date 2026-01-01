import {
  Button,
  Container,
  Label,
  Section,
  SelectMenu,
  SelectMenuOption,
  Separator,
  TextDisplay,
  TextInput,
} from '@dressed/react'
import { bold, link, subtext } from 'discord-fmt'
import { Fragment } from 'react/jsx-runtime'
import { PaginationButtons } from '@/server/bot/components/builders'
import { logger } from '@/server/bot/utilities/logger'
import { watchlistIdToUrl } from '@/server/bot/utilities/website'
import { db } from '@/server/lib/db'
import { unwrap } from '@/server/utilities'
import { type Watchlist, WatchlistState } from '@/server/zenstack/models'

export function modalComponents() {
  return [
    <>
      <Label label="Name">
        <TextInput
          custom_id="name"
          placeholder="Enter watchlist name"
          value="My Watchlist"
          min_length={3}
          max_length={100}
          required
        />
      </Label>
      <Label label="Description">
        <TextInput
          custom_id="description"
          placeholder="Enter watchlist description"
          style="Paragraph"
          max_length={255}
        />
      </Label>
      <Label label="Privacy">
        <SelectMenu custom_id="privacy" type="String" required>
          <SelectMenuOption label="Public" value="public" default />
          {/* <SelectMenuOption label="Private" value="private" />
          <SelectMenuOption label="Unlisted" value="unlisted" /> */}
        </SelectMenu>
      </Label>
      <Label label="Make default watchlist?">
        <SelectMenu custom_id="default" type="String" required>
          <SelectMenuOption label="Yes" value="yes" />
          <SelectMenuOption label="No" value="no" default />
        </SelectMenu>
      </Label>
    </>,
    {
      title: 'Create Watchlist',
      custom_id: 'watchlist-create',
    },
  ] as const
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
    logger.error({ err })
    return 'Could not retrieve watchlists, please try again later.'
  }

  const count = await db.watchlist.count({ where: { discordUserId: userId } })
  const totalPages = Math.ceil(count / limit)

  return (
    <>
      <Container>
        {lists.map((list, index) => (
          <Fragment key={list.id}>
            <Section
              accessory={
                <Button custom_id={`watchlist-${list.id}-details-${page}`} label="Details" style="Secondary" />
              }
            >
              {bold(`${list.name ?? 'Unnamed Watchlist'} - ${convertStateToLabel(list.state)}`)}
              {list.description && <TextDisplay>{list.description}</TextDisplay>}
              <TextDisplay>{subtext(link('View on Torkin ↗', watchlistIdToUrl(list.id)))}</TextDisplay>
            </Section>
            {index < lists.length - 1 && <Separator />}
          </Fragment>
        ))}
      </Container>
      <PaginationButtons currentPage={page} totalPages={totalPages} />
    </>
  )
}
