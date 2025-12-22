import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIContainerComponent,
  MessageFlags,
} from 'discord-api-types/v10'
import { ActionRow, Button, type CommandConfig, type CommandInteraction, CommandOption } from 'dressed'
import { buildItemActions } from '@/server/bot/utilities/builders'
import { buildDetailsComponent } from '@/server/bot/utilities/tmdb'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { searchMovie, searchTv } from '@/server/lib/tmdb'
import { unwrap } from '@/server/utilities'
import { WatchlistItemType } from '@/server/zenstack/models'

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
  console.log('Slash command interaction ID:', interaction.id)
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
    await interaction.editReply({
      components: await (searchType === 'movie' ? handleMovie : handleTv)(query),
      flags: MessageFlags.IsComponentsV2,
    })
  } catch (err) {
    console.error(err)
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
    console.error({ cacheErr, cached })
  }
}

async function handleMovie(
  query: string,
): Promise<(APIContainerComponent | APIActionRowComponent<APIButtonComponent>)[]> {
  const [searchErr, results] = await unwrap(searchMovie(query))
  if (searchErr) {
    throw new Error('Failed to search for movie')
  }

  if (!results?.results || results.results.length === 0) {
    throw new Error('No results found')
  }

  const first = results.results.at(0)

  if (!first) {
    throw new Error('No results found')
  }

  if (first.adult) {
    throw new Error('This movie is for adults only')
  }

  return [
    ...(await buildDetailsComponent(first.id.toString(), 'movie')),
    ...buildItemActions(first.id.toString(), WatchlistItemType.MOVIE),
    ActionRow(
      Button({
        custom_id: 'find-all-results',
        label: 'See All Results',
        style: 'Primary',
      }),
    ),
  ]
}

async function handleTv(query: string) {
  const [searchErr, results] = await unwrap(searchTv(query))

  if (searchErr) {
    throw new Error('Failed to search for TV show')
  }

  if (!results?.results || results.results.length === 0) {
    throw new Error('No results found')
  }

  const first = results.results.at(0)

  if (!first) {
    throw new Error('No results found')
  }

  if (first.adult) {
    throw new Error('This TV show is for adults only')
  }

  return [
    ...(await buildDetailsComponent(first.id.toString(), 'tv')),
    ...buildItemActions(first.id.toString(), WatchlistItemType.TV),
    ActionRow(
      Button({
        custom_id: 'find-all-results',
        label: 'See All Results',
        style: 'Primary',
      }),
    ),
  ]
}
