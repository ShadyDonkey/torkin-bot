import type { APIInteractionResponseCallbackData, RESTPostAPIInteractionCallbackQuery } from 'discord-api-types/v10'
import { link, subtext } from 'discord-fmt'
import { type MessageComponentInteraction, TextDisplay } from 'dressed'
import type { RawFile, ServerConfig } from 'dressed/server'

export default {
  build: { root: 'bot' },
  middleware: {
    components: (i, ...p) => {
      return [
        {
          ...i,
          updateResponse(...p: Parameters<MessageComponentInteraction['updateResponse']>) {
            if (typeof p.at(0) !== 'string') {
              const el = p.at(0) as APIInteractionResponseCallbackData & {
                files?: RawFile[]
              } & RESTPostAPIInteractionCallbackQuery

              if (el.components) {
                if (Math.random() < 0.3) {
                  el.components.push(
                    TextDisplay(
                      subtext(
                        `Enjoying Torkin? Consider ${link('donating on Ko-Fi', '<https://ko-fi.com/matthatcher>')} to keep the project alive and remain free.`,
                      ),
                    ),
                  )
                }
              }

              p[0] = el
            }

            if (i.history.some((h) => ['reply', 'deferReply', 'update', 'deferUpdate'].includes(h))) {
              return i.editReply(...p)
            }
            return i.update(...p)
          },
        },
        ...p,
      ]
    },
  },
} satisfies ServerConfig
