import type { CommandInteraction } from '@dressed/react'
import { type CommandConfig, CommandOption } from 'dressed'
import TrackingSettings from '../../components/commands/tracking/settings'
import { GENERIC_COMMAND_CONFIG } from '../../utilities'

export const config = {
  ...GENERIC_COMMAND_CONFIG,
  description: 'Item tracking',
  options: [
    CommandOption({
      type: 'Subcommand',
      name: 'settings',
      description: 'Manage your item tracking settings',
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  const subcommand = interaction.getOption('settings')?.subcommand()

  if (!subcommand) {
    return await interaction.reply('Unknown subcommand')
  }

  if (subcommand.name === 'settings') {
    return await interaction.reply(<TrackingSettings userId={interaction.user.id} />, { ephemeral: true })
  }
}
