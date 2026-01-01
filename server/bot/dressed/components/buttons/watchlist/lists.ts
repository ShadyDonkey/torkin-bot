// import type { Params } from '@dressed/matcher'
// import type { MessageComponentInteraction } from '@dressed/react'
// import { buildListComponents } from '@/server/bot/components/commands/watchlist'

// export const pattern = 'watchlist-results-goto-:page(\\d+)-:throwaway'

// export default async function (interaction: MessageComponentInteraction, args: Params<typeof pattern>) {
//   if (!interaction.message.interaction_metadata) {
//     return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
//   }

//   const page = Number.parseInt(args.page, 10)
//   await interaction.deferUpdate()

//   return await interaction.updateResponse(
//     await buildListComponents(interaction.message.interaction_metadata.user.id, page),
//   )
// }
