import { inspect } from 'node:util'
import { useEffect, useState } from 'react'
import { db } from '../../lib/db'

export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<{
    country: string
    language: string
    timezone: string
  }>({
    country: 'US',
    language: 'en',
    timezone: 'America/New_York',
  })

  useEffect(() => {
    db.userPreference
      .findFirstOrThrow({
        where: { discordUserId: userId },
        select: { country: true, language: true, timezone: true },
      })
      .then((preference) => {
        setPreferences({
          country: preference.country,
          language: preference.language,
          timezone: preference.timezone,
        })
      })
      .catch((error) => {
        console.error('Error fetching user preferences:', inspect(error))
      })
  }, [userId])

  return preferences
}
