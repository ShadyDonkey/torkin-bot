import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIContainerComponent,
  MessageFlags,
} from 'discord-api-types/v10'
import { type CommandConfig, type CommandInteraction, CommandOption } from 'dressed'
import { buildDetailsComponent } from '@/server/bot/utilities/tmdb'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { searchMovie, searchTv } from '@/server/lib/tmdb'
import { unwrap } from '@/server/utilities'

export const config: CommandConfig = {
  description: 'Find a show or movie by name',
  default_member_permissions: ['Administrator'],
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
}

export default async function (interaction: CommandInteraction) {
  console.log('Slash command interaction ID:', interaction.id)
  interaction.deferReply()
  const subcommand = interaction.getOption('movie')?.subcommand() || interaction.getOption('tv')?.subcommand()
  const query = subcommand?.getOption('query')?.string()
  let searchType: 'movie' | 'tv' | null = null
  let components = []

  if (!query) {
    return interaction.editReply('You must provide a title')
  }

  try {
    switch (subcommand?.name) {
      case 'movie': {
        searchType = 'movie'
        components = await handleMovie(query)
        break
      }
      case 'tv': {
        searchType = 'tv'
        components = await handleTv(query)
        break
      }
      default: {
        return interaction.editReply('Unknown subcommand')
      }
    }
  } catch (err) {
    console.error(err)
    return interaction.editReply('Something went wrong when finding that...')
  }

  const [cacheErr, cached] = await unwrap(
    keyv.set<CmdFindCacheEntry>(
      KEYV_CONFIG.cmd.find.key(interaction.id),
      {
        searchType,
        query,
        userId: interaction.user.id,
      },
      KEYV_CONFIG.cmd.find.ttl,
    ),
  )

  if (cacheErr || !cached) {
    console.error({ cacheErr, cached })
    return interaction.editReply('Could not cache search results, please try again later.')
  }

  return interaction.editReply({
    components,
    flags: MessageFlags.IsComponentsV2,
  })
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

  return buildDetailsComponent(first.id.toString(), 'movie')
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

  return buildDetailsComponent(first.id.toString(), 'tv')
}
