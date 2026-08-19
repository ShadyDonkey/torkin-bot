import type { DressedConfig } from '@dressed/framework'
import { type Params, patternToRegex } from '@dressed/matcher'
import {
  type ComponentInteraction,
  type ModalInteraction,
  patchInteraction,
  reconstructElementTree,
} from '@dressed/react'
import { createCallbackHandler, pattern } from '@dressed/react/callbacks'
import abseil from 'abseil'
import { BotProviders } from './bot/providers'

const patternRegex = patternToRegex(pattern)
const patch = (i: Parameters<typeof patchInteraction>[0]) =>
  patchInteraction(i, ({ children }) => <BotProviders userId={i.user.id}>{children}</BotProviders>)
const callbackHandler = createCallbackHandler({
  async default(interaction: ComponentInteraction | ModalInteraction) {
    if ('getField' in interaction) {
      return interaction.reply('That handler has expired', { ephemeral: true })
    }
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

export default {
  build: { root: 'bot/dressed', include: ['**/*.{ts,tsx}'] },
  hooks: {
    onBeforeCommand: (i) => [patch(i)],
    async onBeforeComponent(i, ...p) {
      if (i.message?.interaction_metadata && i.message.interaction_metadata.user.id !== i.user.id) {
        await i.reply({ content: "You didn't initiate this interaction!", ephemeral: true })
        throw new Error('Not the triggering user')
      }
      return [patch(i), ...p]
    },
    onUnknownInteraction(i) {
      if (!('custom_id' in i.data)) {
        return console.error('Unknown interaction', i)
      }
      const args = patternRegex.exec(i.data.custom_id)?.groups as Params<typeof pattern>
      return callbackHandler(i as Parameters<typeof callbackHandler>[0], args)
    },
  },
  server: { port: 3000 },
} satisfies DressedConfig
