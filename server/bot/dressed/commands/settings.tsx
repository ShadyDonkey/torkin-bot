import { type CommandInteraction, Container } from '@dressed/react'
import { h3, subtext } from 'discord-fmt'
import { type CommandAutocompleteInteraction, type CommandConfig, CommandOption } from 'dressed'
import { db } from '../../../lib/db'
import { getCountries, getLanguages, getTimezones } from '../../../lib/tmdb'
import { GENERIC_COMMAND_CONFIG } from '../../utilities'

type MappedOption<N extends string> = ReturnType<
  typeof CommandOption<'Subcommand', N, false, [ReturnType<typeof CommandOption<'String', 'value', true, never>>]>
>

export const config = {
  ...GENERIC_COMMAND_CONFIG,
  description: 'Manage your settings for the bot',
  options: [
    CommandOption({ type: 'Subcommand', name: 'view', description: 'View your current settings' }),
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
      ) as [MappedOption<'country'>, MappedOption<'language'>, MappedOption<'timezone'>],
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

  if (!type || !input) {
    return
  }

  const searchInput = input.toLowerCase()
  const limit = 25

  const limitedMatches = <T extends { name: string; value: string }>(items: T[], predicate: (item: T) => boolean) =>
    items.filter(predicate).slice(0, limit)

  const fetchData = async () => {
    switch (type.name) {
      case 'country': {
        const countries = (await getCountries())
          .filter((e): e is { iso_3166_1: string; english_name: string } => Boolean(e.iso_3166_1 && e.english_name))
          .map((e) => ({ name: e.english_name, value: e.iso_3166_1 }))
        return limitedMatches(countries, (c) => c.name.toLowerCase().includes(searchInput))
      }
      case 'language': {
        const languages = (await getLanguages())
          .filter((e): e is { iso_639_1: string; english_name: string } => Boolean(e.iso_639_1 && e.english_name))
          .map((e) => ({ name: e.english_name, value: e.iso_639_1 }))
        return limitedMatches(languages, (l) => l.name.toLowerCase().includes(searchInput))
      }
      case 'timezone': {
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
