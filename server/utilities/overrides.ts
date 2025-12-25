import { logger } from '@/server/lib/pino'

export function overrideConsole() {
  // const originalConsole = console

  console.log = (...args) => {
    logger.info(args.join(' '))
  }
  console.error = (...args) => {
    logger.error(args.join(' '))
  }
  console.warn = (...args) => {
    logger.warn(args.join(' '))
  }
  console.info = (...args) => {
    logger.info(args.join(' '))
  }
}
