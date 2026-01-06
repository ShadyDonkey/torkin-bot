import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { handleRequest } from 'dressed/server'
import { Elysia } from 'elysia'
import { commands, components, config, events } from './.dressed'
import { auth } from './lib/auth'
import { logger } from './utilities/logger'
import { overrideConsole } from './utilities/overrides'

const app = new Elysia()
  .onError((err) => {
    logger.error(err)
  })
  .post('/discord/handle-interaction', ({ request }) => handleRequest(request, commands, components, events, config), {
    parse: 'none',
  })
  .use(
    cors({
      origin: process.env.BASE_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .mount(auth.handler)
  .use(
    staticPlugin({
      assets: '../public',
      prefix: '/',
      indexHTML: true,
      alwaysStatic: true,
    }),
  )
  .listen(3000)

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

import './jobs'

export type App = typeof app
