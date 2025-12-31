import {
  type CommandInteraction,
  type MessageComponentInteraction,
  patchInteraction,
  TextDisplay,
} from '@dressed/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { link, subtext } from 'discord-fmt'
import type { ServerConfig } from 'dressed/server'

export const queryClient = new QueryClient()

export default {
  build: { root: 'bot', extensions: ['tsx', 'ts'] },
  port: 3000,
  middleware: {
    commands: (i) => {
      const patched = patchInteraction(i)
      return [
        {
          ...patched,
          reply: (c, ...p) => patched.reply(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
          editReply: (c, ...p) =>
            patched.editReply(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
          followUp: (c, ...p) =>
            patched.followUp(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
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
          reply: (c, ...p) => patched.reply(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
          editReply: (c, ...p) =>
            patched.editReply(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
          update: (c, ...p) =>
            patched.update(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
          followUp: (c, ...p) =>
            patched.followUp(<QueryClientProvider client={queryClient}>{c}</QueryClientProvider>, ...p),
          updateResponse(data, ...p) {
            if (typeof data !== 'string' && Math.random() < 0.3) {
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
