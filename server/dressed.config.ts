import type { MessageComponentInteraction } from 'dressed'
import type { ServerConfig } from 'dressed/server'

export default {
  build: { root: 'bot' },
  middleware: {
    components: (i, ...p) => [
      {
        ...i,
        updateResponse(...p: Parameters<MessageComponentInteraction['updateResponse']>) {
          if (i.history.some((h) => ['reply', 'deferReply', 'update', 'deferUpdate'].includes(h))) {
            return i.editReply(...p)
          }
          return i.update(...p)
        },
      },
      ...p,
    ],
  },
} satisfies ServerConfig
