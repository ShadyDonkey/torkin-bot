import { inspect } from 'node:util'
import { ActionRow, Button, type CommandInteraction, Container, Section } from '@dressed/react'
import { subtext } from 'discord-fmt'
import type { CommandConfig } from 'dressed'
import { useState } from 'react'
import { useUserPreferences } from '@/server/bot/providers/user-preferences'
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
  const preferences = useUserPreferences()

  const savePreferences = () => {
    console.log(inspect(preferences))
    console.log('Saving preferences')

    console.log('new preferences', inspect(preferences))

    // db.userPreference
    //   .update({
    //     where: {
    //       discordUserId: preferences.userId,
    //     },
    //     data: {
    //       country: preferences.country,
    //       language: preferences.language,
    //       timezone: preferences.timezone,
    //     },
    //   })
    //   .then((r) => {
    //     console.log('Preferences saved')
    //     preferences.country = r.country
    //     preferences.language = r.language
    //     preferences.timezone = r.timezone
    //     setSaving(false)
    //   })
    //   .catch((error) => {
    //     console.error('Error saving preferences', inspect(error))
    //     setSaving(false)
    //   })

    // setSaving(false)
    // preferences
    //   .save()
    //   .then(() => {
    //     console.log('Preferences saved')
    //   })
    //   .catch((error) => {
    //     console.error('Error saving preferences', inspect(error))
    //   })
    //   .finally(() => {
    //     setSaving(false)
    //   })
  }

  return (
    <>
      <Container>
        <Section
          accessory={
            <Button
              onClick={() => {
                preferences.country = preferences.country === 'US' ? 'CA' : 'US'
                console.log(inspect(preferences))
              }}
              label={preferences.country}
            />
          }
        >
          Country
          {'\n'}
          {subtext('Select your country')}
        </Section>
      </Container>
      <ActionRow>
        <Button onClick={savePreferences} label="Save" />
      </ActionRow>
    </>
  )
}
