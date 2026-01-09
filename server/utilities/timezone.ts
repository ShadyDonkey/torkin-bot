import { TZDate } from '@date-fns/tz'
import { UTCDate } from '@date-fns/utc'

export function localHourToUtc(hour: number, timezone: string): number {
  const zonedDate = TZDate.tz(timezone)
  zonedDate.setHours(hour, 0, 0, 0)

  return zonedDate.getUTCHours()
}

export function utcHourToLocal(utcHour: number, timezone: string): number {
  const utcDate = new UTCDate()
  utcDate.setHours(utcHour, 0, 0, 0)

  const zonedDate = new TZDate(utcDate, timezone)

  return zonedDate.getHours()
}

export function formatUtcHour(hour: number): string {
  const period = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}${period} UTC`
}
