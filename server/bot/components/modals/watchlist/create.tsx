import { ActionRow, Button, type ModalSubmitInteraction } from '@dressed/react'
import { emoji } from 'discord-fmt'
import { convertToState } from '@/server/bot/utilities/commands/watchlist'
import { logger } from '@/server/bot/utilities/logger'
import { unwrap } from '@/server/utilities'
import { createWatchlist } from '@/server/utilities/db/watchlist'

export const pattern = 'watchlist-create'

export default async function (interaction: ModalSubmitInteraction) {
  // TODO: Change this to use an env file or some reference or something....maybe a yaml/toml file?
  await interaction.reply(`${emoji('loading', '1450217478356467753', true)} Creating watchlist...`)

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
    return await interaction.updateResponse(`Error creating watchlist. Please try again later.`)
  }

  // TODO: Add a view button here.
  await interaction.updateResponse(
    <>
      Watchlist created successfully!
      <ActionRow>
        <Button custom_id={`watchlist-${created.id}-details`} label="View Watchlist" />
        <Button custom_id="watchlist-results-goto-1-all" label="All Watchlists" style="Secondary" />
      </ActionRow>
    </>,
  )
}
