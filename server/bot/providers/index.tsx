import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { APIUser } from 'discord-api-types/v10'
import type { PropsWithChildren } from 'react'

const queryClient = new QueryClient()

export function BotProviders({ children, user }: PropsWithChildren & { user: APIUser }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <UserPreferencesProvider userId={userId}>{children}</UserPreferencesProvider> */}
      {children}
    </QueryClientProvider>
  )
}
