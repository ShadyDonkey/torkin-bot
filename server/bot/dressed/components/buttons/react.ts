import type { MessageComponentInteraction } from '@dressed/react'
import { createCallbackHandler } from '@dressed/react/callbacks'
import abseil from 'abseil'
import { createInteractionCallback } from 'dressed'

const callbackHandler = createCallbackHandler({
  async default(i: Omit<MessageComponentInteraction, 'updateResponse'>) {
    abseil(i.message.components ?? [])
      .find(i.data.custom_id, [
        'Button',
        'ChannelSelect',
        'MentionableSelect',
        'RoleSelect',
        'SelectMenu',
        'UserSelect',
      ])
      ?.update({ disabled: true })
    await createInteractionCallback(i.id, i.token, 'UpdateMessage', { components: i.message?.components })
    await i.followUp('That handler has expired', { ephemeral: true })
  },
})

export { pattern } from '@dressed/react/callbacks'
export default callbackHandler
