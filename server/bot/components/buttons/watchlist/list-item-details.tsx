import type { Params } from '@dressed/matcher'
import { ActionRow, type MessageComponentInteraction } from '@dressed/react'
import { BackButton } from '@/server/bot/utilities/builders'
// import { buildSelectionDetails } from '@/server/bot/utilities/tmdb'

export const pattern = 'watchlist-:watchlistId-item-details-:id-:type(movie|tv){-:originPage}'

export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
  }

  await interaction.deferUpdate()

  return await interaction.updateResponse(
    <>
      {/* {await buildSelectionDetails(id, type)} */}
      <ActionRow>
        <BackButton
          prefix={`watchlist-${args.watchlistId}-items`}
          page={args.originPage}
          title="Items"
          style="Secondary"
        />
      </ActionRow>
    </>,
  )
}
