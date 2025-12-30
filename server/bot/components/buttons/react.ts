import { handleInteraction } from '@dressed/react'
import type { APIMessageComponent } from 'discord-api-types/v10'
import { createInteractionCallback } from 'dressed'

function trace(id: string, type: number, components: APIMessageComponent[]): APIMessageComponent | undefined {
  for (const component of components) {
    if ('custom_id' in component) {
      if (component.custom_id === id && component.type === type) {
        return component
      }
    }
    if ('components' in component) {
      const res = trace(id, type, component.components)
      if (res) {
        return res
      }
    }
    if ('accessory' in component) {
      return trace(id, type, [component.accessory])
    }
  }
}

export default async function (...[i, ...p]: Parameters<typeof handleInteraction>) {
  return handleInteraction(i, ...p).catch(async (e) => {
    if (e instanceof Error && e.message === 'Unknown handler' && 'component_type' in i.data) {
      const component = trace(i.data.custom_id, i.data.component_type, i.message?.components ?? [])
      if (component) {
        // @ts-expect-error
        component.disabled = true
      }
      await createInteractionCallback(i.id, i.token, 'UpdateMessage', { components: i.message?.components })
      return i.followUp('No handler found for that component', { ephemeral: true })
    }
  })
}

export { pattern } from '@dressed/react'
