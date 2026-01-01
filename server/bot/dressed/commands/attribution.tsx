import { type CommandInteraction, Container } from '@dressed/react'
import { link, list } from 'discord-fmt'
import type { CommandConfig } from 'dressed'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'

export const config = {
  description: "Attribution for the bot's data sources",
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
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
