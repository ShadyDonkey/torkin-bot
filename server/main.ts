import { cors } from '@elysiajs/cors'
import { handleRequest } from 'dressed/server'
import { Elysia } from 'elysia'
import { commands, components, config, events } from './.dressed'
import { auth } from './lib/auth'
import { logger } from './utilities/logger'
import { overrideConsole } from './utilities/overrides'

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

export const app = new Elysia({ prefix: '/api' })
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

logger.info(`🦊 Elysia is handling API requests`)

export type App = typeof app
