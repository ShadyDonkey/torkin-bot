import { type CommandInteraction, Container } from '@dressed/react'
import { h3, subtext } from 'discord-fmt'
import { type CommandAutocompleteInteraction, type CommandConfig, CommandOption } from 'dressed'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'
import { db } from '@/server/lib/db'
import { getCountries, getLanguages, getTimezones } from '@/server/lib/tmdb'

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
  const viewSubcommand = interaction.getOption('view')?.subcommand()

  if (viewSubcommand) {
    const preferences = await db.userPreference.findUnique({
      where: { discordUserId: interaction.user.id },
    })

    const availableCountries = await getCountries()
    const availableLanguages = await getLanguages()

    const country = availableCountries.find((e) => e.iso_3166_1 === preferences?.country)
    const language = availableLanguages.find((e) => e.iso_639_1 === preferences?.language)

    return await interaction.reply(
      <Container>
        {h3('Settings')}
        {'\n'}
        **Country:** {country?.english_name ? `${country.english_name} (${country.iso_3166_1})` : 'Not set'}
        {'\n'}
        **Language:** {language?.english_name ? `${language.english_name} (${language.iso_639_1})` : 'Not set'}
        {'\n'}
        **Timezone:** {preferences?.timezone ?? 'Not set'}
        {'\n\n'}
        {subtext('To change your settings, use the `/settings set` command')}
      </Container>,
      { ephemeral: true },
    )
  }

  const setGroup = interaction.getOption('set')?.subcommandGroup()
  const setSubcommand =
    setGroup?.getSubcommand('country') || setGroup?.getSubcommand('language') || setGroup?.getSubcommand('timezone')

  if (setSubcommand) {
    const value = setSubcommand.getOption('value', true)?.string()

    await db.userPreference.upsert({
      where: { discordUserId: interaction.user.id },
      update: { [setSubcommand.name]: value, updatedBy: interaction.user.id },
      create: {
        discordUserId: interaction.user.id,
        createdBy: interaction.user.id,
        [setSubcommand.name]: value,
      },
    })

    return await interaction.reply(`Your ${setSubcommand.name} has been set to \`${value}\``, { ephemeral: true })
  }

  return await interaction.reply('Unknown subcommand', { ephemeral: true })
}

export async function autocomplete(interaction: CommandAutocompleteInteraction) {
  const group = interaction.getOption('set')?.subcommandGroup()
  const type = group?.getSubcommand('country') || group?.getSubcommand('language') || group?.getSubcommand('timezone')
  const input = type?.getOption('value')?.string()

  switch (type?.name) {
    case 'country': {
      const countries = (await getCountries())
        .filter((e) => e.iso_3166_1 && (e.english_name || e.native_name))
        .flatMap(
          (e) =>
            ({
              name: e.english_name,
              value: e.iso_3166_1,
            }) as { name: string; value: string },
        )

      const matches = countries.filter((country) => country.name.toLowerCase().includes(input?.toLowerCase() || ''))
      const limitedMatches = matches.slice(0, 25)

      return await interaction.sendChoices(
        limitedMatches.map((country) => ({ name: country.name, value: country.value })),
      )
    }
    case 'language': {
      const languages = (await getLanguages())
        .filter((e: { iso_639_1?: string; english_name?: string }) => e.iso_639_1 && e.english_name)
        .flatMap(
          (e: { iso_639_1?: string; english_name?: string }) =>
            ({
              name: e.english_name,
              value: e.iso_639_1,
            }) as { name: string; value: string },
        )

      const matches = languages.filter((lang: { name: string; value: string }) =>
        lang.name.toLowerCase().includes(input?.toLowerCase() || ''),
      )
      const limitedMatches = matches.slice(0, 25)

      return await interaction.sendChoices(
        limitedMatches.map((lang: { name: string; value: string }) => ({ name: lang.name, value: lang.value })),
      )
    }
    case 'timezone': {
      const timezones = (await getTimezones())
        .flatMap(
          (country: { zones?: string[] }) =>
            country.zones?.map((zone: string) => ({
              name: zone,
              value: zone,
            })) || [],
        )
        .filter((tz): tz is { name: string; value: string } => Boolean(tz.name && tz.value))

      const matches = timezones.filter((tz: { name: string; value: string }) =>
        tz.name.toLowerCase().includes(input?.toLowerCase() || ''),
      )
      const limitedMatches = matches.slice(0, 25)

      return await interaction.sendChoices(
        limitedMatches.map((tz: { name: string; value: string }) => ({ name: tz.name, value: tz.value })),
      )
    }
  }
}
