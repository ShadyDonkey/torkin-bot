import { ActionRow, Button, type CommandInteraction, Container, TextDisplay } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { type CommandConfig, CommandOption } from 'dressed'
import { useState } from 'react'
import ErrorPage from '@/server/bot/components/commands/error'
import { ListingPage, Listings } from '@/server/bot/components/commands/listings'
import { logger } from '@/server/bot/utilities/logger'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { search } from '@/server/lib/tmdb'
import type { TypeSelection } from '@/server/lib/tmdb/types'
import { unwrap } from '@/server/utilities'

export const config = {
  description: 'Find a show or movie by name',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
  options: [
    CommandOption({
      name: 'movie',
      description: 'Find a movie',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'query',
          description: 'The title of the movie',
          type: 'String',
          max_length: 100,
          required: true,
        }),
      ],
    }),
    CommandOption({
      name: 'tv',
      description: 'Find a TV show',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'query',
          description: 'The title of the TV show',
          type: 'String',
          max_length: 100,
          required: true,
        }),
      ],
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  const subcommand = (interaction.getOption('movie') || interaction.getOption('tv'))?.subcommand()
  if (!subcommand) {
    return await interaction.reply('Unknown subcommand')
  }

  const searchType = subcommand.name
  const query = subcommand.getOption('query', true).string()

  if (!query) {
    return await interaction.reply('You must provide a title')
  }

  try {
    await interaction.reply(
      <ListingsWrapper searchType={searchType} queryString={query} userId={interaction.user.id} />,
    )
  } catch (err) {
    logger.error(err)
    return await interaction.editReply('Something went wrong when finding that...')
  }

  const [cacheErr, cached] = await unwrap(
    keyv.set<CmdFindCacheEntry>(
      KEYV_CONFIG.cmd.find.key(interaction.id),
      { searchType, query, userId: interaction.user.id },
      KEYV_CONFIG.cmd.find.ttl,
    ),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
  }
}

function ListingsWrapper({
  searchType,
  queryString,
  userId,
}: Readonly<{ searchType: TypeSelection; queryString: string; userId: string }>) {
  const queryData = { queryKey: ['find', searchType, queryString], queryFn: () => search(searchType, queryString) }
  const query = useQuery(queryData)
  const [showList, setShowList] = useState(false)

  if (!query.data?.[0]) {
    return (
      <>
        {query.isLoading ? (
          <FallbackListingPage queryString={queryString} />
        ) : (
          <ErrorPage code={query.isError ? 500 : 404}>
            {query.isError ? 'There was an error searching!' : "Couldn't find any results!"}
          </ErrorPage>
        )}
      </>
    )
  }

  return showList ? (
    <Listings
      initialPage={1}
      queryData={queryData}
      listTitle={`${searchType === 'movie' ? 'Movie' : 'TV Show'} Results For \`${queryString}\``}
      userId={userId}
    />
  ) : (
    <ListingPage listing={query.data[0]} onBack={() => setShowList(true)} backText="See All Results" userId={userId} />
  )
}

function FallbackListingPage({ queryString }: Readonly<{ queryString: string }>) {
  return (
    <>
      <Container>
        <TextDisplay>## Fetching results...</TextDisplay>
        Fetching results for `{queryString}`...
        <TextDisplay>Watch Now (US): ...</TextDisplay>
      </Container>
      <ActionRow>
        <Button custom_id="fallback" label="See All Results" disabled />
      </ActionRow>
    </>
  )
}
