import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { type InteractionContextType, InteractionProvider } from './interaction'
import { UserPreferencesProvider } from './user-preferences'

const queryClient = new QueryClient()

export function BotProviders({
  children,
  userId,
  interaction,
}: Readonly<PropsWithChildren<{ userId: string; interaction: InteractionContextType }>>) {
  return (
    <QueryClientProvider client={queryClient}>
      <InteractionProvider interaction={interaction}>
        <UserPreferencesProvider userId={userId}>{children}</UserPreferencesProvider>
      </InteractionProvider>
    </QueryClientProvider>
  )
}
