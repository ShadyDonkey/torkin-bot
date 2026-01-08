import { ApplicationIntegrationType } from 'discord-api-types/v10'
import { user } from 'discord-fmt'
import { type Event, executeWebhook } from 'dressed'
import { db } from '../../../lib/db'
import { unwrap } from '../../../utilities'
import { botLogger } from '../../utilities/logger'

export default async function (event: Event<'ApplicationAuthorized'>) {
  if (event.integration_type !== ApplicationIntegrationType.UserInstall) {
    return
  }

  let messageExtra = ''
  const [err] = await unwrap(
    db.discordWebhookEventLog.create({
      data: {
        type: 'ApplicationAuthorized',
        data: JSON.stringify(event),
      },
    }),
  )

  if (err) {
    botLogger.error({ err }, 'ApplicationAuthorized audit log failed to insert')
    messageExtra = 'Audit log failed to insert\n'
  } else {
    messageExtra = 'Audit log inserted successfully\n'
  }

  const [createErr] = await unwrap(
    db.userPreference.create({
      data: {
        discordUserId: event.user.id,
        createdBy: event.user.id,
      },
    }),
  )

  if (createErr) {
    botLogger.error({ err: createErr }, 'ApplicationAuthorized failed to create user preference')
    messageExtra += 'Failed to create user preference\n'
  } else {
    messageExtra += 'User preference created successfully\n'
  }

  if (process.env.DISCORD_EVENT_LOG_WEBHOOK_ID && process.env.DISCORD_EVENT_LOG_WEBHOOK_TOKEN) {
    executeWebhook(process.env.DISCORD_EVENT_LOG_WEBHOOK_ID, process.env.DISCORD_EVENT_LOG_WEBHOOK_TOKEN, {
      content: `**Application Authorized**\n${event.user.username} (${user(event.user.id)}) just authorized the bot.\n${messageExtra}`,
    })
  }
}
