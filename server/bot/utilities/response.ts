import type { MessageComponentInteraction } from 'dressed'

export function updateResponse<T>(
  // @ts-expect-error
  interaction: MessageComponentInteraction<T>,
  data: Parameters<MessageComponentInteraction['update']>[0],
) {
  if (interaction.history.some((history) => ['reply', 'deferReply', 'update', 'deferUpdate'].includes(history))) {
    return interaction.editReply(data)
  }

  return interaction.update(data)
}
