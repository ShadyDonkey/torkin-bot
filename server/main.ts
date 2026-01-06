import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { handleRequest } from 'dressed/server'
import { Elysia } from 'elysia'
import { commands, components, config, events } from './.dressed'
import { auth } from './lib/auth'
import { logger } from './utilities/logger'
import { overrideConsole } from './utilities/overrides'

const spa = (options: { dir: string }) => {
  const { dir } = options
  const baseUrl = '/'
  const index = 'index.html'
  const plugin = new Elysia({ name: 'spa', seed: options })

  plugin.get(join(baseUrl, '*'), async ({ set, path }) => {
    // Normalize request path and strip baseUrl prefix (baseUrl is fixed as "/")
    let requestPath = path.startsWith(baseUrl) ? path.slice(baseUrl.length) : path
    if (!requestPath || requestPath === '/') {
      requestPath = index
    }

    const hasExt = !!extname(requestPath)

    if (hasExt) {
      // Static asset with extension; return 404 if file does not exist
      const filePath = join(dir, requestPath)
      const file = Bun.file(filePath)

      if (!(await file.exists())) {
        set.status = 404
        return 'Not Found'
      }

      set.headers['content-type'] = file.type
      return file
    }

    // For all other cases, always return index.html (SPA fallback)
    const indexFile = Bun.file(join(dir, index))
    set.headers['content-type'] = indexFile.type
    return indexFile
  })

  return plugin
}

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
  .use(spa({ dir: join(import.meta.dir, '../public') }))
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
import { extname, join } from 'node:path'

export type App = typeof app
