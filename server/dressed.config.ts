import type { MessageComponentInteraction, ModalSubmitInteraction } from 'dressed'
import type { ServerConfig } from 'dressed/server'

export default {
  build: { root: 'bot' },
  middleware: {
    components(...p: unknown[]) {
      const i = p[0] as MessageComponentInteraction | ModalSubmitInteraction
      return [
        {
          ...i,
          async updateResponse(...p: Parameters<MessageComponentInteraction['update']>) {
            if (i.history.some((h) => ['reply', 'deferReply', 'update', 'deferUpdate'].includes(h))) {
              return i.editReply(...p)
            }
            return i.update(...p)
          },
        },
        ...p.slice(1),
      ]
    },
  },
} satisfies ServerConfig
