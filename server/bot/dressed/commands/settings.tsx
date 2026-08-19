import { type CommandInteraction, Container } from '@dressed/react'
import { h3, subtext } from 'discord-fmt'
import { type CommandAutocompleteInteraction, type CommandConfig, CommandOption } from 'dressed'
import { db } from '../../../lib/db'
import { getCountries, getLanguages, getTimezones } from '../../../lib/tmdb'
import { GENERIC_COMMAND_CONFIG } from '../../utilities'

export const config = {
  ...GENERIC_COMMAND_CONFIG,
  description: 'Manage your settings for the bot',
  options: [
    CommandOption({ type: 'Subcommand', name: 'view', description: 'View your current settings' }),
    CommandOption({
      type: 'SubcommandGroup',
      name: 'set',
      description: 'Set your settings',
      options: (['country', 'language', 'timezone'] as const).map((name) =>
        CommandOption({
          type: 'Subcommand',
          name,
          description: `Set your ${name}`,
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
  const { view, set } = interaction.options

  if (view) {
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

  const setSubcommand = set?.subcommands.country || set?.subcommands.language || set?.subcommands.timezone

  if (setSubcommand) {
    const { value } = setSubcommand.options

    let valid = false
    switch (setSubcommand.name) {
      case 'country': {
        const countries = (await getCountries())
          .filter((e): e is { iso_3166_1: string; english_name: string } => Boolean(e.iso_3166_1 && e.english_name))
          .map((e) => ({ name: e.english_name, value: e.iso_3166_1 }))
        valid = countries.some((e) => e.value === value)
        break
      }
      case 'language': {
        const languages = (await getLanguages())
          .filter((e): e is { iso_639_1: string; english_name: string } => Boolean(e.iso_639_1 && e.english_name))
          .map((e) => ({ name: e.english_name, value: e.iso_639_1 }))
        valid = languages.some((e) => e.value === value)
        break
      }
      case 'timezone': {
        const timezones = (await getTimezones())
          .flatMap((country) => country.zones?.map((zone) => ({ name: zone, value: zone })) ?? [])
          .filter((tz): tz is { name: string; value: string } => Boolean(tz.name && tz.value))
        valid = timezones.some((e) => e.value === value)
        break
      }
    }

    if (!valid) {
      return await interaction.reply(`Invalid ${setSubcommand.name} value: \`${value}\``, { ephemeral: true })
    }

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

export async function autocomplete(interaction: CommandAutocompleteInteraction<typeof config>) {
  const { subcommands } = interaction.options.set ?? {}
  const { options: { value } = {} } = subcommands?.country ?? subcommands?.language ?? subcommands?.timezone ?? {}

  if (!value) {
    return
  }

  const searchInput = value?.toLowerCase().trim() ?? ''
  const limit = 25

  const limitedMatches = <T extends { name: string; value: string }>(items: T[], predicate: (item: T) => boolean) =>
    items.filter(predicate).slice(0, limit)

  const fetchData = async () => {
    switch (interaction.focused) {
      case 'set.country.value': {
        const countries = (await getCountries())
          .filter((e): e is { iso_3166_1: string; english_name: string } => Boolean(e.iso_3166_1 && e.english_name))
          .map((e) => ({ name: e.english_name, value: e.iso_3166_1 }))
        return limitedMatches(countries, (c) => c.name.toLowerCase().includes(searchInput))
      }
      case 'set.language.value': {
        const languages = (await getLanguages())
          .filter((e): e is { iso_639_1: string; english_name: string } => Boolean(e.iso_639_1 && e.english_name))
          .map((e) => ({ name: e.english_name, value: e.iso_639_1 }))
        return limitedMatches(languages, (l) => l.name.toLowerCase().includes(searchInput))
      }
      case 'set.timezone.value': {
        const timezones = (await getTimezones())
          .flatMap((country) => country.zones?.map((zone) => ({ name: zone, value: zone })) ?? [])
          .filter((tz): tz is { name: string; value: string } => Boolean(tz.name && tz.value))
        return limitedMatches(timezones, (tz) => tz.name.toLowerCase().includes(searchInput))
      }
    }
  }

  const choices = await fetchData()
  return await interaction.sendChoices(choices)
}
