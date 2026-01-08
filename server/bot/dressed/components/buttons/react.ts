import type { MessageComponentInteraction } from '@dressed/react'
import { createCallbackHandler } from '@dressed/react/callbacks'
import type { APIMessageComponent } from 'discord-api-types/v10'
import { createInteractionCallback } from 'dressed'

function trace(id: string, type: number, components: APIMessageComponent[]): APIMessageComponent | undefined {
  for (const component of components) {
    if ('custom_id' in component && component.custom_id === id && component.type === type) {
      return component
    }

    if ('components' in component) {
      const found = trace(id, type, component.components)
      if (found) {
        return found
      }
    }

    if ('accessory' in component) {
      const found = trace(id, type, [component.accessory])
      if (found) {
        return found
      }
    }
  }
}

const callbackHandler = createCallbackHandler({
  async default(i: Omit<MessageComponentInteraction, 'updateResponse'>) {
    const component = trace(i.data.custom_id, i.data.component_type, i.message?.components ?? [])
    if (component) {
      // @ts-expect-error
      component.disabled = true
    }
    await createInteractionCallback(i.id, i.token, 'UpdateMessage', { components: i.message?.components })
    await i.followUp('That handler has expired', { ephemeral: true })
  },
})

export { pattern } from '@dressed/react/callbacks'
export default callbackHandler
