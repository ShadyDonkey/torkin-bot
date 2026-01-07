import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { UserPreferencesProvider } from './user-preferences'

const queryClient = new QueryClient()

export function BotProviders({ children, userId }: Readonly<PropsWithChildren<{ userId: string }>>) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider userId={userId}>{children}</UserPreferencesProvider>
    </QueryClientProvider>
  )
}
