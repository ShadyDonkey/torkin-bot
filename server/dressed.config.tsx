import type { DressedConfig } from '@dressed/framework'
import { type Params, patternToRegex } from '@dressed/matcher'
import { type ComponentInteraction, patchInteraction, reconstructElementTree } from '@dressed/react'
import { createCallbackHandler, pattern } from '@dressed/react/callbacks'
import abseil from 'abseil'
import { BotProviders } from './bot/providers'

const callbackHandler = createCallbackHandler({
  async default(interaction: Omit<ComponentInteraction, 'updateResponse'>) {
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
    onBeforeCommand: (i) => [
      patchInteraction(i, ({ children }) => (
        <BotProviders userId={i.user.id} interaction={i}>
          {children}
        </BotProviders>
      )),
    ],
    async onBeforeComponent(i, ...p) {
      if (i.message?.interaction_metadata && i.message.interaction_metadata.user.id !== i.user.id) {
        await i.reply({ content: "You didn't initiate this interaction!", ephemeral: true })
        throw new Error('Not the triggering user')
      }
      const patched = patchInteraction(i, ({ children }) => (
        <BotProviders userId={i.user.id} interaction={i}>
          {children}
        </BotProviders>
      ))
      return [patched, ...p]
    },
    onUnknownInteraction(i) {
      if (i.type !== 3 && i.type !== 5) {
        return console.error('Unknown interaction', i)
      }
      const args = patternToRegex(pattern).exec(i.data.custom_id)?.groups as Params<typeof pattern>
      return callbackHandler(i as Parameters<typeof callbackHandler>[0], args)
    },
  },
  server: { port: 3000 },
} satisfies DressedConfig
