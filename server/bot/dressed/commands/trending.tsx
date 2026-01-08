import type { CommandInteraction } from '@dressed/react'
import { type CommandConfig, CommandOption } from 'dressed'
import { Listings } from '../../../bot/components/commands/listings'
import { botLogger } from '../../../bot/utilities/logger'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '../../../lib/keyv'
import { getTrending } from '../../../lib/tmdb'
import { unwrap } from '../../../utilities'
import { GENERIC_COMMAND_CONFIG } from '../../utilities'

function getPeriodChoices(description: string) {
  return [
    CommandOption({
      name: 'period',
      description,
      type: 'String',
      choices: [
        { name: 'Day', value: 'day' },
        { name: 'Week', value: 'week' },
      ],
    }),
  ]
}

export const config = {
  ...GENERIC_COMMAND_CONFIG,
  description: 'See trending movies and TV shows',
  options: [
    CommandOption({
      name: 'movie',
      description: 'See trending movies',
      type: 'Subcommand',
      options: getPeriodChoices('The time period to fetch trending movies for'),
    }),
    CommandOption({
      name: 'tv',
      description: 'See trending TV shows',
      type: 'Subcommand',
      options: getPeriodChoices('The time period to fetch trending TV shows for'),
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  const subcommand = (interaction.getOption('movie') || interaction.getOption('tv'))?.subcommand()

  if (!subcommand) {
    return await interaction.reply('Unknown subcommand')
  }

  const window = (subcommand?.getOption('period')?.string() || 'day') as 'day' | 'week'
  const type = subcommand?.name

  try {
    await interaction.reply(
      <Listings
        initialPage={1}
        queryData={{ queryKey: ['trending', type, window], queryFn: () => getTrending(type, window) }}
        listTitle={`Trending ${type === 'movie' ? 'Movie' : 'TV Show'}s ${window === 'day' ? 'Today' : 'This Week'}`}
      />,
    )
  } catch (err) {
    botLogger.error(err)
    return await interaction.editReply('Something went wrong when fetching trending content...')
  }

  const [cacheErr, cached] = await unwrap(
    keyv.set<CmdTrendingCacheEntry>(
      KEYV_CONFIG.cmd.trending.key(interaction.id),
      {
        timeWindow: window,
        type,
        userId: interaction.user.id,
      },
      KEYV_CONFIG.cmd.trending.ttl,
    ),
  )

  if (cacheErr || !cached) {
    botLogger.error({ cacheErr, cached })
  }
}
