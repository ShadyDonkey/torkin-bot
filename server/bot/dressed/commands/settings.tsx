import { inspect } from 'node:util'
import { ActionRow, Button, type CommandInteraction, Container, Section } from '@dressed/react'
import { subtext } from 'discord-fmt'
import type { CommandConfig } from 'dressed'
import { useState } from 'react'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { db } from '@/server/lib/db'

export const config = {
  description: 'Manage your settings for the bot',
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply(<Settings />, { ephemeral: true })
}

function Settings() {
  return (
    <>
      settings
      {/* <Container>
        <Section accessory={<Button />}>
          Country
          {'\n'}
          {subtext('Select your country')}
        </Section>
      </Container>
      <ActionRow>
        <Button onClick={savePreferences} label="Save" />
      </ActionRow> */}
    </>
  )
}
