import pino from 'pino'
import { transport } from '@/server/lib/pino'

export const logger = pino(transport).child({ module: 'bot' })
