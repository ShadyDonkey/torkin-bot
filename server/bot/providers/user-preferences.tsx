import { useQuery } from '@tanstack/react-query'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { db } from '../../lib/db'
import { unwrap } from '../../utilities'
import { botLogger } from '../utilities/logger'

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
    async queryFn() {
      const [err, result] = await unwrap(
        db.userPreference.upsert({
          where: { discordUserId: userId },
          update: {},
          create: { discordUserId: userId, createdBy: userId },
        }),
      )

      if (err) {
        botLogger.error(err, 'Failed to fetch user preferences')
        return initialData
      }

      return result
    },
    initialData,
  })

  return <UserPreferencesContext.Provider value={query.data}>{children}</UserPreferencesContext.Provider>
}
