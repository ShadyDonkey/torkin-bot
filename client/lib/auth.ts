import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  plugins: [adminClient()],
})
