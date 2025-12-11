/** biome-ignore-all lint/style/noNonNullAssertion: Prototype */
import slugify from '@sindresorhus/slugify'
import { format, getUnixTime } from 'date-fns'
import { MessageFlags } from 'discord-api-types/v10'
import { bold, h2, h3, list, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import {
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
  Container,
  Section,
  TextDisplay,
  Thumbnail,
} from 'dressed'
import { keyv } from '@/server/lib/keyv'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/shared/config'
import { getImageUrl, getMovieDetails, getTvDetails, searchMovie, searchTv } from '@/shared/lib/tmdb'
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
  interaction.deferReply()
  const subcommand = interaction.getOption('movie')?.subcommand() || interaction.getOption('tv')?.subcommand()
  const query = subcommand?.getOption('query')?.string()
  let searchType: 'movie' | 'tv' | null = null

  if (!query) {
    return interaction.editReply('You must provide a title')
  }

  switch (subcommand?.name) {
    case 'movie': {
      searchType = 'movie'
      return await handleMovie(query, interaction)
    }
    case 'tv': {
      searchType = 'tv'
      return await handleTv(query, interaction)
    }
    default: {
      return interaction.editReply('Unknown subcommand')
    }
  }
}

async function handleMovie(query: string, interaction: CommandInteraction) {
  const [searchErr, results] = await unwrap(searchMovie(query))
  if (searchErr) {
    return interaction.editReply('Failed to search for movie')
  }

  if (!results?.results || results.results.length === 0) {
    return interaction.editReply('No results found')
  }

  const first = results.results.at(0)

  if (!first) {
    return interaction.editReply('No results found')
  }

  if (first.adult) {
    return interaction.editReply('This movie is for adults only')
  }

  const [detailsErr, details] = await unwrap(getMovieDetails(first.id))

  if (detailsErr) {
    return interaction.editReply('Failed to get movie details')
  }

  const requiredAttributes = ['title', 'overview']
  const missingAttributes: string[] = []

  for (const attribute of requiredAttributes) {
    if (!(attribute in details)) {
      missingAttributes.push(attribute)
    }
  }

  if (missingAttributes.length > 0) {
    return interaction.editReply(`Missing required attributes: ${missingAttributes.join(', ')}`)
  }

  let body = ''

  if (details.release_date) {
    body += h2(`${details.title} (${format(new Date(details.release_date), 'yyyy')})\n`)
  } else {
    body += h2(`${details.title}\n`)
  }

  if (details.vote_average) {
    const rating = Math.max(Math.round(details.vote_average / 2), 0)
    body += subtext(`${'⭐'.repeat(rating)}\n`)
  }

  // TODO add genres, will need to cache and parse here.

  body += `\n${details.overview}\n`

  const detailsList = []

  if (details.status) {
    detailsList.push(`Status: ${details.status}`)
  }

  if (details.runtime) {
    detailsList.push(`Runtime: ${details.runtime} minutes`)
  }

  if (details.budget && details.revenue) {
    detailsList.push(`Budget: ${details.budget.toLocaleString()} / Revenue: ${details.revenue.toLocaleString()}`)
  }

  if (details.production_companies) {
    detailsList.push(`Production Companies: ${details.production_companies.map((pc) => pc.name).join(', ')}`)
  }

  if (detailsList.length > 0) {
    // body += `\n${bold('More Info')}\n${list(...detailsList)}\n`
    body += `${h3('More Info')}\n${detailsList.join('\n')}\n`
  }

  const components = [Container(Section([body], Thumbnail(getImageUrl(first.poster_path ?? ''))))]

  return interaction.editReply({
    components,
    flags: MessageFlags.IsComponentsV2,
  })
}

async function handleTv(query: string, interaction: CommandInteraction) {
  const [searchErr, results] = await unwrap(searchTv(query))

  if (searchErr) {
    return interaction.editReply('Failed to search for TV show')
  }

  if (!results?.results || results.results.length === 0) {
    return interaction.editReply('No results found')
  }

  const first = results.results.at(0)

  if (!first) {
    return interaction.editReply('No results found')
  }

  if (first.adult) {
    return interaction.editReply('This movie is for adults only')
  }

  const [detailsErr, details] = await unwrap(getTvDetails(first.id))

  if (detailsErr) {
    return interaction.editReply('Failed to get TV details')
  }

  const requiredAttributes = ['name', 'overview', 'status']
  const missingAttributes: string[] = []

  for (const attribute of requiredAttributes) {
    if (!(attribute in details)) {
      missingAttributes.push(attribute)
    }
  }

  if (missingAttributes.length > 0) {
    return interaction.editReply(`Missing required attributes: ${missingAttributes.join(', ')}`)
  }

  let body = ''

  if (details.first_air_date) {
    body += h2(`${details.name} (${format(new Date(details.first_air_date), 'yyyy')})\n`)
  } else {
    body += `${h2(details.name!)}\n`
  }

  if (details.vote_average) {
    const rating = Math.max(Math.round(details.vote_average / 2), 0)
    body += subtext(`${'⭐'.repeat(rating)}\n`)
  }

  // TODO add genres, will need to cache and parse here.

  body += `\n${details.overview}\n`

  const detailsList = []

  if (details.status) {
    detailsList.push(`Status: ${details.status}`)
  }

  if (details.last_air_date) {
    const epoch = getUnixTime(new Date(details.last_air_date)).toString()
    detailsList.push(
      `Last Air Date: ${timestamp(epoch, TimestampStyle.ShortDate)} (${timestamp(epoch, TimestampStyle.RelativeTime)})`,
    )
  }

  // TODO: This
  // if (details.next_episode_to_air) {
  //   detailsList.push(`Next Episode: ${details.next_episode_to_air}`)
  // }

  if (details.number_of_seasons) {
    detailsList.push(
      `Seasons: ${details.number_of_seasons}${details.number_of_episodes ? ` (${details.number_of_episodes} Episodes)` : ''}`,
    )
  }

  if (details.networks) {
    detailsList.push(`Networks: ${details.networks.map((network) => network.name).join(', ')}`)
  }

  if (detailsList.length > 0) {
    // body += `\n${bold('More Info')}\n${list(...detailsList)}\n`
    body += `${h3('More Info')}\n${detailsList.join('\n')}\n`
  }

  body += `\n${bold('Available On')}\n${list(...['Mock Service 1', 'Mock Service 2'])}\n`

  const components = [Container(Section([body], Thumbnail(getImageUrl(first.poster_path ?? ''))))]

  return interaction.editReply({
    components,
    flags: MessageFlags.IsComponentsV2,
  })
}
