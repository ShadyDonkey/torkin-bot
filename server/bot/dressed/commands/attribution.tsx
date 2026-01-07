import { type CommandInteraction, Container } from '@dressed/react'
import { link, list } from 'discord-fmt'
import type { CommandConfig } from 'dressed'
import { GENERIC_COMMAND_CONFIG } from '../../utilities'

export const config = {
  ...GENERIC_COMMAND_CONFIG,
  description: "Attribution for the bot's data sources",
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply(
    <Container>
      This bot uses data from various sources, including but not limited to:{'\n'}
      {list(
        link('TheMovieDB', 'https://www.themoviedb.org/'),
        link('TheTVDB', 'https://www.thetvdb.com/'),
        link('IMDB', 'https://www.imdb.com/'),
      )}
    </Container>,
    { ephemeral: true },
  )
}
