import { zenstackAdapter } from '@zenstackhq/better-auth'
import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { Elysia } from 'elysia'
import { db } from './db'

export const auth = betterAuth({
  appName: 'Torkin',
  basePath: '/auth',
  trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
  database: zenstackAdapter(db, {
    provider: 'postgresql',
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_APP_ID as string,
      clientSecret: process.env.DISCORD_OAUTH_SECRET as string,
      redirectURI: `${process.env.API_URL || 'http://localhost:3000'}/auth/callback/discord`,
    },
  },
  plugins: [admin()],
})

export const authMacro = new Elysia({ name: 'better-auth-macro' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      })

      if (!session) {
        return status(401)
      }

      return {
        user: session.user,
        session: session.session,
      }
    },
  },
})
