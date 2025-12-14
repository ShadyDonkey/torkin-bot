import { format } from 'date-fns'
import { MessageFlags } from 'discord-api-types/v10'
import { h3 } from 'discord-fmt'
import {
  Button,
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
  Container,
  Section,
  Separator,
} from 'dressed'
import { buildPaginationButtons } from '@/server/bot/utilities/pagination'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { getTrendingMovies, getTrendingTv } from '@/server/lib/tmdb/helpers'
import { paginateArray, unwrap } from '@/server/utilities'

const ITEMS_PER_PAGE = 5

export const config = {
  description: 'See trending movies and TV shows',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
  options: [
    CommandOption({
      name: 'movie',
      description: 'See trending movies',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'period',
          description: 'The time period to fetch trending movies for',
          type: 'String',
          choices: [
            { name: 'Day', value: 'day' },
            { name: 'Week', value: 'week' },
          ],
        }),
      ],
    }),
    CommandOption({
      name: 'tv',
      description: 'See trending TV shows',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'period',
          description: 'The time period to fetch trending TV shows for',
          type: 'String',
          choices: [
            { name: 'Day', value: 'day' },
            { name: 'Week', value: 'week' },
          ],
        }),
      ],
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  await interaction.deferReply()
  const subcommand = (interaction.getOption('movie') || interaction.getOption('tv'))?.subcommand()

  if (!subcommand) {
    return interaction.editReply('Unknown subcommand')
  }

  const period = (subcommand?.getOption('period')?.string() || 'day') as 'day' | 'week'
  const type = subcommand?.name

  try {
    await interaction.editReply({
      components: await (type === 'movie' ? handleMovie : handleTv)(period),
      flags: MessageFlags.IsComponentsV2,
    })
  } catch (err) {
    console.error(err)
    return interaction.editReply('Something went wrong when fetching trending content...')
  }
}

async function handleMovie(timeWindow: 'day' | 'week', page: number = 1) {
  const [trendingErr, trending] = await unwrap(getTrendingMovies(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending movies found')
  }

  const paginatedItems = await paginateArray(trending, page, ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(paginatedItems.page, paginatedItems.totalPages, 'trending')

  const entries = paginatedItems.results
    .map((movie, index) => {
      if ((!movie.title && !movie.original_title) || !movie.overview || movie.adult) {
        return null
      }

      let body = ''

      body += `${h3(movie.title ?? movie.original_title ?? 'Unknown')}`

      if (movie.release_date) {
        body += ` (${format(new Date(movie.release_date), 'yyyy')})\n`
      } else {
        body += ` (Not Released)\n`
      }

      if (movie.overview) {
        body += `\n${movie.overview.substring(0, 255)}...\n`
      }

      const components: any[] = [
        Section(
          [body],
          Button({
            custom_id: `trending-view-details-${movie.id}`,
            label: `‹ View Details`,
            style: 'Secondary',
            disabled: !movie.id,
          }),
        ),
      ]

      if (index < paginatedItems.results.length - 1) {
        components.push(Separator())
      }

      return components
    })
    .filter((entry) => entry !== null)
    .flat()

  return [Container(...entries), paginationComponents]
}

async function handleTv(timeWindow: 'day' | 'week', page: number = 1) {
  const [trendingErr, trending] = await unwrap(getTrendingTv(timeWindow))

  if (trendingErr) {
    throw trendingErr
  }

  if (!trending || trending.length === 0) {
    throw new Error('No trending TV shows found')
  }

  const paginatedItems = await paginateArray(trending, page, ITEMS_PER_PAGE)
  const paginationComponents = buildPaginationButtons(paginatedItems.page, paginatedItems.totalPages, 'trending')

  const entries = paginatedItems.results
    .map((tv, index) => {
      if ((!tv.name && !tv.original_name) || !tv.overview || tv.adult) {
        return null
      }

      let body = ''

      body += `${h3(tv.name ?? tv.original_name ?? 'Unknown')}`

      if (tv.first_air_date) {
        body += ` (${format(new Date(tv.first_air_date), 'yyyy')})\n`
      } else {
        body += ` (Not Released)\n`
      }

      if (tv.overview) {
        body += `\n${tv.overview.substring(0, 255)}...\n`
      }

      const components: any[] = [
        Section(
          [body],
          Button({
            custom_id: `trending-view-details-${tv.id}`,
            label: `‹ View Details`,
            style: 'Secondary',
            disabled: !tv.id,
          }),
        ),
      ]

      if (index < paginatedItems.results.length - 1) {
        components.push(Separator())
      }

      return components
    })
    .filter((entry) => entry !== null)
    .flat()

  return [Container(...entries), paginationComponents]
}
