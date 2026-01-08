import { differenceInHours, getTime } from 'date-fns'
import { installCommands } from 'dressed/server'
import { Elysia } from 'elysia'
import { StatusCodes } from 'http-status-codes'
import { commands } from '../../.dressed'
import { auth, authMacro } from '../../lib/auth'
import { cache } from '../../lib/cache'
import { unwrap } from '../../utilities'
import { createErrorRes, createResponseSchema, createSuccessRes } from '../../utilities/elysia/response'
import { logger } from '../../utilities/logger'
import { cacheManager } from './cache-manager'
import { InstallCommandSchema } from './types'

export const adminRoutes = new Elysia({
  name: 'admin',
  prefix: 'admin',
})
  .use(authMacro)
  .guard({
    beforeHandle: async ({ status, request: { headers } }) => {
      const session = await auth.api.getSession({ headers })
      if (!session) {
        return status(StatusCodes.UNAUTHORIZED)
      }

      if (session.user.role !== 'admin') {
        return status(StatusCodes.FORBIDDEN)
      }
    },
  })
  .use(cacheManager)
  .post(
    '/bot/install-commands',
    async ({ set }) => {
      const [cacheErr, cacheResultEpoch] = await unwrap(cache.get<string>('site:admin:bot:install-commands'))

      if (cacheErr) {
        logger.error(cacheErr)
      }

      if (cacheResultEpoch) {
        const now = getTime(Date.now())
        const diff = differenceInHours(now, cacheResultEpoch)

        if (diff < 2) {
          return createErrorRes(
            'Commands already installed within the last 2 hours',
            set,
            StatusCodes.TOO_MANY_REQUESTS,
          )
        }
      }

      const [err] = await unwrap(installCommands(commands))

      if (err) {
        logger.error(err)

        return createErrorRes(err.message)
      }

      const [cacheSetErr] = await unwrap(cache.set('site:admin:bot:install-commands', getTime(Date.now()), '1.5h'))

      if (cacheSetErr) {
        logger.error(cacheSetErr)
      }

      return createSuccessRes({ message: 'Commands installed successfully' })
    },
    {
      schema: createResponseSchema(InstallCommandSchema),
      auth: true,
    },
  )
