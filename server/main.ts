import { cors } from '@elysiajs/cors'
import { handleRequest } from 'dressed/server'
import { Elysia } from 'elysia'
import { commands, components, config, events } from './.dressed'
import { startJobs } from './jobs'
import { auth } from './lib/auth'
import { adminRoutes } from './routes/admin'
import { logger } from './utilities/logger'
import { overrideConsole } from './utilities/overrides'

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

// Start jobs and trigger
const triggerOnStart = process.env.NODE_ENV === 'production'
startJobs(triggerOnStart)

export const app = new Elysia()
  .onError((err) => {
    logger.error(err)
  })
  .post('/discord/handle-interaction', ({ request }) => handleRequest(request, commands, components, events, config), {
    parse: 'none',
  })
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .mount(auth.handler)
  .use(adminRoutes)
  .listen(3000)

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
