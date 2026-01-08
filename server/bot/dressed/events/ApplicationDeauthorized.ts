import { user } from 'discord-fmt'
import { type Event, executeWebhook } from 'dressed'
import { db } from '../../../lib/db'
import { unwrap } from '../../../utilities'
import { botLogger } from '../../utilities/logger'

export default async function (event: Event<'ApplicationDeauthorized'>) {
  let messageExtra = ''
  const [err] = await unwrap(
    db.discordWebhookEventLog.create({
      data: {
        type: 'ApplicationDeauthorized',
        data: JSON.stringify(event),
      },
    }),
  )

  if (err) {
    botLogger.error({ err }, 'ApplicationDeauthorized audit log failed to insert')
    messageExtra = 'Audit log failed to insert\n'
  } else {
    messageExtra = 'Audit log inserted successfully\n'
  }

  const [cleanupErr] = await unwrap(
    db.userPreference.deleteMany({
      where: {
        discordUserId: event.user.id,
      },
    }),
  )

  if (cleanupErr) {
    botLogger.error({ err: cleanupErr }, 'ApplicationDeauthorized cleanup failed')
    messageExtra += 'Cleanup failed\n'
  } else {
    messageExtra += 'Cleanup successful\n'
  }

  if (process.env.DISCORD_EVENT_LOG_WEBHOOK_ID && process.env.DISCORD_EVENT_LOG_WEBHOOK_TOKEN) {
    executeWebhook(process.env.DISCORD_EVENT_LOG_WEBHOOK_ID, process.env.DISCORD_EVENT_LOG_WEBHOOK_TOKEN, {
      content: `**Application Deauthorized**\n${event.user.username} (${user(event.user.id)}) just deauthorized the bot.\n${messageExtra}`,
    })
  }
}
