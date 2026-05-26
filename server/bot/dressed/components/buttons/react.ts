import type { MessageComponentInteraction } from '@dressed/react'
import { reconstructElementTree } from '@dressed/react'
import { createCallbackHandler } from '@dressed/react/callbacks'
import abseil from 'abseil'

const callbackHandler = createCallbackHandler({
  async default(interaction: Omit<MessageComponentInteraction, 'updateResponse'>) {
    const components = interaction.message.components ?? []
    abseil(components)
      .find(interaction.data.custom_id, [
        'Button',
        'ChannelSelect',
        'MentionableSelect',
        'RoleSelect',
        'StringSelect',
        'UserSelect',
      ])
      ?.update({ disabled: true })
    await interaction.update(reconstructElementTree(components))
    await interaction.followUp('That handler has expired', { ephemeral: true })
  },
})

export { pattern } from '@dressed/react/callbacks'
export default callbackHandler
