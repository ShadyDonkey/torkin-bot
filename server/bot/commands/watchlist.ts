import type { CommandInteraction } from '@dressed/react'
import { type CommandConfig, CommandOption } from 'dressed'
import { buildListComponents, modalComponents } from '@/server/bot/utilities/commands/watchlist'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'

export const config = {
  description: 'Watchlist commands',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
  options: [
    CommandOption({
      name: 'create',
      description: 'Create a new watchlist',
      type: 'Subcommand',
    }),
    CommandOption({
      name: 'list',
      description: 'List all watchlists',
      type: 'Subcommand',
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  const subcommand = (interaction.getOption('create') || interaction.getOption('list'))?.subcommand()

  if (!subcommand) {
    return await interaction.reply('Unknown subcommand')
  }

  if (subcommand.name === 'create') {
    return await interaction.showModal(...modalComponents())
  }

  await interaction.deferReply()

  if (subcommand.name === 'list') {
    return await interaction.editReply(await buildListComponents(interaction.user.id, 1))
  }
}
