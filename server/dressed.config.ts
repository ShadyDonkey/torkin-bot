import { link, subtext } from 'discord-fmt'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import type { ServerConfig } from 'dressed/server'

export default {
  build: { root: 'bot' },
  port: 3000,
  middleware: {
    async components(i, ...p) {
      if (i.message?.interaction_metadata && i.message.interaction_metadata.user.id !== i.user.id) {
        await i.reply({ content: "You did't initiate this interaction!", ephemeral: true })
        throw new Error('Not the triggering user')
      }
      return [
        {
          ...i,
          updateResponse(data, ...p) {
            if (typeof data !== 'string' && Math.random() < 0.3) {
              data.components?.push(
                TextDisplay(
                  subtext(
                    `Enjoying Torkin? Consider ${link('donating on Ko-Fi', '<https://ko-fi.com/matthatcher>')} to keep the project alive and remain free.`,
                  ),
                ),
              )
            }
            if (i.history.some((h) => ['reply', 'deferReply', 'update', 'deferUpdate'].includes(h))) {
              return i.editReply(data, ...p)
            }
            return i.update(data, ...p)
          },
        } as MessageComponentInteraction,
        ...p,
      ]
    },
  },
} satisfies ServerConfig
