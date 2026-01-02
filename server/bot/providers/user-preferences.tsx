import { inspect } from 'node:util'
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { db } from '@/server/lib/db'
import type { UserPreference } from '@/server/zenstack/models'

type UserPreferences = {
  language: string
  country: string
  timezone: string
}

const UserPreferencesContext = createContext<UserPreferences>({
  language: 'en',
  country: 'US',
  timezone: 'America/New_York',
})

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)

  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }

  return context
}

export function UserPreferencesProvider({ children, userId }: PropsWithChildren & { userId: string }) {
  const [dbPreferences, setDbPreferences] = useState<UserPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    db.userPreference
      .findUniqueOrThrow({
        where: {
          discordUserId: userId,
        },
      })
      .then((preferences) => {
        console.log('UserPreferencesProvider', inspect(preferences))
        setDbPreferences(preferences)
        setLoading(false)
      })
      .catch((error) => {
        setError('Error fetching user preferences')
        setLoading(false)
        console.error('Error fetching user preferences', inspect(error))
      })
  }, [userId])

  if (loading) {
    return 'Loading...'
  }

  if (!dbPreferences) {
    return 'No user preferences found, please set them up in settings command first.'
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        country: dbPreferences.country,
        language: dbPreferences.language,
        timezone: dbPreferences.timezone,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}
