import { handleRequest, installCommands } from 'dressed/server'
import { Elysia } from 'elysia'
import { commands, components, config, events } from '@/server/.dressed'
import { logger } from '@/server/lib/pino'

const app = new Elysia()
  .onError((err) => {
    logger.error(err)
    return new Response('Internal Server Error', { status: 500 })
  })
  .get('/', () => '🦊 Elysia')
  .get('/install-commands', async () => {
    await installCommands(commands)

    return 'Commands installed'
  })
  .post('/', ({ request }) => handleRequest(request, commands, components, events, config), {
    parse: 'none',
  })
  .listen(3000)

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
