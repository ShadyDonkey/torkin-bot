import { type CommandInteraction, Container } from '@dressed/react'
import type { CommandConfig } from 'dressed'

import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'

export const config = {
  description: 'Manage your settings for the bot',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply(<Container>Settings</Container>, { ephemeral: true })
}
