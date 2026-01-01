import { inspect } from 'node:util'
import { createContext, type PropsWithChildren, useContext, useState } from 'react'
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

  db.userPreference
    .findUniqueOrThrow({
      where: {
        discordUserId: userId,
      },
    })
    .then((preferences) => {
      console.log('UserPreferencesProvider', inspect(preferences))
      setDbPreferences(preferences)
    })
    .catch((error) => {
      console.error('UserPreferencesProvider', error)
    })

  if (!dbPreferences) {
    return 'No user preferences found, please set them up in settings command first.'
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        country: dbPreferences.iso31661,
        language: dbPreferences.iso6391,
        timezone: dbPreferences.timezone,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}
