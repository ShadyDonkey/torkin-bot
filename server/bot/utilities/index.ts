import type { CommandConfig } from 'dressed'
import { DEV_GUILD_ID, IS_IN_DEV } from '../../lib/config'

export const GENERIC_COMMAND_CONFIG = {
  default_member_permissions: IS_IN_DEV ? ['Administrator'] : undefined,
  integration_type: IS_IN_DEV ? 'Guild' : 'User',
  guilds: IS_IN_DEV ? [DEV_GUILD_ID] : undefined,
} satisfies Omit<CommandConfig, 'description'>
