import { useQuery } from '@tanstack/react-query'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { db } from '../../lib/db'
import { unwrap } from '../../utilities'
import { logger } from '../utilities/logger'

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
    queryFn: async () => {
      const [err, result] = await unwrap(db.userPreference.findUnique({ where: { discordUserId: userId } }))

      if (err) {
        logger.error(err, 'Failed to fetch user preferences')
        return null
      }

      if (!result) {
        const [createErr, createResult] = await unwrap(
          db.userPreference.create({
            data: {
              discordUserId: userId,
              createdBy: userId,
            },
          }),
        )

        if (createErr) {
          logger.error(createErr, 'Failed to create user preferences')
          return null
        }

        logger.debug(createResult, 'Created user preferences')

        return createResult
      }

      return result
    },
    initialData,
  })

  return <UserPreferencesContext.Provider value={query.data ?? initialData}>{children}</UserPreferencesContext.Provider>
}
