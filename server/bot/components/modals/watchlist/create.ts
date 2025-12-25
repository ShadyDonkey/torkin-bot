import { MessageFlags } from 'discord-api-types/v10'
import { emoji } from 'discord-fmt'
import { ActionRow, Button, type ModalSubmitInteraction, TextDisplay } from 'dressed'
import { convertToState } from '@/server/bot/utilities/commands/watchlist'
import { logger } from '@/server/bot/utilities/logger'
import { unwrap } from '@/server/utilities'
import { createWatchlist } from '@/server/utilities/db/watchlist'

export const pattern = 'watchlist-create'

export default async function (interaction: ModalSubmitInteraction) {
  await interaction.reply({
    // TODO: Change this to use an env file or some reference or something....maybe a yaml/toml file?
    components: [TextDisplay(`${emoji('loading', '1450217478356467753', true)} Creating watchlist...`)],
    flags: MessageFlags.IsComponentsV2,
  })

  const name = interaction.getField('name', true).textInput() || 'My Watchlist'
  const description = interaction.getField('description', false)?.textInput() || undefined
  const makeDefault = interaction.getField('default', true)?.stringSelect().at(0) || 'no'
  const state = convertToState(interaction.getField('privacy', true)?.stringSelect().at(0) || 'private')

  const [createErr, created] = await unwrap(
    createWatchlist({
      discordUserId: interaction.user.id,
      name,
      description,
      state,
      default: makeDefault === 'yes',
    }),
  )

  if (createErr) {
    logger.error(createErr)
    return await interaction.updateResponse({
      components: [TextDisplay(`Error creating watchlist. Please try again later.`)],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  // TODO: Add a view button here.
  await interaction.updateResponse({
    components: [
      TextDisplay(`Watchlist created successfully!`),
      ActionRow(
        Button({
          custom_id: `watchlist-${created.id}-details`,
          label: 'View Watchlist',
          style: 'Primary',
        }),
        Button({
          custom_id: `watchlist-results-goto-1-all`,
          label: 'All Watchlists',
          style: 'Secondary',
        }),
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
  })
}
