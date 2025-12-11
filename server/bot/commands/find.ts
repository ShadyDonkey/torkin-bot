import slugify from '@sindresorhus/slugify'
import { MessageFlags } from 'discord-api-types/v10'
import { type CommandConfig, type CommandInteraction, CommandOption, Container, TextDisplay } from 'dressed'
import { keyv } from '@/server/lib/keyv'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/shared/config'
import { search } from '@/shared/lib/tvdb'
import { toMs, unwrap } from '@/shared/utilities'

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
      name: 'show',
      description: 'Find a show',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'query',
          description: 'The title of the show',
          type: 'String',
          required: true,
        }),
      ],
    }),
  ],
}

export default async function (interaction: CommandInteraction) {
  const subcommand = interaction.getOption('movie')?.subcommand() || interaction.getOption('show')?.subcommand()
  const query = subcommand?.getOption('query')?.string()
  let searchType: 'movie' | 'series' | null = null

  switch (subcommand?.name) {
    case 'movie': {
      searchType = 'movie'
      break
    }
    case 'show': {
      searchType = 'series'
      break
    }
    default: {
      return interaction.reply('Unknown subcommand')
    }
  }

  if (!query) {
    return interaction.reply('You must provide a title')
  }

  if (!searchType) {
    return interaction.reply('Unknown search type')
  }

  // This may not work because each button click may be a new interaction ID
  const cacheKey = `cmd:find-${searchType}:${slugify(interaction.id)}-${slugify(query)}`
  const cacheBody = {
    query,
    searchType,
  }

  const [cacheErr, cached] = await unwrap(keyv.set(cacheKey, cacheBody, toMs('1h')))

  if (cacheErr) {
    console.error('Failed to cache search results', cacheErr)
    return interaction.reply('Failed to cache search results')
  }

  console.log(cached)

  if (!cached) {
    return interaction.reply('Did not successfully cache search results')
  }

  const [searchErr, results] = await unwrap(search(query, searchType))

  return interaction.reply({
    components: [
      Container(TextDisplay("They said I couldn't become famous, so I went to a haunted IKEA and became a cat.")),
    ],
    flags: MessageFlags.IsComponentsV2,
  })
}
