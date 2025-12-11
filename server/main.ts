import { commands, components, config, events } from '@server/.dressed'
import { handleRequest, installCommands } from 'dressed/server'
import { Elysia } from 'elysia'

const app = new Elysia()
  .onError((err) => {
    console.error(err)
    return new Response('Internal Server Error', { status: 500 })
  })
  .get('/', () => '🦊 Elysia')
  .get('/install-commands', async () => {
    await installCommands(commands)

    return 'Commands installed'
  })
  .post('/discord/handle-interaction', ({ request }) => handleRequest(request, commands, components, events, config), {
    parse: 'none',
  })
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
