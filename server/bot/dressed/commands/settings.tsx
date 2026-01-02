import { inspect } from 'node:util'
import {
  ActionRow,
  Button,
  type CommandInteraction,
  Container,
  Section,
  SelectMenu,
  SelectMenuOption,
} from '@dressed/react'
import type { APIUser } from 'discord-api-types/v10'
import { h1, h3 } from 'discord-fmt'
import { type CommandAutocompleteInteraction, type CommandConfig, CommandOption } from 'dressed'
import { useEffect, useState } from 'react'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { db } from '@/server/lib/db'
import type { UserPreference } from '@/server/zenstack/models'

export const config = {
  description: 'Manage your settings for the bot',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
  options: [
    CommandOption({
      type: 'Subcommand',
      name: 'view',
      description: 'View your current settings',
    }),
    CommandOption({
      type: 'SubcommandGroup',
      name: 'set',
      description: 'Set your settings',
      options: Object.entries({
        country: 'Set your country',
        language: 'Set your language',
        timezone: 'Set your timezone',
      }).map(([name, description]) =>
        CommandOption({
          type: 'Subcommand',
          name,
          description,
          options: [
            CommandOption({
              type: 'String',
              name: 'value',
              description: 'Value of the setting',
              required: true,
              autocomplete: true,
            }),
          ],
        }),
      ),
    }),
  ],
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply('settings', { ephemeral: true })
}

export function autocomplete(interaction: CommandAutocompleteInteraction) {
  const group = interaction.getOption('set')?.subcommandGroup()
  const type = group?.getSubcommand('country') || group?.getSubcommand('language') || group?.getSubcommand('timezone')
  const input = type?.getOption('value')?.string()
}
