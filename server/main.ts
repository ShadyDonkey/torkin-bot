// import { cors } from '@elysiajs/cors'
// import { staticPlugin } from '@elysiajs/static'
// import { handleRequest } from 'dressed/server'
// import { Elysia } from 'elysia'
// import { commands, components, config, events } from './.dressed'
// import { logger } from './utilities/logger'

import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { overrideConsole } from './utilities/overrides'

// Have to do this to hijack Dressed's logs and pipe them to pino/LOKI
overrideConsole()

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}>()

app.use(
  '*',
  cors({
    origin: process.env.BASE_URL || 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    c.set('user', null)
    c.set('session', null)
    await next()
    return
  }
  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

if (process.env.NODE_ENV === 'production') {
  app.use('*', serveStatic({ root: join(import.meta.dir, '../public') }))
  app.get('/*', serveStatic({ path: join(import.meta.dir, '../public/index.html') }))
}

// const app = new Elysia()
//   .onError((err) => {
//     logger.error(err)
//   })
//   .post('/discord/handle-interaction', ({ request }) => handleRequest(request, commands, components, events, config), {
//     parse: 'none',
//   })
//   .use(
//     cors({
//       origin: process.env.BASE_URL || 'http://localhost:5173',
//       methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//       credentials: true,
//       allowedHeaders: ['Content-Type', 'Authorization'],
//     }),
//   )
//   .mount(auth.handler)
//   .use(spa({ dir: join(import.meta.dir, '../public') }))
//   // .get('/*', async ({ path }) => {
//   //   const staticFile = Bun.file(join(import.meta.dir, `../public/${path}`))
//   //   const fallBackFile = Bun.file(join(import.meta.dir, '../public/index.html'))
//   //   return (await staticFile.exists()) ? staticFile : fallBackFile
//   // })
//   // .use(
//   //   staticPlugin({
//   //     assets: join(import.meta.dir, '../public'),
//   //     prefix: '/',
//   //     indexHTML: true,
//   //     alwaysStatic: false,
//   //   }),
//   // )
//   .listen(3000)

import './jobs'
import { join } from 'node:path'

export default app
export type AppType = typeof app
