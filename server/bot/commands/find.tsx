import { Button, type CommandInteraction } from '@dressed/react'
import { type CommandConfig, CommandOption } from 'dressed'
import { ItemActions } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { buildSelectionDetails } from '@/server/bot/utilities/tmdb'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { search } from '@/server/lib/tmdb'
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
          required: true,
        }),
      ],
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  await interaction.deferReply()

  const subcommand = (interaction.getOption('movie') || interaction.getOption('tv'))?.subcommand()
  if (!subcommand) {
    return await interaction.editReply('Unknown subcommand')
  }

  const searchType = subcommand.name
  const query = subcommand.getOption('query', true).string()

  if (!query) {
    return await interaction.editReply('You must provide a title')
  }

  try {
    await interaction.editReply(await (searchType === 'movie' ? handleMovie : handleTv)(query))
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

async function handleMovie(query: string) {
  const [searchErr, results] = await unwrap(search('movie', query))
  if (searchErr) {
    throw new Error('Failed to search for movie')
  }

  if (!results?.results || results.results.length === 0) {
    return 'No results found'
  }

  const first = results.results.at(0)

  if (!first) {
    return 'No results found'
  }

  if (first.adult) {
    return 'This movie is for adults only'
  }

  return (
    <>
      {await buildSelectionDetails(first.id.toString(), 'movie')}
      <ItemActions id={first.id.toString()} type="movie">
        <Button custom_id="find-goto-1" label="See All Results" />
      </ItemActions>
    </>
  )
}

async function handleTv(query: string) {
  const [searchErr, results] = await unwrap(search('tv', query))

  if (searchErr) {
    return 'Failed to search for TV show'
  }

  const first = results?.results?.at(0)

  if (!first) {
    return 'No results found'
  }

  if (first.adult) {
    return 'This TV show is for adults only'
  }

  return (
    <>
      {await buildSelectionDetails(first.id.toString(), 'tv')}
      <ItemActions id={first.id.toString()} type="tv">
        <Button custom_id="find-goto-1" label="See All Results" />
      </ItemActions>
    </>
  )
}
