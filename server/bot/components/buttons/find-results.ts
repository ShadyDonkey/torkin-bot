import type { MessageComponentInteraction } from 'dressed'

export const pattern = 'find-all-results'

export default async function (interaction: MessageComponentInteraction) {
  console.log('See all results interaction ID:', interaction.message.interaction_metadata!.id)

  // console.log(interaction)
}
