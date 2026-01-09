import { ActionRow, Container, SelectMenu, SelectMenuOption } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { h2, h3, subtext } from 'discord-fmt'
import { useEffect, useState } from 'react'
import { db } from '../../../../lib/db'
import { unwrap } from '../../../../utilities'
import type { UserTrackingSetting } from '../../../../zenstack/models'
import { useUserPreferences } from '../../../providers/user-preferences'
import { botLogger } from '../../../utilities/logger'

export default function TrackingSettings({ userId }: Readonly<{ userId: string }>) {
  const userPreferences = useUserPreferences()
  const [defaultTime, setDefaultTime] = useState(12)
  const query = useQuery<Pick<UserTrackingSetting, 'notificationHour'>>({
    queryKey: ['tracking-settings', userId],
    queryFn: async () => {
      const [err, result] = await unwrap(
        db.userTrackingSetting.upsert({
          where: { userId },
          create: { userId, createdBy: userId },
          update: {},
        }),
      )

      if (err) {
        botLogger.error(err, 'Failed to fetch user tracking settings')
        return { notificationHour: 12 }
      }

      return result
    },
  })

  useEffect(() => {
    if (query.data) {
      setDefaultTime(query.data.notificationHour)
    }
  }, [query.data])

  return (
    <Container>
      {h2('Tracking Settings')}
      {'\n'}
      Notifications for tracking will be sent via DM, there is no other manner of notification. To stop receiving
      notifications, remove all tracked items.
      {'\n'}
      {h3('Notification Time')}
      {'\n'}
      *Will be converted from {userPreferences.timezone}*
      <ActionRow>
        <SelectMenu
          type="String"
          onSubmit={async (e) => {
            // TODO: Take hour and convert to UTC to persist to database, then refetch the data
            // const hour = e.data.values
            const hour = Number(e.data.values.at(0)) ?? 12
          }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <SelectMenuOption
              // biome-ignore lint/suspicious/noArrayIndexKey: allowed
              key={i}
              label={`${i === 0 ? 12 : i > 12 ? i - 12 : i}${i >= 12 ? 'pm' : 'am'}`}
              value={String(i)}
              default={defaultTime === i}
            />
          ))}
        </SelectMenu>
      </ActionRow>
      {'\n'}
      {subtext('This is a rough time estimate and notifications could be sent ±30 minutes')}
      {'\n'}
      {/* TODO: Need to use date-fns to convert the hour and timezone to next available UTC time */}
    </Container>
  )
}
