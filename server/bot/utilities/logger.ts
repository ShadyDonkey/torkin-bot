import { pinoLogger } from '../../lib/pino'

export const botLogger = pinoLogger.child({ module: 'bot' })
