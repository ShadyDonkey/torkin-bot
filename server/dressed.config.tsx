import {
  type CommandInteraction,
  type MessageComponentInteraction,
  patchInteraction,
  TextDisplay,
} from '@dressed/react'
import { link, subtext } from 'discord-fmt'
import type { ServerConfig } from 'dressed/server'
import { BotProviders } from './bot/providers'

export default {
  build: { root: 'bot/dressed', extensions: ['tsx', 'ts'] },
  port: 3000,
  middleware: {
    commands(i) {
      const patched = patchInteraction(i)
      return [
        {
          ...patched,
          reply: (c, ...p) => patched.reply(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
          editReply: (c, ...p) => patched.editReply(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
          followUp: (c, ...p) => patched.followUp(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
        } as CommandInteraction,
      ]
    },
    async components(i, ...p) {
      if (i.message?.interaction_metadata && i.message.interaction_metadata.user.id !== i.user.id) {
        await i.reply({ content: "You did't initiate this interaction!", ephemeral: true })
        throw new Error('Not the triggering user')
      }
      const patched = patchInteraction(i)
      return [
        {
          ...patched,
          reply: (c, ...p) => patched.reply(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
          editReply: (c, ...p) => patched.editReply(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
          update: (c, ...p) => patched.update(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
          followUp: (c, ...p) => patched.followUp(<BotProviders userId={patched.user.id}>{c}</BotProviders>, ...p),
          updateResponse(data, ...p) {
            if (typeof data !== 'string' && Math.random() < 0.7) {
              data = (
                <>
                  {data}
                  <TextDisplay>
                    {subtext(
                      `Enjoying Torkin? Consider ${link('donating on Ko-Fi', '<https://ko-fi.com/matthatcher>')} to keep the project alive and remain free.`,
                    )}
                  </TextDisplay>
                </>
              )
            }
            if (patched.history.some((h) => ['reply', 'deferReply', 'update', 'deferUpdate'].includes(h))) {
              return this.editReply(data, ...p)
            }
            return this.update(data, ...p)
          },
        } as MessageComponentInteraction,
        ...p,
      ]
    },
  },
} satisfies ServerConfig
