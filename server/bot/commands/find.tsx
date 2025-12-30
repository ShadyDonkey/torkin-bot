import { ActionRow, Button, type CommandInteraction, Container, TextDisplay } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { type CommandConfig, CommandOption } from 'dressed'
import { useState } from 'react'
import { logger } from '@/server/bot/utilities/logger'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { search } from '@/server/lib/tmdb'
import type { TypeSelection } from '@/server/lib/tmdb/types'
import { unwrap } from '@/server/utilities'
import { ListingPage, Listings } from '../utilities/commands/listings'

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
    await interaction.reply(<ListingsWrapper searchType={searchType} queryString={query} />)
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

function ListingsWrapper({ searchType, queryString }: Readonly<{ searchType: TypeSelection; queryString: string }>) {
  const queryData = { queryKey: ['find', searchType, queryString], queryFn: () => search(searchType, queryString) }
  const query = useQuery(queryData)
  const [showList, setShowList] = useState(false)

  if (!query.data) {
    return (
      <>
        <Container>
          {query.isLoading && <FallbackListingPage queryString={queryString} />}
          {query.isError && 'There was an error searching!'}
        </Container>
        <ActionRow>
          <Button onClick={() => setShowList(true)} label="See All Results" disabled />
        </ActionRow>
      </>
    )
  }

  return showList ? (
    <Listings
      initialPage={1}
      queryData={queryData}
      listTitle={`${searchType === 'movie' ? 'Movie' : 'TV Show'} Results For \`${queryString}\``}
    />
  ) : (
    <Container>
      {query.data?.[0] ? (
        <ListingPage listing={query.data[0]} onBack={() => setShowList(true)} backText="See All Results" />
      ) : (
        "Couldn't find any results!"
      )}
    </Container>
  )
}

function FallbackListingPage({ queryString }: Readonly<{ queryString: string }>) {
  return (
    <>
      <TextDisplay>## Fetching results...</TextDisplay>
      Fetching results for `{queryString}`...
      <TextDisplay>Watch Now (US): ...</TextDisplay>
    </>
  )
}
