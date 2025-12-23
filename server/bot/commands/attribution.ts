import { MessageFlags } from 'discord-api-types/v10'
import { link, list } from 'discord-fmt'
import { type CommandConfig, type CommandInteraction, Container, TextDisplay } from 'dressed'
import { DEV_GUILD_ID, IS_IN_DEV } from '@/server/lib/config'

export const config = {
  description: "Attribution for the bot's data sources",
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
} satisfies CommandConfig

export default async function (interaction: CommandInteraction<typeof config>) {
  return await interaction.reply({
    components: [
      Container(
        TextDisplay(
          `This bot uses data from various sources, including but not limited to:\n${list(link('TheMovieDB', 'https://www.themoviedb.org/'), link('TheTVDB', 'https://www.thetvdb.com/'), link('IMDB', 'https://www.imdb.com/'))}`,
        ),
        // MediaGallery(
        //   MediaGalleryItem(
        //     'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg',
        //     {
        //       description: 'TheMovieDB',
        //     },
        //   ),
        //   MediaGalleryItem('https://www.thetvdb.com/images/logo.svg', {
        //     description: 'TheTVDB',
        //   }),
        // ),
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
    ephemeral: true,
  })
}
