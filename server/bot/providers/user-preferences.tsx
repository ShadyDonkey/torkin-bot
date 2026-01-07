import { useQuery } from '@tanstack/react-query'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { db } from '../../lib/db'

type UserPreferences = { language: string; country: string; timezone: string }

const UserPreferencesContext = createContext<UserPreferences | null>(null)

const initialData = { language: 'en', country: 'US', timezone: 'America/New_York' }

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)

  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }

  return context
}

export function UserPreferencesProvider({ children, userId }: Readonly<PropsWithChildren<{ userId: string }>>) {
  const query = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => db.userPreference.findUnique({ where: { discordUserId: userId } }),
    initialData,
  })

  return <UserPreferencesContext.Provider value={query.data ?? initialData}>{children}</UserPreferencesContext.Provider>
}
