import { installCommands } from 'dressed/server'
import { Elysia, t } from 'elysia'
import { StatusCodes } from 'http-status-codes'
import { commands } from '../.dressed'
import { auth, authMacro } from '../lib/auth'
import { unwrap } from '../utilities'
import { createErrorRes, createResponseSchema, createSuccessRes } from '../utilities/elysia/response'
import { logger } from '../utilities/logger'

export const admin = new Elysia({
  name: 'admin',
  prefix: 'api/admin',
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
  .post(
    '/bot/install-commands',
    async () => {
      const [err] = await unwrap(installCommands(commands))

      if (err) {
        logger.error(err)

        return createErrorRes(err.message)
      }

      return createSuccessRes({ message: 'Commands installed successfully' })
    },
    {
      schema: createResponseSchema(t.Object({ message: t.String() })),
      auth: true,
    },
  )
