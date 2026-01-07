import { ActionRow, Button, type CommandInteraction, Container, TextDisplay } from '@dressed/react'
import { link, list } from 'discord-fmt'
import type { CommandConfig } from 'dressed'
import { DEV_GUILD_ID, IS_IN_DEV } from '../../../lib/config'

export const config = {
  description: 'A generic help command',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply(
    <>
      <TextDisplay>
        If you're in need of help, want to report a bug, or have a suggestion, please reach out to us on our support
        server.
      </TextDisplay>
      <ActionRow>
        <Button label="Support Server" url="https://discord.gg/RP36fV6MNe" />
        <Button label="Website" url="https://torkin.xyz" />
      </ActionRow>
    </>,
    { ephemeral: true },
  )
}
