import { ActionRow, Button, type CommandInteraction, TextDisplay } from '@dressed/react'
import { link } from 'discord-fmt'
import type { CommandConfig } from 'dressed'
import { GENERIC_COMMAND_CONFIG } from '../../utilities'

export const config = {
  ...GENERIC_COMMAND_CONFIG,
  description: 'A generic help command',
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply(
    <>
      <TextDisplay>
        If you're in need of help, want to report a bug, or have a suggestion, please reach out to us on our support
        server.
        {'\n\n'}
        Enjoying Torkin? Consider ${link('donating on Ko-Fi', '<https://ko-fi.com/matthatcher>')} to keep the project
        alive and remain free.
      </TextDisplay>
      <ActionRow>
        <Button label="Support Server" url="https://discord.gg/RP36fV6MNe" />
        <Button label="Website" url="https://torkin.xyz" />
      </ActionRow>
    </>,
    { ephemeral: true },
  )
}
