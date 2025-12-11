import type { CommandConfig, CommandInteraction } from 'dressed'
import { DEV_GUILD_ID } from '@/shared/config'

export const config: CommandConfig = {
  description: 'Test command',
  default_member_permissions: ['Administrator'],
  guilds: [DEV_GUILD_ID],
}

export default async function (interaction: CommandInteraction) {
  return interaction.reply('Test command')
}
