import { format, getUnixTime } from 'date-fns'
import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIContainerComponent,
  MessageFlags,
} from 'discord-api-types/v10'
import { h2, h3, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import {
  ActionRow,
  Button,
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
  Container,
  Section,
  Thumbnail,
} from 'dressed'
import { type CmdFindCacheEntry, keyv, keyvConfig } from '@/server/lib/keyv'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/shared/config'
import {
  getImageUrl,
  getMovieDetails,
  getMovieWatchProviders,
  getTvDetails,
  getTvWatchProviders,
  searchMovie,
  searchTv,
} from '@/shared/lib/tmdb'
import { unwrap } from '@/shared/utilities'

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
      keyvConfig.cmd.find.key(interaction.id),
      {
        searchType,
        query,
        userId: interaction.user.id,
      },
      keyvConfig.cmd.find.ttl,
    ),
  )

  if (cacheErr || !cached) {
    return interaction.editReply('')
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

  const [detailsErr, details] = await unwrap(getMovieDetails(first.id))

  if (detailsErr) {
    throw new Error('Failed to get movie details')
  }

  const requiredAttributes = ['title', 'overview']
  const missingAttributes: string[] = []

  for (const attribute of requiredAttributes) {
    if (!(attribute in details)) {
      missingAttributes.push(attribute)
    }
  }

  if (missingAttributes.length > 0) {
    throw new Error(`Missing required attributes: ${missingAttributes.join(', ')}`)
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
    const percentChange = ((details.revenue - details.budget) / details.budget) * 100
    const sign = percentChange >= 0 ? '+' : ''
    detailsList.push(
      `Budget: $${details.budget.toLocaleString()} / Revenue: $${details.revenue.toLocaleString()} (${sign}${percentChange.toFixed(1)}%)`,
    )
  }

  if (details.production_companies) {
    detailsList.push(`Production Companies: ${details.production_companies.map((pc) => pc.name).join(', ')}`)
  }

  if (detailsList.length > 0) {
    // body += `\n${bold('More Info')}\n${list(...detailsList)}\n`
    body += `${h3('More Info')}\n${detailsList.join('\n')}\n`
  }

  const [watchProvidersErr, watchProviders] = await unwrap(getMovieWatchProviders(first.id))

  if (watchProvidersErr) {
    throw new Error('Failed to get watch providers')
  }
  if (watchProviders?.results) {
    body += `\nWatch Now (US): ${watchProviders.results.US?.flatrate?.length && watchProviders.results.US.flatrate.length > 0 ? watchProviders.results.US?.flatrate?.map((p) => p.provider_name).join(', ') : 'Not Available'}`
  }

  const components = [
    Container(Section([body], Thumbnail(getImageUrl(first.poster_path ?? '')))),
    ActionRow(
      Button({
        custom_id: 'find-all-results',
        label: 'See All Results',
        style: 'Primary',
      }),
    ),
  ]

  return components
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
    throw new Error('This movie is for adults only')
  }

  const [detailsErr, details] = await unwrap(getTvDetails(first.id))

  if (detailsErr) {
    throw new Error('Failed to get TV details')
  }

  const requiredAttributes = ['name', 'overview', 'status']
  const missingAttributes: string[] = []

  for (const attribute of requiredAttributes) {
    if (!(attribute in details)) {
      missingAttributes.push(attribute)
    }
  }

  if (missingAttributes.length > 0) {
    throw new Error(`Missing required attributes: ${missingAttributes.join(', ')}`)
  }

  let body = ''

  if (details.first_air_date) {
    body += h2(`${details.name} (${format(new Date(details.first_air_date), 'yyyy')})\n`)
  } else {
    body += `${h2(details.name ?? '')}\n`
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

  if (details.number_of_seasons > 0) {
    const [watchProvidersErr, watchProviders] = await unwrap(getTvWatchProviders(first.id, 1))

    if (watchProvidersErr) {
      throw new Error('Failed to get watch providers')
    }

    if (watchProviders?.results) {
      body += `\nWatch Now (US): ${watchProviders.results.US?.flatrate?.length && watchProviders.results.US.flatrate.length > 0 ? watchProviders.results.US?.flatrate?.map((p) => p.provider_name).join(', ') : 'Not Available'}`
    }
  }

  const components = [
    Container(Section([body], Thumbnail(getImageUrl(first.poster_path ?? '')))),
    ActionRow(
      Button({
        custom_id: 'find-all-results',
        label: 'See All Results',
        style: 'Primary',
      }),
    ),
  ]

  return components
}
