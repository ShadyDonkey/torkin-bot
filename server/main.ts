import { join } from 'node:path'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { handleRequest, installCommands } from 'dressed/server'
import { Elysia, file } from 'elysia'
import { commands, components, config, events } from './.dressed'
import { auth } from './lib/auth'
import { cache } from './lib/cache'
import { logger } from './utilities/logger'
import { overrideConsole } from './utilities/overrides'

const app = new Elysia()
  .onError((err) => {
    logger.error(err)
    // return new Response('Internal Server Error', { status: 500 })
  })
  // .get('/install-commands', async () => {
  //   await installCommands(commands)

  //   return 'Commands installed'
  // })
  .use(
    cors({
      origin: process.env.BASE_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .mount(auth.handler)
  .post('/discord/handle-interaction', ({ request }) => handleRequest(request, commands, components, events, config), {
    parse: 'none',
  })
  .listen(3000)

if (process.env.NODE_ENV === 'production') {
  app
    .use(
      staticPlugin({
        assets: join(import.meta.dir, '../public'),
        prefix: '/',
        alwaysStatic: true,
      }),
    )
    .get('*', () => file(join(import.meta.dir, '../public/index.html')))
}

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

import './jobs'

export type App = typeof app
