import type { CommandInteraction } from '@dressed/react'
import { type CommandConfig, CommandOption } from 'dressed'
import { handleMovie, handleTv } from '@/server/bot/utilities/commands/trending'
import { logger } from '@/server/bot/utilities/logger'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { type CmdTrendingCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { unwrap } from '@/server/utilities'

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
  description: 'See trending movies and TV shows',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
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
  await interaction.deferReply()
  const subcommand = (interaction.getOption('movie') || interaction.getOption('tv'))?.subcommand()

  if (!subcommand) {
    return await interaction.editReply('Unknown subcommand')
  }

  const period = (subcommand?.getOption('period')?.string() || 'day') as 'day' | 'week'
  const type = subcommand?.name

  try {
    await interaction.editReply(await (type === 'movie' ? handleMovie : handleTv)(period, 1))
  } catch (err) {
    logger.error(err)
    return await interaction.editReply('Something went wrong when fetching trending content...')
  }

  const [cacheErr, cached] = await unwrap(
    keyv.set<CmdTrendingCacheEntry>(
      KEYV_CONFIG.cmd.trending.key(interaction.id),
      {
        timeWindow: period,
        type,
        userId: interaction.user.id,
      },
      KEYV_CONFIG.cmd.trending.ttl,
    ),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
  }
}
