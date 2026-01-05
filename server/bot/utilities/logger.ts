import pino from 'pino'
import { transport } from '../../lib/pino'

export const logger = pino(transport).child({ module: 'bot' })
