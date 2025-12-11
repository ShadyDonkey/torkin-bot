import { type CommandConfig, type CommandInteraction, CommandOption } from 'dressed'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/shared/config'
import { search } from '@/shared/lib/tvdb'

export const config: CommandConfig = {
  description: 'Find a show or movie by name',
  default_member_permissions: ['Administrator'],
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
  options: [
    CommandOption({
      name: 'movie',
      description: 'Find a movie',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'title',
          description: 'The title of the movie',
          type: 'String',
        }),
      ],
    }),
    CommandOption({
      name: 'show',
      description: 'Find a show',
      type: 'Subcommand',
      options: [
        CommandOption({
          name: 'title',
          description: 'The title of the show',
          type: 'String',
        }),
      ],
    }),
  ],
}

export default async function (interaction: CommandInteraction) {
  const subcommand = interaction.getOption('movie')?.subcommand() || interaction.getOption('show')?.subcommand()

  // switch (subcommand?.name) {
  //   case 'movie': {
  //     const movieTitle = subcommand?.getOption('title')?.string()
  //     break
  //   }
  //   case 'show': {
  //     const showTitle = subcommand?.getOption('title')?.string()
  //     break
  //   }
  // }

  const title = subcommand?.getOption('title')?.string()

  if (!title) {
    return interaction.reply('You must provide a title')
  }

  const res = await search(title, 'series')

  console.log(res.data?.[0])

  return interaction.reply(
    `You searched for ${subcommand?.name} with title ${subcommand?.getOption('title')?.string()}`,
  )
}
