import { pinoLogger } from '../../lib/pino'

export const logger = pinoLogger.child({ module: 'bot' })
