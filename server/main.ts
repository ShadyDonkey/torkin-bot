import { join } from 'node:path'
import { staticPlugin } from '@elysiajs/static'
import { handleRequest, installCommands } from 'dressed/server'
import { Elysia } from 'elysia'
import { commands, components, config, events } from './.dressed'
import { cache } from './lib/cache'
import { logger } from './utilities/logger'
import { overrideConsole } from './utilities/overrides'

const app = new Elysia()
  .onError((err) => {
    logger.error(err)
    return new Response('Internal Server Error', { status: 500 })
  })
  // .get('/install-commands', async () => {
  //   await installCommands(commands)

  //   return 'Commands installed'
  // })
  // .get('/clear-cache', () => {
  //   cache.clear()
  //   return 'Cache cleared'
  // })
  .post('/discord/handle-interaction', ({ request }) => handleRequest(request, commands, components, events, config), {
    parse: 'none',
  })
  .use(
    staticPlugin({
      assets: join(import.meta.dir, '../public'),
      prefix: '/',
      indexHTML: true,
    }),
  )
  .listen(3000)

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

import './jobs'
