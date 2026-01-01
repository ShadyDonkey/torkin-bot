import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { UserPreferencesProvider } from '@/server/bot/providers/user-preferences'

const queryClient = new QueryClient()

export function BotProviders({ children, userId }: PropsWithChildren & { userId: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider userId={userId}>{children}</UserPreferencesProvider>
    </QueryClientProvider>
  )
}
