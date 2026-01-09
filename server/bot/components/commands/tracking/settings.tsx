import { UTCDate } from '@date-fns/utc'
import { ActionRow, Container, SelectMenu, SelectMenuOption } from '@dressed/react'
import { useQuery } from '@tanstack/react-query'
import { addHours } from 'date-fns'
import { h2, h3, subtext, TimestampStyle, timestamp } from 'discord-fmt'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../../../../lib/db'
import { unwrap } from '../../../../utilities'
import { localHourToUtc, utcHourToLocal } from '../../../../utilities/timezone'
import type { UserTrackingSetting } from '../../../../zenstack/models'
import { useUserPreferences } from '../../../providers/user-preferences'
import { botLogger } from '../../../utilities/logger'

export default function TrackingSettings({ userId }: Readonly<{ userId: string }>) {
  const userPreferences = useUserPreferences()
  const [selectedLocalHour, setSelectedLocalHour] = useState(12)
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
      setSelectedLocalHour(utcHourToLocal(query.data.notificationHour, userPreferences.timezone))
    }
  }, [query.data, userPreferences.timezone])

  const utcHour = useMemo(
    () => localHourToUtc(selectedLocalHour, userPreferences.timezone),
    [selectedLocalHour, userPreferences.timezone],
  )

  const epoch = useMemo(() => {
    let utcDate = new UTCDate()
    utcDate.setHours(utcHour, 0, 0, 0)

    const now = new UTCDate()

    if (utcDate.getTime() <= now.getTime()) {
      utcDate = addHours(utcDate, 24)
    }

    return Math.floor(utcDate.getTime() / 1000).toString()
  }, [utcHour])

  return (
    <Container>
      {h2('Tracking Settings')}
      {'\n'}
      Notifications for tracking will be sent via DM, there is no other manner of notification. To stop receiving
      notifications, remove all tracked items.
      {'\n'}
      *This feature is still in testing, please report any issues ASAP.*
      {'\n'}
      {h3('Notification Time')}
      {'\n'}
      *Will be converted from {userPreferences.timezone}*
      <ActionRow>
        <SelectMenu
          type="String"
          onSubmit={async (e) => {
            const localHour = Number(e.data.values.at(0)) ?? 12
            setSelectedLocalHour(localHour)
            const utcHour = localHourToUtc(localHour, userPreferences.timezone)
            const [err] = await unwrap(
              db.userTrackingSetting.update({
                where: { userId },
                data: { notificationHour: utcHour },
              }),
            )

            if (err) {
              botLogger.error(err, 'Failed to update tracking settings')
              return
            }

            await query.refetch()
          }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <SelectMenuOption
              // biome-ignore lint/suspicious/noArrayIndexKey: allowed
              key={i}
              label={`${i === 0 ? 12 : i > 12 ? i - 12 : i}${i >= 12 ? 'pm' : 'am'}`}
              value={String(i)}
              default={selectedLocalHour === i}
            />
          ))}
        </SelectMenu>
      </ActionRow>
      {'\n'}
      Based on current selection, the next notification will be sent at {timestamp(epoch, TimestampStyle.ShortTime)} (
      {timestamp(epoch, TimestampStyle.RelativeTime)}){'\n'}
      {subtext('This is a rough time estimate and notifications could be sent ±30 minutes')}
    </Container>
  )
}
