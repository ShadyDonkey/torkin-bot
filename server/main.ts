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
  // .use(spa({ dir: join(import.meta.dir, '../public') }))
  // .get('/*', async ({ path }) => {
  //   const staticFile = Bun.file(join(import.meta.dir, `../public/${path}`))
  //   const fallBackFile = Bun.file(join(import.meta.dir, '../public/index.html'))
  //   return (await staticFile.exists()) ? staticFile : fallBackFile
  // })
  // .use(
  //   staticPlugin({
  //     assets: join(import.meta.dir, '../public'),
  //     prefix: '/',
  //     indexHTML: true,
  //     alwaysStatic: false,
  //   }),
  // )
  .listen(3000)

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

logger.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

import './jobs'

export type App = typeof app
