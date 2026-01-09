import { type CommandInteraction, Container } from '@dressed/react'
import { h3, subtext } from 'discord-fmt'
import { type CommandAutocompleteInteraction, type CommandConfig, CommandOption } from 'dressed'
import { db } from '../../../lib/db'
import { getCountries, getLanguages, getTimezones } from '../../../lib/tmdb'
import { useUserPreferences } from '../../providers/user-preferences'
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
  // const userPreferences = useUserPreferences()

  if (!subcommand) {
    return await interaction.reply('Unknown subcommand')
  }

  if (subcommand.name === 'settings') {
    return await interaction.reply(<Container>fffff for (const element of object) {}</Container>, { ephemeral: true })
  }
}
